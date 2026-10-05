package com.estateflow.auth.dto;

import com.estateflow.user.entity.RoleName;

import java.util.Set;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        Long userId,
        String fullName,
        String email,
        Set<RoleName> roles
) {
}