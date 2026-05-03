export interface Country {
  readonly code: string;
  readonly name: string;
  readonly flagEmoji: string;
  readonly electionTypes: readonly string[];
}

export interface ElectionStep {
  readonly order: number;
  readonly title: string;
  readonly description: string;
  readonly duration: string;
  readonly icon: string;
}

export interface ElectionProcess {
  readonly countryCode: string;
  readonly countryName: string;
  readonly electionType: string;
  readonly description: string;
  readonly steps: readonly ElectionStep[];
  readonly keyDates: readonly string[];
  readonly eligibilityCriteria: readonly string[];
}

export interface ElectionResponse {
  readonly id: string;
  readonly name: string;
  readonly electionDay: string;
  readonly ocdDivisionId: string;
}

export interface Official {
  readonly name: string;
  readonly party: string;
  readonly phones: readonly string[];
  readonly urls: readonly string[];
  readonly photoUrl: string | null;
}

export interface RepresentativeResponse {
  readonly officeName: string;
  readonly divisionName: string;
  readonly officials: readonly Official[];
}

export interface PollingLocation {
  readonly name: string;
  readonly address: string;
  readonly hours: string;
  readonly notes: string;
}

export interface VoterInfoResponse {
  readonly electionName: string;
  readonly electionDay: string;
  readonly pollingLocations: readonly PollingLocation[];
  readonly earlyVoteSites: readonly string[];
  readonly registrationUrl: string;
  readonly absenteeVotingUrl: string;
}

export interface CountryElectionResource {
  readonly countryCode: string;
  readonly countryName: string;
  readonly flagEmoji: string;
  readonly electionCommissionName: string;
  readonly electionCommissionUrl: string;
  readonly voterRegistrationUrl: string;
  readonly voterInfoDescription: string;
}
