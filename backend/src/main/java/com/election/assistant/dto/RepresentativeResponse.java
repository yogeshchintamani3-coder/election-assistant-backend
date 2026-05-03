package com.election.assistant.dto;

import java.util.List;

public record RepresentativeResponse(
        String officeName,
        String divisionName,
        List<Official> officials
) {
    public record Official(
            String name,
            String party,
            List<String> phones,
            List<String> urls,
            String photoUrl
    ) {}
}
