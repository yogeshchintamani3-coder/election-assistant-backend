import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Country, CountryElectionResource, ElectionProcess } from '../models/election.model';
import { environment } from '../../environments/environment';
import { retry } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ElectionService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/election-process`;

  private readonly countriesState = signal<Country[]>([]);
  private readonly selectedProcessState = signal<ElectionProcess | null>(null);
  private readonly selectedCountryResourceState = signal<CountryElectionResource | null>(null);
  private readonly loadingState = signal<boolean>(false);
  private readonly errorState = signal<string | null>(null);

  readonly countries = this.countriesState.asReadonly();
  readonly selectedProcess = this.selectedProcessState.asReadonly();
  readonly selectedCountryResource = this.selectedCountryResourceState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  readonly hasCountries = computed(() => this.countriesState().length > 0);

  loadCountries(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.http.get<Country[]>(`${this.baseUrl}/countries`).pipe(
      retry(2)
    ).subscribe({
      next: (countries) => {
        this.countriesState.set(countries);
        this.loadingState.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.errorState.set(
          err.status === 0
            ? 'Unable to connect to the server. Please check your network connection.'
            : 'Failed to load countries. Please try again.'
        );
        this.loadingState.set(false);
      }
    });
  }

  loadElectionProcess(countryCode: string, electionType: string): void {
    this.loadingState.set(true);
    this.errorState.set(null);
    this.selectedProcessState.set(null);

    this.http.get<ElectionProcess>(`${this.baseUrl}/${countryCode}/${encodeURIComponent(electionType)}`).pipe(
      retry(2)
    ).subscribe({
      next: (process) => {
        this.selectedProcessState.set(process);
        this.loadingState.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.errorState.set(
          err.status === 404
            ? 'Election process not found for this selection.'
            : 'Failed to load election process. Please try again.'
        );
        this.loadingState.set(false);
      }
    });
  }

  clearSelectedProcess(): void {
    this.selectedProcessState.set(null);
  }

  clearCountryResource(): void {
    this.selectedCountryResourceState.set(null);
  }

  loadCountryResource(countryCode: string): void {
    this.http.get<CountryElectionResource>(`${this.baseUrl}/resources/${countryCode}`).pipe(
      retry(2)
    ).subscribe({
      next: (resource) => {
        this.selectedCountryResourceState.set(resource);
      },
      error: () => {
        this.selectedCountryResourceState.set(null);
      }
    });
  }
}
