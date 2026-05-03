package com.election.assistant.service;

import com.election.assistant.dto.ElectionResponse;
import com.election.assistant.dto.RepresentativeResponse;
import com.election.assistant.dto.VoterInfoResponse;
import com.election.assistant.exception.ApiKeyNotConfiguredException;
import com.election.assistant.exception.ExternalApiException;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class GoogleCivicServiceTest {

    private MockWebServer mockWebServer;
    private GoogleCivicService serviceWithKey;
    private GoogleCivicService serviceWithoutKey;

    @BeforeEach
    void setUp() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();

        WebClient webClient = WebClient.builder()
                .baseUrl(mockWebServer.url("/").toString())
                .build();

        serviceWithKey = new GoogleCivicService(webClient, "test-api-key");
        serviceWithoutKey = new GoogleCivicService(webClient, "");
    }

    @AfterEach
    void tearDown() throws IOException {
        mockWebServer.shutdown();
    }

    @Test
    void getElections_withoutApiKey_throwsApiKeyNotConfigured() {
        assertThrows(ApiKeyNotConfiguredException.class, serviceWithoutKey::getElections);
    }

    @Test
    void getElections_withValidResponse_returnsMappedElections() {
        String json = """
                {
                  "elections": [
                    {
                      "id": "2000",
                      "name": "VIP Election",
                      "electionDay": "2024-11-05",
                      "ocdDivisionId": "ocd-division/country:us"
                    }
                  ]
                }
                """;
        mockWebServer.enqueue(new MockResponse()
                .setBody(json)
                .addHeader("Content-Type", "application/json"));

        List<ElectionResponse> elections = serviceWithKey.getElections();

        assertEquals(1, elections.size());
        assertEquals("2000", elections.get(0).id());
        assertEquals("VIP Election", elections.get(0).name());
        assertEquals("2024-11-05", elections.get(0).electionDay());
    }

    @Test
    void getElections_withEmptyResponse_returnsEmptyList() {
        mockWebServer.enqueue(new MockResponse()
                .setBody("{}")
                .addHeader("Content-Type", "application/json"));

        List<ElectionResponse> elections = serviceWithKey.getElections();
        assertTrue(elections.isEmpty());
    }

    @Test
    void getElections_withServerError_throwsExternalApiException() {
        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(500)
                .setBody("Internal Server Error"));

        assertThrows(ExternalApiException.class, serviceWithKey::getElections);
    }

    @Test
    void getRepresentatives_withoutApiKey_throwsApiKeyNotConfigured() {
        assertThrows(ApiKeyNotConfiguredException.class,
                () -> serviceWithoutKey.getRepresentatives("1600 Pennsylvania Ave"));
    }

    @Test
    void getRepresentatives_withValidResponse_returnsMappedData() {
        String json = """
                {
                  "divisions": {
                    "ocd-division/country:us": {
                      "name": "United States"
                    }
                  },
                  "offices": [
                    {
                      "name": "President of the United States",
                      "divisionId": "ocd-division/country:us",
                      "officialIndices": [0]
                    }
                  ],
                  "officials": [
                    {
                      "name": "Joe Biden",
                      "party": "Democratic Party",
                      "phones": ["(202) 456-1111"],
                      "urls": ["https://www.whitehouse.gov"],
                      "photoUrl": "https://example.com/photo.jpg"
                    }
                  ]
                }
                """;
        mockWebServer.enqueue(new MockResponse()
                .setBody(json)
                .addHeader("Content-Type", "application/json"));

        List<RepresentativeResponse> reps = serviceWithKey.getRepresentatives("1600 Pennsylvania Ave");

        assertEquals(1, reps.size());
        assertEquals("President of the United States", reps.get(0).officeName());
        assertEquals("United States", reps.get(0).divisionName());
        assertEquals(1, reps.get(0).officials().size());
        assertEquals("Joe Biden", reps.get(0).officials().get(0).name());
    }

    @Test
    void getRepresentatives_withNullResponse_returnsEmptyList() {
        mockWebServer.enqueue(new MockResponse()
                .setBody("null")
                .addHeader("Content-Type", "application/json"));

        List<RepresentativeResponse> reps = serviceWithKey.getRepresentatives("nowhere");
        assertTrue(reps.isEmpty());
    }

    @Test
    void getVoterInfo_withoutApiKey_throwsApiKeyNotConfigured() {
        assertThrows(ApiKeyNotConfiguredException.class,
                () -> serviceWithoutKey.getVoterInfo("123 Main St", "2000"));
    }

    @Test
    void getVoterInfo_withValidResponse_returnsMappedData() {
        String json = """
                {
                  "election": {
                    "name": "General Election",
                    "electionDay": "2024-11-05"
                  },
                  "pollingLocations": [
                    {
                      "name": "City Hall",
                      "address": {
                        "line1": "100 Main St",
                        "city": "Springfield",
                        "state": "IL",
                        "zip": "62701"
                      },
                      "pollingHours": "7am - 7pm",
                      "notes": "Enter through side door"
                    }
                  ],
                  "earlyVoteSites": [],
                  "state": [
                    {
                      "electionAdministrationBody": {
                        "electionRegistrationUrl": "https://vote.org",
                        "absenteeVotingInfoUrl": "https://absentee.vote.org"
                      }
                    }
                  ]
                }
                """;
        mockWebServer.enqueue(new MockResponse()
                .setBody(json)
                .addHeader("Content-Type", "application/json"));

        VoterInfoResponse info = serviceWithKey.getVoterInfo("123 Main St", "2000");

        assertNotNull(info);
        assertEquals("General Election", info.electionName());
        assertEquals("2024-11-05", info.electionDay());
        assertEquals(1, info.pollingLocations().size());
        assertEquals("City Hall", info.pollingLocations().get(0).name());
        assertEquals("https://vote.org", info.registrationUrl());
    }

    @Test
    void getVoterInfo_with404_throwsExternalApiException() {
        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(404)
                .setBody("Not Found"));

        assertThrows(ExternalApiException.class,
                () -> serviceWithKey.getVoterInfo("unknown", "9999"));
    }
}
