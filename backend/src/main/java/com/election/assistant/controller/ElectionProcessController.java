package com.election.assistant.controller;

import com.election.assistant.dto.CountryElectionResource;
import com.election.assistant.model.Country;
import com.election.assistant.model.ElectionProcess;
import com.election.assistant.service.ElectionProcessService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/election-process")
@Tag(name = "Election Process", description = "Educational election process information for multiple countries")
public class ElectionProcessController {

    private final ElectionProcessService electionProcessService;

    public ElectionProcessController(ElectionProcessService electionProcessService) {
        this.electionProcessService = electionProcessService;
    }

    @GetMapping("/countries")
    @Operation(summary = "Get all available countries with election information")
    public ResponseEntity<List<Country>> getCountries() {
        return ResponseEntity.ok(electionProcessService.getAvailableCountries());
    }

    @GetMapping("/{countryCode}")
    @Operation(summary = "Get all election processes for a specific country")
    public ResponseEntity<List<ElectionProcess>> getElectionProcesses(
            @PathVariable String countryCode) {
        List<ElectionProcess> processes = electionProcessService.getElectionProcesses(countryCode);
        if (processes.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(processes);
    }

    @GetMapping("/{countryCode}/{electionType}")
    @Operation(summary = "Get a specific election process by country and type")
    public ResponseEntity<ElectionProcess> getElectionProcess(
            @PathVariable String countryCode,
            @PathVariable String electionType) {
        return ResponseEntity.ok(electionProcessService.getElectionProcess(countryCode, electionType));
    }

    @GetMapping("/resources/{countryCode}")
    @Operation(summary = "Get election commission and voter resource links for a country")
    public ResponseEntity<CountryElectionResource> getCountryResources(
            @PathVariable String countryCode) {
        return ResponseEntity.ok(electionProcessService.getCountryResource(countryCode));
    }
}
