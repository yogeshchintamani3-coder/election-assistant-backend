package com.election.assistant;

import com.election.assistant.model.Country;
import com.election.assistant.model.ElectionProcess;
import com.election.assistant.service.ElectionProcessService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ElectionAssistantApplicationTests {

    @Autowired
    private ElectionProcessService electionProcessService;

    @Test
    void contextLoads() {
    }

    @Test
    void shouldReturnAvailableCountries() {
        List<Country> countries = electionProcessService.getAvailableCountries();
        assertFalse(countries.isEmpty());
        assertEquals(5, countries.size());
    }

    @Test
    void shouldReturnUSPresidentialElection() {
        Optional<ElectionProcess> process = electionProcessService.getElectionProcess("US", "Presidential");
        assertTrue(process.isPresent());
        assertEquals(7, process.get().steps().size());
        assertEquals("United States", process.get().countryName());
    }

    @Test
    void shouldReturnIndiaGeneralElection() {
        Optional<ElectionProcess> process = electionProcessService.getElectionProcess("IN", "General (Lok Sabha)");
        assertTrue(process.isPresent());
        assertEquals(8, process.get().steps().size());
    }

    @Test
    void shouldReturnEmptyForUnknownCountry() {
        List<ElectionProcess> processes = electionProcessService.getElectionProcesses("XX");
        assertTrue(processes.isEmpty());
    }
}
