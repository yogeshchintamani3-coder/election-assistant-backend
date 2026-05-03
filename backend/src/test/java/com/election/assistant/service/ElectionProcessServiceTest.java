package com.election.assistant.service;

import com.election.assistant.dto.CountryElectionResource;
import com.election.assistant.exception.ResourceNotFoundException;
import com.election.assistant.model.Country;
import com.election.assistant.model.ElectionProcess;
import com.election.assistant.repository.CountryElectionResourceRepository;
import com.election.assistant.repository.ElectionProcessRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ElectionProcessServiceTest {

    private ElectionProcessService service;

    @BeforeEach
    void setUp() {
        ElectionProcessRepository processRepo = new ElectionProcessRepository();
        CountryElectionResourceRepository resourceRepo = new CountryElectionResourceRepository();
        service = new ElectionProcessService(processRepo, resourceRepo);
    }

    @Test
    void getAvailableCountries_returnsFiveCountries() {
        List<Country> countries = service.getAvailableCountries();
        assertEquals(5, countries.size());
    }

    @Test
    void getAvailableCountries_containsExpectedCodes() {
        List<String> codes = service.getAvailableCountries().stream()
                .map(Country::code)
                .toList();
        assertTrue(codes.containsAll(List.of("US", "IN", "GB", "AU", "CA")));
    }

    @Test
    void getElectionProcesses_usReturnsPresidentialAndCongressional() {
        List<ElectionProcess> processes = service.getElectionProcesses("US");
        assertEquals(2, processes.size());

        List<String> types = processes.stream()
                .map(ElectionProcess::electionType)
                .toList();
        assertTrue(types.contains("Presidential"));
        assertTrue(types.contains("Congressional"));
    }

    @Test
    void getElectionProcesses_indiaReturnsLokSabhaAndVidhaSabha() {
        List<ElectionProcess> processes = service.getElectionProcesses("IN");
        assertEquals(2, processes.size());
    }

    @Test
    void getElectionProcesses_unknownCountryReturnsEmptyList() {
        List<ElectionProcess> processes = service.getElectionProcesses("XX");
        assertTrue(processes.isEmpty());
    }

    @Test
    void getElectionProcesses_caseInsensitive() {
        List<ElectionProcess> processes = service.getElectionProcesses("us");
        assertFalse(processes.isEmpty());
    }

    @Test
    void getElectionProcess_usPresidentialHasSevenSteps() {
        ElectionProcess process = service.getElectionProcess("US", "Presidential");
        assertEquals(7, process.steps().size());
        assertEquals("Primary Elections & Caucuses", process.steps().get(0).title());
    }

    @Test
    void getElectionProcess_indiaLokSabhaHasEightSteps() {
        ElectionProcess process = service.getElectionProcess("IN", "General (Lok Sabha)");
        assertEquals(8, process.steps().size());
    }

    @Test
    void getElectionProcess_unknownTypeThrowsException() {
        assertThrows(ResourceNotFoundException.class, () ->
                service.getElectionProcess("US", "Nonexistent"));
    }

    @Test
    void getElectionProcess_hasKeyDatesAndEligibility() {
        ElectionProcess process = service.getElectionProcess("US", "Presidential");
        assertFalse(process.keyDates().isEmpty());
        assertFalse(process.eligibilityCriteria().isEmpty());
    }

    @Test
    void getCountryResource_usReturnsValidResource() {
        CountryElectionResource resource = service.getCountryResource("US");
        assertEquals("US", resource.countryCode());
        assertEquals("United States", resource.countryName());
        assertNotNull(resource.electionCommissionUrl());
        assertNotNull(resource.voterRegistrationUrl());
    }

    @Test
    void getCountryResource_indiaReturnsValidResource() {
        CountryElectionResource resource = service.getCountryResource("IN");
        assertEquals("India", resource.countryName());
        assertTrue(resource.electionCommissionUrl().contains("eci.gov.in"));
    }

    @Test
    void getCountryResource_allCountriesHaveResources() {
        for (Country country : service.getAvailableCountries()) {
            CountryElectionResource resource = service.getCountryResource(country.code());
            assertNotNull(resource);
            assertEquals(country.code(), resource.countryCode());
        }
    }

    @Test
    void getCountryResource_unknownCountryThrowsException() {
        assertThrows(ResourceNotFoundException.class, () ->
                service.getCountryResource("XX"));
    }
}
