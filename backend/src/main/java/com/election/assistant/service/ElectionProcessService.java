package com.election.assistant.service;

import com.election.assistant.model.Country;
import com.election.assistant.model.ElectionProcess;
import com.election.assistant.model.ElectionStep;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Provides educational election process data for multiple countries.
 * In production this could be backed by a database; here we use in-memory data
 * to serve as a comprehensive reference.
 */
@Service
public class ElectionProcessService {

    private final Map<String, List<ElectionProcess>> processData = new ConcurrentHashMap<>();
    private final List<Country> countries;

    public ElectionProcessService() {
        this.countries = initCountries();
        initProcessData();
    }

    public List<Country> getAvailableCountries() {
        return countries;
    }

    public List<ElectionProcess> getElectionProcesses(String countryCode) {
        return processData.getOrDefault(countryCode.toUpperCase(), List.of());
    }

    public Optional<ElectionProcess> getElectionProcess(String countryCode, String electionType) {
        return processData.getOrDefault(countryCode.toUpperCase(), List.of()).stream()
                .filter(p -> p.electionType().equalsIgnoreCase(electionType))
                .findFirst();
    }

    private List<Country> initCountries() {
        return List.of(
                new Country("US", "United States", "\uD83C\uDDFA\uD83C\uDDF8",
                        List.of("Presidential", "Congressional", "State", "Local")),
                new Country("IN", "India", "\uD83C\uDDEE\uD83C\uDDF3",
                        List.of("General (Lok Sabha)", "State Assembly (Vidhan Sabha)", "Local Body")),
                new Country("GB", "United Kingdom", "\uD83C\uDDEC\uD83C\uDDE7",
                        List.of("General Election", "Local Elections", "By-Elections")),
                new Country("AU", "Australia", "\uD83C\uDDE6\uD83C\uDDFA",
                        List.of("Federal", "State", "Local")),
                new Country("CA", "Canada", "\uD83C\uDDE8\uD83C\uDDE6",
                        List.of("Federal", "Provincial", "Municipal"))
        );
    }

    private void initProcessData() {
        processData.put("US", List.of(
                new ElectionProcess("US", "United States", "Presidential",
                        "The U.S. presidential election occurs every four years. The process spans over a year from primaries to inauguration.",
                        List.of(
                                new ElectionStep(1, "Primary Elections & Caucuses",
                                        "State-by-state contests where party members vote for their preferred presidential candidate. Primaries are direct votes; caucuses are local meetings.",
                                        "February - June (Election Year)", "ballot"),
                                new ElectionStep(2, "National Conventions",
                                        "Each major party holds a convention to officially nominate their presidential and vice-presidential candidates. Delegates cast their votes.",
                                        "July - August", "people"),
                                new ElectionStep(3, "General Election Campaign",
                                        "Nominated candidates campaign across the country, participate in debates, and present their platforms to voters.",
                                        "September - November", "megaphone"),
                                new ElectionStep(4, "Election Day",
                                        "Citizens cast their votes. Voters actually vote for electors in the Electoral College who then vote for president.",
                                        "First Tuesday after first Monday in November", "vote"),
                                new ElectionStep(5, "Electoral College Vote",
                                        "538 electors cast official votes. A candidate needs 270 electoral votes to win. Electors typically vote according to their state's popular vote.",
                                        "First Monday after second Wednesday in December", "building"),
                                new ElectionStep(6, "Congressional Certification",
                                        "Congress meets in joint session to count and certify the Electoral College votes. The Vice President presides.",
                                        "January 6", "gavel"),
                                new ElectionStep(7, "Inauguration",
                                        "The new president takes the oath of office and begins their four-year term.",
                                        "January 20", "flag")
                        ),
                        List.of("Iowa Caucus (February)", "Super Tuesday (March)", "Election Day (November)", "Inauguration (January 20)"),
                        List.of("Must be a U.S. citizen", "Must be at least 18 years old on Election Day", "Must be registered to vote in your state", "Must meet state residency requirements")
                ),
                new ElectionProcess("US", "United States", "Congressional",
                        "Congressional elections determine members of the U.S. Senate and House of Representatives.",
                        List.of(
                                new ElectionStep(1, "Candidate Filing",
                                        "Candidates file paperwork and meet requirements to run for office. Requirements differ for Senate (30 years old, 9-year citizen) and House (25 years old, 7-year citizen).",
                                        "Varies by state", "document"),
                                new ElectionStep(2, "Primary Elections",
                                        "Party members vote to select their nominee for the general election.",
                                        "March - September", "ballot"),
                                new ElectionStep(3, "General Campaign",
                                        "Nominated candidates campaign in their district (House) or state (Senate).",
                                        "After primaries - November", "megaphone"),
                                new ElectionStep(4, "Election Day",
                                        "All 435 House seats and roughly 1/3 of Senate seats (33 or 34) are up for election every two years.",
                                        "First Tuesday after first Monday in November", "vote"),
                                new ElectionStep(5, "Certification & Seating",
                                        "Results are certified by state officials. New members are sworn in at the start of the new Congress.",
                                        "January 3 of odd-numbered years", "building")
                        ),
                        List.of("Primary Elections (varies by state)", "Election Day (November, even years)", "New Congress Seated (January 3)"),
                        List.of("Must be a U.S. citizen", "Must be at least 18 years old", "Must be registered to vote", "Must reside in the district/state")
                )
        ));

        processData.put("IN", List.of(
                new ElectionProcess("IN", "India", "General (Lok Sabha)",
                        "India's general elections are the largest democratic exercise in the world, with over 900 million eligible voters. The Election Commission of India conducts elections in multiple phases.",
                        List.of(
                                new ElectionStep(1, "Election Commission Announcement",
                                        "The Election Commission of India announces election dates and the Model Code of Conduct comes into effect immediately, restricting government actions.",
                                        "45-60 days before results", "announcement"),
                                new ElectionStep(2, "Nomination Filing",
                                        "Candidates file nomination papers in their constituency. A security deposit is required. Symbols are allotted to candidates by the ECI.",
                                        "2 weeks after announcement", "document"),
                                new ElectionStep(3, "Scrutiny of Nominations",
                                        "Returning Officers examine nomination papers for eligibility and validity. Invalid nominations are rejected.",
                                        "Within days of last nomination date", "search"),
                                new ElectionStep(4, "Withdrawal of Candidature",
                                        "Candidates may withdraw their nomination within the specified period.",
                                        "2 days after scrutiny", "exit"),
                                new ElectionStep(5, "Election Campaign",
                                        "Parties and candidates campaign. Campaign must end 48 hours before polling. No campaigning allowed during the 'silence period'.",
                                        "Until 48 hours before each phase", "megaphone"),
                                new ElectionStep(6, "Polling (Multi-Phase)",
                                        "Voting occurs using Electronic Voting Machines (EVMs) with VVPAT. India votes in multiple phases (typically 5-7) across different states to ensure security.",
                                        "Spread over 1-2 months", "vote"),
                                new ElectionStep(7, "Counting & Results",
                                        "Votes are counted simultaneously across all constituencies on a single day. EVM results are matched with VVPAT paper trails on a sample basis.",
                                        "Single day, weeks after last phase", "chart"),
                                new ElectionStep(8, "Government Formation",
                                        "The party/coalition with majority (272+ seats out of 543) is invited by the President to form the government. The PM is sworn in.",
                                        "Within days of results", "building")
                        ),
                        List.of("Model Code of Conduct begins", "Nomination Period", "Campaign Period (ends 48h before polling)", "Polling Phases (1-7)", "Counting Day", "Government Formation"),
                        List.of("Must be an Indian citizen", "Must be at least 18 years old on the qualifying date", "Must be registered in the electoral roll", "Must not be disqualified under any law", "Must have a valid voter ID (EPIC) or alternative ID")
                ),
                new ElectionProcess("IN", "India", "State Assembly (Vidhan Sabha)",
                        "State Assembly elections follow a similar process to general elections but are confined to a single state. The ECI conducts these independently of Lok Sabha elections.",
                        List.of(
                                new ElectionStep(1, "ECI Schedule Announcement",
                                        "Election Commission announces dates for the state. Model Code of Conduct applies within the state.",
                                        "45-60 days before results", "announcement"),
                                new ElectionStep(2, "Nomination & Scrutiny",
                                        "Candidates file nominations in their assembly constituency. Papers are scrutinized for eligibility.",
                                        "As per ECI schedule", "document"),
                                new ElectionStep(3, "Campaign Period",
                                        "Campaigning with rallies, door-to-door outreach, media campaigns. Ends 48 hours before polling.",
                                        "2-4 weeks", "megaphone"),
                                new ElectionStep(4, "Polling",
                                        "Voting via EVMs with VVPAT. May occur in 1-3 phases depending on the state's size and security needs.",
                                        "1-3 phases", "vote"),
                                new ElectionStep(5, "Counting & Results",
                                        "Votes counted; party/coalition with majority in the state assembly forms the government.",
                                        "Single day", "chart"),
                                new ElectionStep(6, "Chief Minister Oath",
                                        "The leader of the majority party/coalition is sworn in as Chief Minister by the Governor.",
                                        "Within days of results", "flag")
                        ),
                        List.of("ECI Announcement", "Nomination Period", "Polling Day(s)", "Counting Day"),
                        List.of("Must be an Indian citizen", "Must be at least 18 years old", "Must be registered in the state's electoral roll", "Must possess valid voter ID")
                )
        ));

        processData.put("GB", List.of(
                new ElectionProcess("GB", "United Kingdom", "General Election",
                        "UK General Elections elect members of the House of Commons. The Prime Minister can call an election at any time (with some constraints from the Dissolution and Calling of Parliament Act 2022).",
                        List.of(
                                new ElectionStep(1, "Parliament Dissolution",
                                        "The monarch dissolves Parliament on the PM's advice, or Parliament reaches its 5-year maximum term. A 25-working-day election period begins.",
                                        "25 working days before election", "gavel"),
                                new ElectionStep(2, "Candidate Nominations",
                                        "Candidates register with their local returning officer. They need 10 signatures from registered voters in the constituency and pay a £500 deposit.",
                                        "Within 6 working days of dissolution", "document"),
                                new ElectionStep(3, "Campaign Period",
                                        "Parties publish manifestos and campaign nationally and locally. Strict spending limits apply to both parties and individual candidates.",
                                        "~3-5 weeks", "megaphone"),
                                new ElectionStep(4, "Polling Day",
                                        "Voters mark an X next to their preferred candidate on a paper ballot. Uses First-Past-The-Post system — highest vote count wins each constituency.",
                                        "Usually a Thursday", "vote"),
                                new ElectionStep(5, "Counting & Results",
                                        "Votes are counted overnight at local centres. Results declared constituency by constituency throughout the night.",
                                        "Night of polling day into next morning", "chart"),
                                new ElectionStep(6, "Government Formation",
                                        "The leader of the party winning a majority (326+ of 650 seats) is invited by the monarch to form a government and becomes Prime Minister.",
                                        "Day after results", "building")
                        ),
                        List.of("Parliament Dissolved", "Nomination Deadline", "Polling Day (Thursday)", "Results Night", "PM Appointed"),
                        List.of("Must be a British, Irish, or qualifying Commonwealth citizen", "Must be at least 18 years old", "Must be registered to vote", "Must not be legally excluded (e.g., serving prisoners in some cases)")
                )
        ));

        processData.put("AU", List.of(
                new ElectionProcess("AU", "Australia", "Federal",
                        "Australia uses a preferential voting (ranked-choice) system for the House of Representatives and proportional representation for the Senate. Voting is compulsory.",
                        List.of(
                                new ElectionStep(1, "Writs Issued",
                                        "The Governor-General issues writs for election on the PM's advice. This officially starts the election process and sets key dates.",
                                        "Minimum 33 days before election day", "document"),
                                new ElectionStep(2, "Nominations Close",
                                        "Candidates nominate with the Australian Electoral Commission. Deposit of AUD $2,000 (House) or $2,000 (Senate) required.",
                                        "10-27 days before election", "people"),
                                new ElectionStep(3, "Campaign Period",
                                        "Parties campaign. There is a media blackout on election advertising from midnight Wednesday before the Saturday poll.",
                                        "~5 weeks", "megaphone"),
                                new ElectionStep(4, "Election Day (Saturday)",
                                        "Voting is compulsory for enrolled citizens 18+. Voters number candidates in order of preference (House) or above/below the line (Senate).",
                                        "Always a Saturday", "vote"),
                                new ElectionStep(5, "Counting",
                                        "Preferences are distributed until a candidate achieves >50% in each seat (House). Senate uses complex proportional counting.",
                                        "Election night to ~2 weeks (Senate)", "chart"),
                                new ElectionStep(6, "Government Formation",
                                        "Party/coalition with House majority forms government. PM is sworn in by the Governor-General.",
                                        "Within days of clear result", "flag")
                        ),
                        List.of("Writs Issued", "Nominations Close", "Campaign Blackout (Wednesday)", "Election Day (Saturday)", "Full Senate Count (~2 weeks)"),
                        List.of("Must be an Australian citizen", "Must be at least 18 years old", "Must be enrolled to vote (compulsory)", "Voting is compulsory — fines for non-voting")
                )
        ));

        processData.put("CA", List.of(
                new ElectionProcess("CA", "Canada", "Federal",
                        "Canadian federal elections use a First-Past-The-Post system to elect Members of Parliament to the House of Commons. Elections must occur within 4 years of the last election.",
                        List.of(
                                new ElectionStep(1, "Dissolution of Parliament",
                                        "The Governor General dissolves Parliament on the PM's advice. The minimum election period is 36 days.",
                                        "36-50 days before election", "gavel"),
                                new ElectionStep(2, "Nomination Period",
                                        "Candidates file nomination papers with Elections Canada. Need 100 signatures and a $1,000 deposit (refunded if they get 10%+ of votes).",
                                        "Within 21 days of writs", "document"),
                                new ElectionStep(3, "Campaign",
                                        "Parties release platforms, leaders debate on TV, candidates canvass. Strict spending limits enforced by Elections Canada.",
                                        "~5 weeks", "megaphone"),
                                new ElectionStep(4, "Advance Polls",
                                        "Early voting available on specific days before election day for those unable to vote on election day.",
                                        "10th, 9th, 8th, and 7th days before election day", "calendar"),
                                new ElectionStep(5, "Election Day",
                                        "Voters mark an X for one candidate in their riding (constituency). 338 ridings across Canada. Staggered closing times across time zones.",
                                        "Fixed date: 3rd Monday in October (unless minority government)", "vote"),
                                new ElectionStep(6, "Results & Government Formation",
                                        "Party winning 170+ seats forms majority government. Otherwise, largest party may form minority government with or without coalition support.",
                                        "Election night / following days", "building")
                        ),
                        List.of("Parliament Dissolved", "Nominations Close", "Advance Polls", "Election Day (Monday)", "Government Sworn In"),
                        List.of("Must be a Canadian citizen", "Must be at least 18 years old on election day", "Must be on the voters list or register at the poll", "Must prove identity and address")
                )
        ));
    }
}
