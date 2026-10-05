package com.estateflow.auth.service;

import com.estateflow.auth.dto.CurrentUserResponse;
import com.estateflow.auth.dto.LoginRequest;
import com.estateflow.auth.dto.LoginResponse;
import com.estateflow.auth.dto.RegisterRequest;
import com.estateflow.auth.dto.RegisterResponse;
import com.estateflow.common.exception.BadRequestException;
import com.estateflow.common.exception.ConflictException;
import com.estateflow.common.exception.InvalidCredentialsException;
import com.estateflow.common.exception.ResourceNotFoundException;
import com.estateflow.security.JwtService;
import com.estateflow.user.entity.Role;
import com.estateflow.user.entity.RoleName;
import com.estateflow.user.entity.User;
import com.estateflow.user.repository.RoleRepository;
import com.estateflow.user.repository.UserRepository;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final AuthenticationManager authenticationManager;

	public AuthService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder,
			JwtService jwtService, AuthenticationManager authenticationManager) {

		this.userRepository = userRepository;
		this.roleRepository = roleRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
		this.authenticationManager = authenticationManager;
	}

	@Transactional
	public RegisterResponse register(RegisterRequest request) {

		String email = request.email().trim().toLowerCase();

		if (userRepository.existsByEmail(email)) {
			throw new ConflictException("Email is already registered");
		}

		if (request.phone() != null && !request.phone().isBlank() && userRepository.existsByPhone(request.phone())) {
			throw new ConflictException("Phone number is already registered");
		}

		if (request.role() == RoleName.ADMIN) {
			throw new BadRequestException("ADMIN role cannot be selected during public registration");
		}

		Role role = roleRepository.findByName(request.role())
				.orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.role()));

		User user = new User();
		user.setFullName(request.fullName().trim());
		user.setEmail(email);
		user.setPhone(request.phone() == null || request.phone().isBlank() ? null : request.phone());
		user.setPasswordHash(passwordEncoder.encode(request.password()));
		user.getRoles().add(role);

		User savedUser = userRepository.save(user);

		Set<RoleName> roles = savedUser.getRoles().stream().map(Role::getName).collect(Collectors.toSet());

		return new RegisterResponse(savedUser.getId(), savedUser.getFullName(), savedUser.getEmail(),
				savedUser.getPhone(), roles);
	}

	@Transactional(readOnly = true)
	public LoginResponse login(LoginRequest request) {

		String email = request.email().trim().toLowerCase();

		try {

			authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));

		} catch (BadCredentialsException ex) {

			throw new InvalidCredentialsException("Invalid email or password");

		} catch (DisabledException ex) {

			throw new InvalidCredentialsException("User account is not active");

		} catch (AuthenticationException ex) {

			throw new InvalidCredentialsException("Invalid email or password");
		}

		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

		String token = jwtService.generateToken(user);

		Set<RoleName> roles = user.getRoles().stream().map(Role::getName).collect(Collectors.toSet());

		return new LoginResponse(token, "Bearer", jwtService.getExpirationSeconds(), user.getId(), user.getFullName(),
				user.getEmail(), roles);
	}

	@Transactional(readOnly = true)
	public CurrentUserResponse getCurrentUser(String email) {

		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		Set<RoleName> roles = user.getRoles().stream().map(Role::getName).collect(Collectors.toSet());

		return new CurrentUserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getPhone(), roles);
	}
}