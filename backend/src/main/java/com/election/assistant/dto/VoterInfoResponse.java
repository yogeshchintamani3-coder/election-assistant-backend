package com.election.assistant.dto;

import java.util.List;

public record VoterInfoResponse(
        String electionName,
        String electionDay,
        List<PollingLocation> pollingLocations,
        List<String> earlyVoteSites,
        String registrationUrl,
        String absenteeVotingUrl
) {
    public record PollingLocation(
            String name,
            String address,
            String hours,
            String notes
    ) {}
}
