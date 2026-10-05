package com.estateflow.auth.dto;

import com.estateflow.user.entity.RoleName;

import java.util.Set;

public record CurrentUserResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        Set<RoleName> roles
) {
}