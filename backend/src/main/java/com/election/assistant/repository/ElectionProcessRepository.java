package com.election.assistant.repository;

import com.election.assistant.model.Country;
import com.election.assistant.model.ElectionProcess;
import com.election.assistant.model.ElectionStep;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class ElectionProcessRepository {

    private final Map<String, List<ElectionProcess>> processData = new ConcurrentHashMap<>();
    private final List<Country> countries;

    public ElectionProcessRepository() {
        this.countries = initCountries();
        initProcessData();
    }

    public List<Country> findAllCountries() {
        return countries;
    }

    public List<ElectionProcess> findByCountryCode(String countryCode) {
        return processData.getOrDefault(countryCode.toUpperCase(), List.of());
    }

    public Optional<ElectionProcess> findByCountryCodeAndElectionType(String countryCode, String electionType) {
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

    @SuppressWarnings("java:S3776")
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
                ),
                new ElectionProcess("US", "United States", "State",
                        "State elections choose governors, state legislators, attorneys general, and other state-level officials. Each state sets its own election rules and schedule.",
                        List.of(
                                new ElectionStep(1, "Candidate Filing & Petitions",
                                        "Candidates file to run for state office. Requirements vary by state and position \u2014 some require petition signatures, filing fees, or both.",
                                        "Several months before election", "document"),
                                new ElectionStep(2, "State Primary Elections",
                                        "Party primaries to select nominees. Some states use open primaries (any voter), others use closed primaries (registered party members only).",
                                        "Varies by state (spring/summer)", "ballot"),
                                new ElectionStep(3, "Campaign Period",
                                        "Candidates campaign statewide (governor) or within their district (state legislature). State campaign finance laws apply.",
                                        "After primaries through election day", "megaphone"),
                                new ElectionStep(4, "Election Day",
                                        "Voters cast ballots for state offices. Governor races are typically in even non-presidential years, though some states differ.",
                                        "First Tuesday after first Monday in November", "vote"),
                                new ElectionStep(5, "Certification & Inauguration",
                                        "State election boards certify results. Elected officials are sworn in on dates set by each state's constitution.",
                                        "Weeks after election day", "flag")
                        ),
                        List.of("Primary Elections (varies by state)", "Election Day (November)", "Inauguration (January)"),
                        List.of("Must be a U.S. citizen", "Must be at least 18 years old", "Must be registered to vote in the state", "Must meet state-specific residency requirements")
                ),
                new ElectionProcess("US", "United States", "Local",
                        "Local elections choose mayors, city council members, school board members, sheriffs, judges, and other municipal officials. Rules vary widely by jurisdiction.",
                        List.of(
                                new ElectionStep(1, "Candidate Filing",
                                        "Candidates file with the local election authority. Some positions are nonpartisan. Requirements vary by municipality.",
                                        "Months before election", "document"),
                                new ElectionStep(2, "Primary or Qualifying Round",
                                        "Some cities hold primaries or qualifying rounds. Many local races are nonpartisan and may use runoff systems.",
                                        "Varies by jurisdiction", "ballot"),
                                new ElectionStep(3, "Campaign",
                                        "Candidates campaign within their city, county, or district. Local issues like zoning, schools, and public safety dominate.",
                                        "Weeks before election", "megaphone"),
                                new ElectionStep(4, "Election Day",
                                        "Voters choose local officials. Held in November in most places, but some cities hold elections in spring or at odd-year intervals.",
                                        "Varies \u2014 often November or spring", "vote"),
                                new ElectionStep(5, "Results & Swearing In",
                                        "Results are certified by the local election board. Elected officials take office per local charter timelines.",
                                        "Days to weeks after election", "building")
                        ),
                        List.of("Filing Deadline (varies)", "Primary/Qualifying (if applicable)", "Election Day (varies by city/county)"),
                        List.of("Must be a U.S. citizen", "Must be at least 18 years old", "Must be registered to vote", "Must reside within the jurisdiction")
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
                ),
                new ElectionProcess("IN", "India", "Local Body",
                        "Local body elections in India elect members to Panchayats (rural) and Municipalities/Corporations (urban). Conducted by the State Election Commission as per the 73rd and 74th Constitutional Amendments.",
                        List.of(
                                new ElectionStep(1, "State Election Commission Notification",
                                        "The State Election Commission announces the schedule for local body elections. Reservation of seats for SC/ST/OBC and women is finalized.",
                                        "Weeks before nominations", "announcement"),
                                new ElectionStep(2, "Nomination & Scrutiny",
                                        "Candidates file nominations at the local returning officer. Papers are scrutinized. Wards are drawn based on population.",
                                        "As per SEC schedule", "document"),
                                new ElectionStep(3, "Campaign",
                                        "Candidates campaign at the ward/village level. Local issues like water, roads, sanitation, and development dominate.",
                                        "1-2 weeks", "megaphone"),
                                new ElectionStep(4, "Polling Day",
                                        "Voters elect members to Gram Panchayat, Taluk/Block Panchayat, Zilla Parishad (rural) or Municipal Council/Corporation (urban).",
                                        "Single day or multiple phases", "vote"),
                                new ElectionStep(5, "Counting & Results",
                                        "Votes counted and results declared. Elected members choose the Sarpanch/Mayor or they are directly elected depending on the state's rules.",
                                        "Day after polling", "chart")
                        ),
                        List.of("SEC Notification", "Nomination Period", "Polling Day", "Results"),
                        List.of("Must be an Indian citizen", "Must be at least 21 years old (for candidates)", "Must be at least 18 years old to vote", "Must be registered in the local electoral roll")
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
                                        "Candidates register with their local returning officer. They need 10 signatures from registered voters in the constituency and pay a \u00A3500 deposit.",
                                        "Within 6 working days of dissolution", "document"),
                                new ElectionStep(3, "Campaign Period",
                                        "Parties publish manifestos and campaign nationally and locally. Strict spending limits apply to both parties and individual candidates.",
                                        "~3-5 weeks", "megaphone"),
                                new ElectionStep(4, "Polling Day",
                                        "Voters mark an X next to their preferred candidate on a paper ballot. Uses First-Past-The-Post system \u2014 highest vote count wins each constituency.",
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
                ),
                new ElectionProcess("GB", "United Kingdom", "Local Elections",
                        "Local elections in England choose councillors for district, borough, county, and unitary authorities. They are held on the first Thursday in May, though not all councils elect at the same time.",
                        List.of(
                                new ElectionStep(1, "Notice of Election",
                                        "The local authority publishes a Notice of Election, formally starting the process. The electoral register is finalized.",
                                        "25 working days before polling", "announcement"),
                                new ElectionStep(2, "Candidate Nominations",
                                        "Candidates submit nomination papers to the returning officer. They need a proposer and seconder who are registered electors in the ward.",
                                        "19 working days before polling", "document"),
                                new ElectionStep(3, "Campaign",
                                        "Candidates canvass door-to-door and distribute leaflets. Spending limits are much lower than general elections.",
                                        "~3-4 weeks", "megaphone"),
                                new ElectionStep(4, "Polling Day",
                                        "Voters mark X on a paper ballot for their preferred candidate(s). Some wards elect multiple councillors. Polls open 7am-10pm.",
                                        "First Thursday in May", "vote"),
                                new ElectionStep(5, "Counting & Results",
                                        "Votes counted \u2014 some immediately overnight, others the next day. First-Past-The-Post in most English councils.",
                                        "Night of polling or next day", "chart")
                        ),
                        List.of("Notice of Election", "Nomination Deadline", "Polling Day (first Thursday in May)", "Results"),
                        List.of("Must be a British, Irish, EU, or qualifying Commonwealth citizen", "Must be at least 18 years old", "Must be registered to vote in the local authority area", "Must reside, work, or own property in the area")
                ),
                new ElectionProcess("GB", "United Kingdom", "By-Elections",
                        "By-elections are held to fill a vacancy in a single constituency when an MP resigns, dies, or is disqualified. They follow the same rules as general elections but for one seat only.",
                        List.of(
                                new ElectionStep(1, "Vacancy & Writ",
                                        "When an MP seat becomes vacant, the party whip or Speaker issues a writ for a by-election. The date is set by the party holding the seat.",
                                        "Weeks after vacancy", "gavel"),
                                new ElectionStep(2, "Nominations",
                                        "Candidates file nominations. Requires 10 registered electors as subscribers and a \u00A3500 deposit.",
                                        "Within days of the writ", "document"),
                                new ElectionStep(3, "Campaign",
                                        "Intense local campaigning. By-elections often attract national attention as a referendum on the government's performance.",
                                        "~3-4 weeks", "megaphone"),
                                new ElectionStep(4, "Polling Day",
                                        "Voters in the single constituency cast their ballot. Usually a Thursday. First-Past-The-Post system.",
                                        "Usually a Thursday", "vote"),
                                new ElectionStep(5, "Result",
                                        "Counted overnight. The winner is declared and takes their seat in the House of Commons immediately.",
                                        "Night of polling day", "chart")
                        ),
                        List.of("Writ Issued", "Nomination Deadline", "Polling Day", "Result Declared"),
                        List.of("Must be a British, Irish, or qualifying Commonwealth citizen", "Must be at least 18 years old", "Must be registered to vote in the constituency")
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
                        List.of("Must be an Australian citizen", "Must be at least 18 years old", "Must be enrolled to vote (compulsory)", "Voting is compulsory \u2014 fines for non-voting")
                ),
                new ElectionProcess("AU", "Australia", "State",
                        "Each Australian state and territory runs its own elections for the state/territory parliament. Most use preferential voting and have fixed four-year terms. Voting is compulsory.",
                        List.of(
                                new ElectionStep(1, "Writs Issued",
                                        "The state Governor issues writs on the Premier's advice or when the fixed term expires. The state electoral commission manages the process.",
                                        "~4 weeks before election", "document"),
                                new ElectionStep(2, "Nominations",
                                        "Candidates nominate with the state electoral commission. Deposits and nomination requirements vary by state.",
                                        "2-3 weeks before election", "people"),
                                new ElectionStep(3, "Campaign",
                                        "State-focused campaigns on health, education, transport, and policing. Advertising blackout applies in the final days.",
                                        "~4 weeks", "megaphone"),
                                new ElectionStep(4, "Election Day",
                                        "Compulsory voting on a Saturday. Preferential voting for lower house; upper house methods vary by state.",
                                        "Saturday (fixed date in most states)", "vote"),
                                new ElectionStep(5, "Counting & Government Formation",
                                        "Preferences distributed. The party/coalition winning a majority in the lower house forms government. The Premier is sworn in by the Governor.",
                                        "Election night to days after", "flag")
                        ),
                        List.of("Writs Issued", "Nominations Close", "Election Day (Saturday)", "Government Sworn In"),
                        List.of("Must be an Australian citizen", "Must be at least 18 years old", "Must be enrolled in the state", "Voting is compulsory")
                ),
                new ElectionProcess("AU", "Australia", "Local",
                        "Local government elections choose councillors and mayors for cities, shires, and municipalities. Rules vary by state \u2014 some states have compulsory voting for local elections, others do not.",
                        List.of(
                                new ElectionStep(1, "Election Notice",
                                        "The state electoral commission or local council publishes the election notice and timeline. Electoral rolls are closed.",
                                        "Weeks before election", "announcement"),
                                new ElectionStep(2, "Nominations",
                                        "Candidates nominate for councillor or mayor positions. Requirements vary by council and state legislation.",
                                        "1-2 weeks before election", "document"),
                                new ElectionStep(3, "Campaign",
                                        "Candidates campaign on local issues: roads, rates, waste, planning, and community facilities. Spending limits are low.",
                                        "2-3 weeks", "megaphone"),
                                new ElectionStep(4, "Election Day",
                                        "Voting may be in-person or postal depending on the state. Some states use compulsory voting, others voluntary. Preferential or first-past-the-post depending on state.",
                                        "Varies by state", "vote"),
                                new ElectionStep(5, "Results",
                                        "Votes are counted and results declared. Elected councillors attend the first meeting where the mayor may be chosen (if not directly elected).",
                                        "Days after election", "chart")
                        ),
                        List.of("Nominations Open", "Nominations Close", "Election Day (varies)", "Results Declared"),
                        List.of("Must be an Australian citizen or eligible British subject", "Must be at least 18 years old", "Must be enrolled in the local government area", "Compulsory in some states (e.g., QLD, SA)")
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
                ),
                new ElectionProcess("CA", "Canada", "Provincial",
                        "Provincial elections elect members to the provincial legislature. Each province has its own electoral laws, fixed election dates, and electoral boundaries commissions.",
                        List.of(
                                new ElectionStep(1, "Writs of Election",
                                        "The Lieutenant Governor dissolves the legislature on the Premier's advice. Fixed election date laws exist in most provinces (typically every 4 years).",
                                        "28-36 days before election", "gavel"),
                                new ElectionStep(2, "Nominations",
                                        "Candidates file with the provincial election authority. Requirements vary but typically include signatures, deposits, and party endorsement.",
                                        "Within 2 weeks of writs", "document"),
                                new ElectionStep(3, "Campaign",
                                        "Provincial parties campaign on healthcare, education, natural resources, and provincial taxation. Leaders' debates are televised.",
                                        "~4 weeks", "megaphone"),
                                new ElectionStep(4, "Advance Voting",
                                        "Most provinces offer advance voting days and special ballots for those who cannot vote on election day.",
                                        "Days before election day", "calendar"),
                                new ElectionStep(5, "Election Day",
                                        "Voters mark their ballot for the candidate in their provincial riding. First-Past-The-Post in all provinces.",
                                        "Fixed date varies by province", "vote"),
                                new ElectionStep(6, "Government Formation",
                                        "The party winning a majority of seats forms government. The leader becomes Premier and is sworn in by the Lieutenant Governor.",
                                        "Days after election", "building")
                        ),
                        List.of("Writs Issued", "Nominations Close", "Advance Polls", "Election Day", "Premier Sworn In"),
                        List.of("Must be a Canadian citizen", "Must be at least 18 years old", "Must be a resident of the province", "Must be on the provincial voters list or register")
                ),
                new ElectionProcess("CA", "Canada", "Municipal",
                        "Municipal elections choose mayors, city councillors, and school board trustees. Governed by provincial legislation, rules vary significantly across municipalities.",
                        List.of(
                                new ElectionStep(1, "Nomination Period",
                                        "Candidates file nomination papers with the municipal clerk. Filing fees and signature requirements vary by municipality.",
                                        "Months before election", "document"),
                                new ElectionStep(2, "Campaign",
                                        "Candidates campaign on local issues: property taxes, transit, housing, parks, and urban planning. Often non-partisan races.",
                                        "Weeks before election", "megaphone"),
                                new ElectionStep(3, "Advance Voting",
                                        "Many municipalities offer advance voting opportunities in the days before election day.",
                                        "Days before election day", "calendar"),
                                new ElectionStep(4, "Election Day",
                                        "Voters cast ballots for mayor, ward councillor, and often school board trustee. Most use First-Past-The-Post; some cities are adopting ranked ballots.",
                                        "Fixed date (varies by province, often October)", "vote"),
                                new ElectionStep(5, "Results & Swearing In",
                                        "Results declared on election night. Newly elected officials are sworn in at an inaugural council meeting.",
                                        "Election night; inauguration weeks later", "building")
                        ),
                        List.of("Nomination Period Opens", "Nominations Close", "Advance Voting", "Election Day", "Inaugural Council Meeting"),
                        List.of("Must be a Canadian citizen", "Must be at least 18 years old", "Must reside in the municipality", "Must be on the municipal voters list or eligible to register")
                )
        ));
    }
}
