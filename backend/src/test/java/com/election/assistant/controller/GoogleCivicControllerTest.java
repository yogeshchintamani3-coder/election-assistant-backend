package com.election.assistant.controller;

import com.election.assistant.config.GoogleTokenVerifier;
import com.election.assistant.config.JwtAuthenticationFilter;
import com.election.assistant.config.SecurityConfig;
import com.election.assistant.dto.ElectionResponse;
import com.election.assistant.dto.RepresentativeResponse;
import com.election.assistant.dto.VoterInfoResponse;
import com.election.assistant.exception.ApiKeyNotConfiguredException;
import com.election.assistant.service.GoogleCivicService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = GoogleCivicController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {SecurityConfig.class, JwtAuthenticationFilter.class, GoogleTokenVerifier.class}))
@AutoConfigureMockMvc(addFilters = false)
class GoogleCivicControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GoogleCivicService googleCivicService;

    @Test
    void getElections_returns200WithElections() throws Exception {
        List<ElectionResponse> elections = List.of(
                new ElectionResponse("2000", "General Election", "2024-11-05", "ocd:us")
        );
        when(googleCivicService.getElections()).thenReturn(elections);

        mockMvc.perform(get("/api/civic/elections"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("General Election")));
    }

    @Test
    void getElections_apiKeyNotConfigured_returns503() throws Exception {
        when(googleCivicService.getElections())
                .thenThrow(new ApiKeyNotConfiguredException("Google Civic API"));

        mockMvc.perform(get("/api/civic/elections"))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    void getRepresentatives_validAddress_returns200() throws Exception {
        List<RepresentativeResponse> reps = List.of(
                new RepresentativeResponse("President", "United States",
                        List.of(new RepresentativeResponse.Official(
                                "Test Official", "Party", List.of(), List.of(), null)))
        );
        when(googleCivicService.getRepresentatives("1600 Pennsylvania Ave")).thenReturn(reps);

        mockMvc.perform(get("/api/civic/representatives")
                        .param("address", "1600 Pennsylvania Ave"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].officeName", is("President")));
    }

    @Test
    void getRepresentatives_missingAddress_returnsNon200() throws Exception {
        mockMvc.perform(get("/api/civic/representatives"))
                .andExpect(result -> assertTrue(
                        result.getResponse().getStatus() >= 400,
                        "Expected error status but got " + result.getResponse().getStatus()));
    }

    @Test
    void getVoterInfo_validParams_returns200() throws Exception {
        VoterInfoResponse info = new VoterInfoResponse(
                "General Election", "2024-11-05", List.of(), List.of(), "", "");
        when(googleCivicService.getVoterInfo("123 Main St", "2000")).thenReturn(info);

        mockMvc.perform(get("/api/civic/voter-info")
                        .param("address", "123 Main St")
                        .param("electionId", "2000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.electionName", is("General Election")));
    }

    @Test
    void getVoterInfo_nullResult_returns404() throws Exception {
        when(googleCivicService.getVoterInfo(anyString(), anyString())).thenReturn(null);

        mockMvc.perform(get("/api/civic/voter-info")
                        .param("address", "123 Main St")
                        .param("electionId", "9999"))
                .andExpect(status().isNotFound());
    }
}
