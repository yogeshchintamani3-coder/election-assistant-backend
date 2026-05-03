package com.election.assistant.dto;

public record AuthResponse(
        String token,
        String email,
        String name,
        String picture
) {}
