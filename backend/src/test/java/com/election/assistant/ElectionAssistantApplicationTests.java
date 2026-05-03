package com.election.assistant;

import com.election.assistant.exception.ResourceNotFoundException;
import com.election.assistant.model.Country;
import com.election.assistant.model.ElectionProcess;
import com.election.assistant.service.ElectionProcessService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

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
        ElectionProcess process = electionProcessService.getElectionProcess("US", "Presidential");
        assertEquals(7, process.steps().size());
        assertEquals("United States", process.countryName());
    }

    @Test
    void shouldReturnIndiaGeneralElection() {
        ElectionProcess process = electionProcessService.getElectionProcess("IN", "General (Lok Sabha)");
        assertEquals(8, process.steps().size());
    }

    @Test
    void shouldReturnEmptyForUnknownCountry() {
        List<ElectionProcess> processes = electionProcessService.getElectionProcesses("XX");
        assertTrue(processes.isEmpty());
    }

    @Test
    void shouldThrowForUnknownElectionType() {
        assertThrows(ResourceNotFoundException.class,
                () -> electionProcessService.getElectionProcess("US", "Nonexistent"));
    }
}
