package com.election.assistant.controller;

import com.election.assistant.dto.ElectionResponse;
import com.election.assistant.dto.RepresentativeResponse;
import com.election.assistant.dto.VoterInfoResponse;
import com.election.assistant.service.GoogleCivicService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/civic")
@Tag(name = "Google Civic Information", description = "Live election data from Google Civic Information API")
public class GoogleCivicController {

    private final GoogleCivicService googleCivicService;

    public GoogleCivicController(GoogleCivicService googleCivicService) {
        this.googleCivicService = googleCivicService;
    }

    @GetMapping("/elections")
    @Operation(summary = "Get upcoming elections from Google Civic Information API")
    public ResponseEntity<List<ElectionResponse>> getElections() {
        List<ElectionResponse> elections = googleCivicService.getElections();
        return ResponseEntity.ok(elections);
    }

    @GetMapping("/representatives")
    @Operation(summary = "Find elected representatives by address")
    public ResponseEntity<List<RepresentativeResponse>> getRepresentatives(
            @RequestParam @NotBlank String address) {
        List<RepresentativeResponse> representatives = googleCivicService.getRepresentatives(address);
        return ResponseEntity.ok(representatives);
    }

    @GetMapping("/voter-info")
    @Operation(summary = "Get voter information including polling locations")
    public ResponseEntity<VoterInfoResponse> getVoterInfo(
            @RequestParam @NotBlank String address,
            @RequestParam @NotBlank String electionId) {
        VoterInfoResponse voterInfo = googleCivicService.getVoterInfo(address, electionId);
        if (voterInfo == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(voterInfo);
    }
}
