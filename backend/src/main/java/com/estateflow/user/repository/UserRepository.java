package com.estateflow.user.repository;

import com.estateflow.user.entity.RoleName;
import com.estateflow.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByEmail(String email);

	boolean existsByEmail(String email);

	boolean existsByPhone(String phone);

	Optional<User> findByIdAndRolesName(Long id, RoleName roleName);
}