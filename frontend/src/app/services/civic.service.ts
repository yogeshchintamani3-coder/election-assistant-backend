import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ElectionResponse, RepresentativeResponse, VoterInfoResponse } from '../models/election.model';
import { environment } from '../../environments/environment';
import { retry } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CivicService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/civic`;

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

    this.http.get<ElectionResponse[]>(`${this.baseUrl}/elections`).pipe(
      retry(2)
    ).subscribe({
      next: (elections) => {
        this.electionsState.set(elections);
        this.loadingState.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.errorState.set(this.getErrorMessage(err, 'load elections'));
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
    }).pipe(
      retry(2)
    ).subscribe({
      next: (reps) => {
        this.representativesState.set(reps);
        this.loadingState.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.errorState.set(this.getErrorMessage(err, 'find representatives'));
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
    }).pipe(
      retry(2)
    ).subscribe({
      next: (info) => {
        this.voterInfoState.set(info);
        this.loadingState.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.errorState.set(this.getErrorMessage(err, 'load voter information'));
        this.loadingState.set(false);
      }
    });
  }

  private getErrorMessage(err: HttpErrorResponse, action: string): string {
    if (err.status === 0) {
      return `Unable to connect to the server. Please check your network connection.`;
    }
    if (err.status === 404) {
      return `No data found for this request. The information may not be available yet.`;
    }
    if (err.status === 502) {
      return `The Google Civic API is temporarily unavailable. Please try again later.`;
    }
    return `Failed to ${action}. Please try again.`;
  }
}
