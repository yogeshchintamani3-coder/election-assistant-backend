import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Country, ElectionProcess } from '../models/election.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ElectionService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/election-process`;

  private readonly countriesState = signal<Country[]>([]);
  private readonly selectedProcessState = signal<ElectionProcess | null>(null);
  private readonly loadingState = signal<boolean>(false);
  private readonly errorState = signal<string | null>(null);

  readonly countries = this.countriesState.asReadonly();
  readonly selectedProcess = this.selectedProcessState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  readonly hasCountries = computed(() => this.countriesState().length > 0);

  loadCountries(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.http.get<Country[]>(`${this.baseUrl}/countries`).subscribe({
      next: (countries) => {
        this.countriesState.set(countries);
        this.loadingState.set(false);
      },
      error: () => {
        this.errorState.set('Failed to load countries');
        this.loadingState.set(false);
      }
    });
  }

  loadElectionProcess(countryCode: string, electionType: string): void {
    this.loadingState.set(true);
    this.errorState.set(null);
    this.selectedProcessState.set(null);

    this.http.get<ElectionProcess>(`${this.baseUrl}/${countryCode}/${encodeURIComponent(electionType)}`).subscribe({
      next: (process) => {
        this.selectedProcessState.set(process);
        this.loadingState.set(false);
      },
      error: () => {
        this.errorState.set('Failed to load election process');
        this.loadingState.set(false);
      }
    });
  }

  clearSelectedProcess(): void {
    this.selectedProcessState.set(null);
  }
}
