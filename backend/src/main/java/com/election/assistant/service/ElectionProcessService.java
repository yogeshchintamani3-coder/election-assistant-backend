package com.election.assistant.service;

import com.election.assistant.dto.CountryElectionResource;
import com.election.assistant.exception.ResourceNotFoundException;
import com.election.assistant.model.Country;
import com.election.assistant.model.ElectionProcess;
import com.election.assistant.repository.CountryElectionResourceRepository;
import com.election.assistant.repository.ElectionProcessRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ElectionProcessService {

    private final ElectionProcessRepository electionProcessRepository;
    private final CountryElectionResourceRepository resourceRepository;

    public ElectionProcessService(ElectionProcessRepository electionProcessRepository,
                                  CountryElectionResourceRepository resourceRepository) {
        this.electionProcessRepository = electionProcessRepository;
        this.resourceRepository = resourceRepository;
    }

    public List<Country> getAvailableCountries() {
        return electionProcessRepository.findAllCountries();
    }

    public List<ElectionProcess> getElectionProcesses(String countryCode) {
        return electionProcessRepository.findByCountryCode(countryCode);
    }

    public ElectionProcess getElectionProcess(String countryCode, String electionType) {
        return electionProcessRepository.findByCountryCodeAndElectionType(countryCode, electionType)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "ElectionProcess",
                        countryCode + "/" + electionType));
    }

    public CountryElectionResource getCountryResource(String countryCode) {
        return resourceRepository.findByCountryCode(countryCode)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "CountryElectionResource",
                        countryCode));
    }
}
