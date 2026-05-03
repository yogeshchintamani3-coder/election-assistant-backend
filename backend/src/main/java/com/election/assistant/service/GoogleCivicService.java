package com.election.assistant.service;

import com.election.assistant.dto.ElectionResponse;
import com.election.assistant.dto.RepresentativeResponse;
import com.election.assistant.dto.VoterInfoResponse;
import com.election.assistant.exception.ApiKeyNotConfiguredException;
import com.election.assistant.exception.ExternalApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class GoogleCivicService {

    private static final Logger log = LoggerFactory.getLogger(GoogleCivicService.class);
    private static final String SERVICE_NAME = "Google Civic Information API";

    private final WebClient webClient;
    private final String apiKey;

    public GoogleCivicService(WebClient googleCivicWebClient,
                              @Value("${google.civic.api-key}") String apiKey) {
        this.webClient = googleCivicWebClient;
        this.apiKey = apiKey;
        if (!isApiKeyConfigured()) {
            log.warn("Google Civic API key is not configured. Civic API features will be unavailable.");
        }
    }

    private boolean isApiKeyConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    private void requireApiKey() {
        if (!isApiKeyConfigured()) {
            throw new ApiKeyNotConfiguredException(SERVICE_NAME);
        }
    }

    @Cacheable(value = "elections", unless = "#result == null || #result.isEmpty()")
    @SuppressWarnings("unchecked")
    public List<ElectionResponse> getElections() {
        requireApiKey();
        try {
            Map<String, Object> response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/elections")
                            .queryParam("key", apiKey)
                            .build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null || !response.containsKey("elections")) {
                return Collections.emptyList();
            }

            List<Map<String, Object>> elections = (List<Map<String, Object>>) response.get("elections");
            return elections.stream()
                    .map(this::mapToElectionResponse)
                    .toList();
        } catch (WebClientResponseException e) {
            log.error("Google Civic API error fetching elections: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new ExternalApiException(SERVICE_NAME, e.getStatusCode().value(), e.getResponseBodyAsString());
        }
    }

    @Cacheable(value = "representatives", key = "#address", unless = "#result == null || #result.isEmpty()")
    @SuppressWarnings("unchecked")
    public List<RepresentativeResponse> getRepresentatives(String address) {
        requireApiKey();
        try {
            Map<String, Object> response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/representatives")
                            .queryParam("key", apiKey)
                            .queryParam("address", address)
                            .build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) {
                return Collections.emptyList();
            }

            return parseRepresentatives(response);
        } catch (WebClientResponseException e) {
            log.error("Google Civic API error fetching representatives for '{}': {} - {}",
                    address, e.getStatusCode(), e.getResponseBodyAsString());
            throw new ExternalApiException(SERVICE_NAME, e.getStatusCode().value(), e.getResponseBodyAsString());
        }
    }

    @Cacheable(value = "voterInfo", key = "#address + '_' + #electionId", unless = "#result == null")
    @SuppressWarnings("unchecked")
    public VoterInfoResponse getVoterInfo(String address, String electionId) {
        requireApiKey();
        try {
            Map<String, Object> response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/voterinfo")
                            .queryParam("key", apiKey)
                            .queryParam("address", address)
                            .queryParam("electionId", electionId)
                            .build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) {
                return null;
            }

            return parseVoterInfo(response);
        } catch (WebClientResponseException e) {
            log.error("Google Civic API error fetching voter info for '{}', election '{}': {} - {}",
                    address, electionId, e.getStatusCode(), e.getResponseBodyAsString());
            throw new ExternalApiException(SERVICE_NAME, e.getStatusCode().value(), e.getResponseBodyAsString());
        }
    }

    private ElectionResponse mapToElectionResponse(Map<String, Object> election) {
        return new ElectionResponse(
                String.valueOf(election.getOrDefault("id", "")),
                String.valueOf(election.getOrDefault("name", "")),
                String.valueOf(election.getOrDefault("electionDay", "")),
                String.valueOf(election.getOrDefault("ocdDivisionId", ""))
        );
    }

    @SuppressWarnings("unchecked")
    private List<RepresentativeResponse> parseRepresentatives(Map<String, Object> response) {
        List<RepresentativeResponse> result = new ArrayList<>();

        Map<String, Object> divisions = (Map<String, Object>) response.getOrDefault("divisions", Map.of());
        List<Map<String, Object>> offices = (List<Map<String, Object>>) response.getOrDefault("offices", List.of());
        List<Map<String, Object>> officials = (List<Map<String, Object>>) response.getOrDefault("officials", List.of());

        for (Map<String, Object> office : offices) {
            String officeName = String.valueOf(office.getOrDefault("name", ""));
            String divisionId = String.valueOf(office.getOrDefault("divisionId", ""));
            String divisionName = "";
            if (divisions.containsKey(divisionId)) {
                Map<String, Object> div = (Map<String, Object>) divisions.get(divisionId);
                divisionName = String.valueOf(div.getOrDefault("name", ""));
            }

            List<Integer> indices = (List<Integer>) office.getOrDefault("officialIndices", List.of());
            List<RepresentativeResponse.Official> officeOfficials = new ArrayList<>();

            for (Integer idx : indices) {
                if (idx < officials.size()) {
                    Map<String, Object> official = officials.get(idx);
                    officeOfficials.add(new RepresentativeResponse.Official(
                            String.valueOf(official.getOrDefault("name", "")),
                            String.valueOf(official.getOrDefault("party", "")),
                            (List<String>) official.getOrDefault("phones", List.of()),
                            (List<String>) official.getOrDefault("urls", List.of()),
                            (String) official.get("photoUrl")
                    ));
                }
            }

            result.add(new RepresentativeResponse(officeName, divisionName, officeOfficials));
        }

        return result;
    }

    @SuppressWarnings("unchecked")
    private VoterInfoResponse parseVoterInfo(Map<String, Object> response) {
        Map<String, Object> election = (Map<String, Object>) response.getOrDefault("election", Map.of());
        List<Map<String, Object>> pollingLocations =
                (List<Map<String, Object>>) response.getOrDefault("pollingLocations", List.of());
        List<Map<String, Object>> earlyVoteSites =
                (List<Map<String, Object>>) response.getOrDefault("earlyVoteSites", List.of());

        Map<String, Object> state = null;
        List<Map<String, Object>> stateList = (List<Map<String, Object>>) response.getOrDefault("state", List.of());
        if (!stateList.isEmpty()) {
            state = stateList.get(0);
        }

        String registrationUrl = "";
        String absenteeUrl = "";
        if (state != null) {
            Map<String, Object> electionAdmin = (Map<String, Object>) state.getOrDefault("electionAdministrationBody", Map.of());
            registrationUrl = String.valueOf(electionAdmin.getOrDefault("electionRegistrationUrl", ""));
            absenteeUrl = String.valueOf(electionAdmin.getOrDefault("absenteeVotingInfoUrl", ""));
        }

        List<VoterInfoResponse.PollingLocation> locations = pollingLocations.stream()
                .map(loc -> {
                    Map<String, Object> addr = (Map<String, Object>) loc.getOrDefault("address", Map.of());
                    String address = String.format("%s, %s, %s %s",
                            addr.getOrDefault("line1", ""),
                            addr.getOrDefault("city", ""),
                            addr.getOrDefault("state", ""),
                            addr.getOrDefault("zip", ""));
                    return new VoterInfoResponse.PollingLocation(
                            String.valueOf(loc.getOrDefault("name", "")),
                            address,
                            String.valueOf(loc.getOrDefault("pollingHours", "")),
                            String.valueOf(loc.getOrDefault("notes", ""))
                    );
                })
                .toList();

        List<String> earlyVoteAddresses = earlyVoteSites.stream()
                .map(site -> {
                    Map<String, Object> addr = (Map<String, Object>) site.getOrDefault("address", Map.of());
                    return String.format("%s - %s, %s",
                            site.getOrDefault("name", ""),
                            addr.getOrDefault("line1", ""),
                            addr.getOrDefault("city", ""));
                })
                .toList();

        return new VoterInfoResponse(
                String.valueOf(election.getOrDefault("name", "")),
                String.valueOf(election.getOrDefault("electionDay", "")),
                locations,
                earlyVoteAddresses,
                registrationUrl,
                absenteeUrl
        );
    }
}
