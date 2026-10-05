package com.estateflow.auth.service;

import com.estateflow.auth.dto.RegisterRequest;
import com.estateflow.auth.dto.RegisterResponse;
import com.estateflow.common.exception.BadRequestException;
import com.estateflow.common.exception.ConflictException;
import com.estateflow.common.exception.ResourceNotFoundException;
import com.estateflow.user.entity.Role;
import com.estateflow.user.entity.RoleName;
import com.estateflow.user.entity.User;
import com.estateflow.user.repository.RoleRepository;
import com.estateflow.user.repository.UserRepository;
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

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {

        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email is already registered");
        }

        if (request.phone() != null
                && !request.phone().isBlank()
                && userRepository.existsByPhone(request.phone())) {
            throw new ConflictException("Phone number is already registered");
        }

        if (request.role() == RoleName.ADMIN) {
            throw new BadRequestException(
                    "ADMIN role cannot be selected during public registration"
            );
        }

        Role role = roleRepository.findByName(request.role())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Role not found: " + request.role()
                        )
                );

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPhone(
                request.phone() == null || request.phone().isBlank()
                        ? null
                        : request.phone()
        );
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.getRoles().add(role);

        User savedUser = userRepository.save(user);

        Set<RoleName> roles = savedUser.getRoles()
                .stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                roles
        );
    }
}