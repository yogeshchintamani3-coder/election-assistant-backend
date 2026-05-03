package com.election.assistant.repository;

import com.election.assistant.dto.CountryElectionResource;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class CountryElectionResourceRepository {

    private final Map<String, CountryElectionResource> resourceData = new ConcurrentHashMap<>();

    public CountryElectionResourceRepository() {
        initResourceData();
    }

    public Optional<CountryElectionResource> findByCountryCode(String countryCode) {
        return Optional.ofNullable(resourceData.get(countryCode.toUpperCase()));
    }

    private void initResourceData() {
        resourceData.put("US", new CountryElectionResource(
                "US", "United States", "\uD83C\uDDFA\uD83C\uDDF8",
                "Federal Election Commission (FEC)",
                "https://www.fec.gov",
                "https://vote.gov",
                "The U.S. uses a federal system where elections are administered at the state level. Register to vote through your state's election office or vote.gov."
        ));

        resourceData.put("IN", new CountryElectionResource(
                "IN", "India", "\uD83C\uDDEE\uD83C\uDDF3",
                "Election Commission of India (ECI)",
                "https://eci.gov.in",
                "https://voters.eci.gov.in",
                "India's Election Commission manages the world's largest democratic elections. Citizens can register and check their voter status through the National Voters' Service Portal."
        ));

        resourceData.put("GB", new CountryElectionResource(
                "GB", "United Kingdom", "\uD83C\uDDEC\uD83C\uDDE7",
                "Electoral Commission",
                "https://www.electoralcommission.org.uk",
                "https://www.gov.uk/register-to-vote",
                "The UK Electoral Commission oversees elections and regulates political finance. Citizens can register to vote online through GOV.UK."
        ));

        resourceData.put("AU", new CountryElectionResource(
                "AU", "Australia", "\uD83C\uDDE6\uD83C\uDDFA",
                "Australian Electoral Commission (AEC)",
                "https://www.aec.gov.au",
                "https://www.aec.gov.au/enrol/",
                "Australia has compulsory voting for all enrolled citizens 18 and over. Enrolment is also compulsory and can be done online through the AEC website."
        ));

        resourceData.put("CA", new CountryElectionResource(
                "CA", "Canada", "\uD83C\uDDE8\uD83C\uDDE6",
                "Elections Canada",
                "https://www.elections.ca",
                "https://www.elections.ca/content.aspx?section=vot&dir=reg&lang=e",
                "Elections Canada is the independent agency responsible for conducting federal elections. Canadians can register or update their registration online."
        ));
    }
}
