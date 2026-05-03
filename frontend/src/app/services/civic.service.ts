import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ElectionResponse, RepresentativeResponse, VoterInfoResponse } from '../models/election.model';

@Injectable({ providedIn: 'root' })
export class CivicService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/civic';

  private readonly electionsState = signal<ElectionResponse[]>([]);
  private readonly representativesState = signal<RepresentativeResponse[]>([]);
  private readonly voterInfoState = signal<VoterInfoResponse | null>(null);
  private readonly loadingState = signal<boolean>(false);
  private readonly errorState = signal<string | null>(null);

  readonly elections = this.electionsState.asReadonly();
  readonly representatives = this.representativesState.asReadonly();
  readonly voterInfo = this.voterInfoState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  loadElections(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.http.get<ElectionResponse[]>(`${this.baseUrl}/elections`).subscribe({
      next: (elections) => {
        this.electionsState.set(elections);
        this.loadingState.set(false);
      },
      error: () => {
        this.errorState.set('Failed to load elections');
        this.loadingState.set(false);
      }
    });
  }

  searchRepresentatives(address: string): void {
    this.loadingState.set(true);
    this.errorState.set(null);
    this.representativesState.set([]);

    this.http.get<RepresentativeResponse[]>(`${this.baseUrl}/representatives`, {
      params: { address }
    }).subscribe({
      next: (reps) => {
        this.representativesState.set(reps);
        this.loadingState.set(false);
      },
      error: () => {
        this.errorState.set('Failed to find representatives. Please check the address.');
        this.loadingState.set(false);
      }
    });
  }

  loadVoterInfo(address: string, electionId: string): void {
    this.loadingState.set(true);
    this.errorState.set(null);
    this.voterInfoState.set(null);

    this.http.get<VoterInfoResponse>(`${this.baseUrl}/voter-info`, {
      params: { address, electionId }
    }).subscribe({
      next: (info) => {
        this.voterInfoState.set(info);
        this.loadingState.set(false);
      },
      error: () => {
        this.errorState.set('Failed to load voter information');
        this.loadingState.set(false);
      }
    });
  }
}
