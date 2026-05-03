package com.election.assistant.dto;

public record CountryElectionResource(
        String countryCode,
        String countryName,
        String flagEmoji,
        String electionCommissionName,
        String electionCommissionUrl,
        String voterRegistrationUrl,
        String voterInfoDescription
) {}
