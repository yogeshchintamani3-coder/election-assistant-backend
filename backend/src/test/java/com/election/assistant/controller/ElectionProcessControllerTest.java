package com.election.assistant.controller;

import com.election.assistant.config.GoogleTokenVerifier;
import com.election.assistant.config.JwtAuthenticationFilter;
import com.election.assistant.config.SecurityConfig;
import com.election.assistant.dto.CountryElectionResource;
import com.election.assistant.exception.ResourceNotFoundException;
import com.election.assistant.model.Country;
import com.election.assistant.model.ElectionProcess;
import com.election.assistant.model.ElectionStep;
import com.election.assistant.service.ElectionProcessService;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = ElectionProcessController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {SecurityConfig.class, JwtAuthenticationFilter.class, GoogleTokenVerifier.class}))
@AutoConfigureMockMvc(addFilters = false)
class ElectionProcessControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ElectionProcessService electionProcessService;

    @Test
    void getCountries_returns200WithCountries() throws Exception {
        List<Country> countries = List.of(
                new Country("US", "United States", "\uD83C\uDDFA\uD83C\uDDF8", List.of("Presidential")),
                new Country("IN", "India", "\uD83C\uDDEE\uD83C\uDDF3", List.of("General (Lok Sabha)"))
        );
        when(electionProcessService.getAvailableCountries()).thenReturn(countries);

        mockMvc.perform(get("/api/election-process/countries"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].code", is("US")))
                .andExpect(jsonPath("$[1].code", is("IN")));
    }

    @Test
    void getElectionProcesses_validCountry_returns200() throws Exception {
        ElectionProcess process = new ElectionProcess("US", "United States", "Presidential",
                "Description", List.of(new ElectionStep(1, "Step 1", "Desc", "Jan", "ballot")),
                List.of("Date1"), List.of("Criteria1"));
        when(electionProcessService.getElectionProcesses("US")).thenReturn(List.of(process));

        mockMvc.perform(get("/api/election-process/US"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].electionType", is("Presidential")));
    }

    @Test
    void getElectionProcesses_unknownCountry_returns404() throws Exception {
        when(electionProcessService.getElectionProcesses("XX")).thenReturn(List.of());

        mockMvc.perform(get("/api/election-process/XX"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getElectionProcess_validCountryAndType_returns200() throws Exception {
        ElectionProcess process = new ElectionProcess("US", "United States", "Presidential",
                "Description", List.of(new ElectionStep(1, "Step 1", "Desc", "Jan", "ballot")),
                List.of("Date1"), List.of("Criteria1"));
        when(electionProcessService.getElectionProcess("US", "Presidential")).thenReturn(process);

        mockMvc.perform(get("/api/election-process/US/Presidential"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.electionType", is("Presidential")))
                .andExpect(jsonPath("$.steps", hasSize(1)));
    }

    @Test
    void getElectionProcess_unknownType_returns404() throws Exception {
        when(electionProcessService.getElectionProcess("US", "Nonexistent"))
                .thenThrow(new ResourceNotFoundException("ElectionProcess", "US/Nonexistent"));

        mockMvc.perform(get("/api/election-process/US/Nonexistent"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getCountryResources_validCountry_returns200() throws Exception {
        CountryElectionResource resource = new CountryElectionResource(
                "US", "United States", "\uD83C\uDDFA\uD83C\uDDF8",
                "FEC", "https://fec.gov", "https://vote.gov", "Description");
        when(electionProcessService.getCountryResource("US")).thenReturn(resource);

        mockMvc.perform(get("/api/election-process/resources/US"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.countryCode", is("US")))
                .andExpect(jsonPath("$.electionCommissionName", is("FEC")));
    }

    @Test
    void getCountryResources_unknownCountry_returns404() throws Exception {
        when(electionProcessService.getCountryResource("XX"))
                .thenThrow(new ResourceNotFoundException("CountryElectionResource", "XX"));

        mockMvc.perform(get("/api/election-process/resources/XX"))
                .andExpect(status().isNotFound());
    }
}
