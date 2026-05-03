import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CivicService } from '../../services/civic.service';
import { ElectionService } from '../../services/election.service';
import { ErrorBannerComponent } from '../shared/error-banner/error-banner.component';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-voter-info',
  standalone: true,
  imports: [ErrorBannerComponent, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="voter-info-page">
      <div class="country-picker" role="radiogroup" aria-label="Select country">
        @for (country of countries; track country.code) {
          <button
            type="button"
            class="country-pill"
            [class.active]="selectedCountry() === country.code"
            (click)="selectCountry(country.code)"
            [attr.aria-pressed]="selectedCountry() === country.code"
            role="radio">
            <span class="country-flag">{{ country.flag }}</span>
            <span>{{ country.name }}</span>
          </button>
        }
      </div>

      @if (selectedCountry() === 'US') {
        <header class="page-header">
          <div class="header-badge">
            <span class="material-icons-outlined">location_on</span>
            Voter Resources
          </div>
          <h1 class="page-title">Voter <span class="title-gradient">Information</span></h1>
          <p class="page-subtitle">Find your polling location, early vote sites, and registration info for upcoming elections.</p>
        </header>

        <div class="search-form" [attr.aria-busy]="civicService.loading()">
          <div class="form-group">
            <label for="voter-address">Your Address</label>
            <div class="input-wrapper" [class.focused]="addressFocused()">
              <span class="material-icons-outlined" aria-hidden="true">location_on</span>
              <input
                id="voter-address"
                type="text"
                [value]="address()"
                (input)="onAddressInput($event)"
                (focus)="addressFocused.set(true)"
                (blur)="addressFocused.set(false)"
                placeholder="Enter your registered voting address"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="election-select">Select Election</label>
            <div class="input-wrapper">
              <span class="material-icons-outlined" aria-hidden="true">ballot</span>
              <select id="election-select" class="form-input" [value]="selectedElection()" (change)="onElectionChange($event)">
                @if (civicService.elections().length === 0) {
                  <option value="">No elections available</option>
                } @else {
                  <option value="">-- Select an election --</option>
                  @for (election of civicService.elections(); track election.id) {
                    <option [value]="election.id">{{ election.name }} ({{ election.electionDay }})</option>
                  }
                }
              </select>
            </div>
            @if (!civicService.loading() && civicService.elections().length === 0 && !civicService.error()) {
              <p class="helper-text">
                <span class="material-icons-outlined" aria-hidden="true">info</span>
                No upcoming elections found. Election data is provided by the Google Civic Information API.
              </p>
            }
          </div>

          <button
            type="button"
            class="submit-btn"
            (click)="lookupVoterInfo()"
            [disabled]="!address().trim() || !selectedElection() || civicService.loading()">
            @if (civicService.loading()) {
              <app-loading-spinner />
            } @else {
              <span class="material-icons-outlined" aria-hidden="true">search</span>
            }
            Find Voter Info
          </button>
        </div>

        @if (civicService.error(); as errMsg) {
          <app-error-banner [message]="errMsg" />
        }

        @if (civicService.voterInfo(); as info) {
          <div class="results" [attr.aria-busy]="civicService.loading()">
            <div class="election-banner">
              <div class="banner-icon-wrap">
                <span class="material-icons-outlined" aria-hidden="true">how_to_vote</span>
              </div>
              <div>
                <h3>{{ info.electionName }}</h3>
                <p>Election Day: {{ info.electionDay }}</p>
              </div>
            </div>

            @if (info.pollingLocations.length > 0) {
              <section class="result-section">
                <h2>
                  <div class="section-icon loc-icon">
                    <span class="material-icons-outlined" aria-hidden="true">place</span>
                  </div>
                  Polling Locations
                </h2>
                <div class="locations-grid">
                  @for (location of info.pollingLocations; track location.address; let idx = $index) {
                    <div class="location-card" [style.animation-delay]="idx * 0.06 + 's'">
                      <h4>{{ location.name }}</h4>
                      <p class="address">{{ location.address }}</p>
                      @if (location.hours) {
                        <p class="hours">
                          <span class="material-icons-outlined" aria-hidden="true">schedule</span>
                          {{ location.hours }}
                        </p>
                      }
                      @if (location.notes) {
                        <p class="notes">{{ location.notes }}</p>
                      }
                    </div>
                  }
                </div>
              </section>
            }

            @if (info.earlyVoteSites.length > 0) {
              <section class="result-section">
                <h2>
                  <div class="section-icon early-icon">
                    <span class="material-icons-outlined" aria-hidden="true">event_available</span>
                  </div>
                  Early Voting Sites
                </h2>
                <ul class="early-vote-list">
                  @for (site of info.earlyVoteSites; track site) {
                    <li>
                      <span class="material-icons-outlined" aria-hidden="true">location_on</span>
                      {{ site }}
                    </li>
                  }
                </ul>
              </section>
            }

            <section class="result-section links-section">
              <h2>
                <div class="section-icon link-icon">
                  <span class="material-icons-outlined" aria-hidden="true">link</span>
                </div>
                Useful Links
              </h2>
              <div class="links-grid">
                @if (info.registrationUrl) {
                  <a [href]="info.registrationUrl" target="_blank" rel="noopener" class="link-card">
                    <span class="material-icons-outlined link-card-icon" aria-hidden="true">app_registration</span>
                    <span>Voter Registration</span>
                    <span class="material-icons-outlined arrow" aria-hidden="true">arrow_forward</span>
                  </a>
                }
                @if (info.absenteeVotingUrl) {
                  <a [href]="info.absenteeVotingUrl" target="_blank" rel="noopener" class="link-card">
                    <span class="material-icons-outlined link-card-icon" aria-hidden="true">markunread_mailbox</span>
                    <span>Absentee Voting Info</span>
                    <span class="material-icons-outlined arrow" aria-hidden="true">arrow_forward</span>
                  </a>
                }
              </div>
            </section>
          </div>
        }
      } @else {
        @if (electionService.selectedCountryResource(); as resource) {
          <div class="resource-card">
            <div class="resource-header">
              <span class="resource-flag">{{ resource.flagEmoji }}</span>
              <div>
                <h2>{{ resource.countryName }}</h2>
                <p class="resource-commission">{{ resource.electionCommissionName }}</p>
              </div>
            </div>
            <p class="resource-description">{{ resource.voterInfoDescription }}</p>
            <div class="resource-links">
              <a [href]="resource.electionCommissionUrl" target="_blank" rel="noopener" class="resource-link">
                <span class="material-icons-outlined" aria-hidden="true">account_balance</span>
                Election Commission
                <span class="material-icons-outlined" aria-hidden="true">open_in_new</span>
              </a>
              <a [href]="resource.voterRegistrationUrl" target="_blank" rel="noopener" class="resource-link">
                <span class="material-icons-outlined" aria-hidden="true">how_to_reg</span>
                Voter Registration
                <span class="material-icons-outlined" aria-hidden="true">open_in_new</span>
              </a>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .voter-info-page {
      padding-bottom: var(--spacing-2xl);
      animation: fadeInUp 0.4s ease both;
    }

    .country-picker {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
      justify-content: center;
      margin-bottom: var(--spacing-xl);
    }

    .country-pill {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-full);
      border: 1px solid var(--color-border);
      background: var(--color-bg-card);
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      font-weight: 600;
      font-family: inherit;
      transition: all 0.2s ease;
    }

    .country-pill:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }

    .country-pill.active {
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
      color: var(--color-text-inverse);
      border-color: transparent;
    }

    .country-flag {
      font-size: 1.25rem;
      line-height: 1;
    }

    .resource-card {
      max-width: 640px;
      margin: 0 auto;
      padding: var(--spacing-xl);
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-md);
    }

    .resource-header {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
    }

    .resource-flag {
      font-size: 3rem;
      line-height: 1;
    }

    .resource-header h2 {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-xs);
    }

    .resource-commission {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }

    .resource-description {
      font-size: var(--font-size-base);
      color: var(--color-text-secondary);
      line-height: 1.65;
      margin-bottom: var(--spacing-lg);
    }

    .resource-links {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .resource-link {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--color-bg-sidebar);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      color: var(--color-primary);
      font-weight: 600;
      font-size: var(--font-size-sm);
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .resource-link:hover {
      border-color: var(--color-primary);
      box-shadow: var(--shadow-sm);
    }

    .resource-link .material-icons-outlined {
      font-size: 20px;
    }

    .resource-link .material-icons-outlined:last-child {
      margin-left: auto;
      font-size: 18px;
      opacity: 0.7;
    }

    .page-header {
      text-align: center;
      margin-bottom: var(--spacing-xl);
      animation: fadeInDown 0.5s ease both;
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: 6px 16px;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1));
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--color-success);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: var(--spacing-md);
    }

    .header-badge .material-icons-outlined {
      font-size: 14px;
    }

    .page-title {
      font-size: clamp(1.5rem, 4vw, 2.5rem);
      font-weight: 800;
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-sm);
    }

    .title-gradient {
      background: linear-gradient(135deg, var(--color-success), var(--color-accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-subtitle {
      font-size: var(--font-size-base);
      color: var(--color-text-secondary);
      max-width: 600px;
      margin: 0 auto;
    }

    .search-form {
      max-width: 600px;
      margin: 0 auto var(--spacing-xl);
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--spacing-xl);
      transition: all 0.3s ease;
      animation: fadeInUp 0.5s ease both;
      animation-delay: 0.1s;
    }

    .search-form:hover {
      box-shadow: var(--shadow-md);
    }

    .form-group {
      margin-bottom: var(--spacing-md);
    }

    .form-group label {
      display: block;
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-sm);
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--spacing-sm) var(--spacing-md);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: var(--color-bg);
    }

    .input-wrapper.focused {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .input-wrapper .material-icons-outlined {
      color: var(--color-text-muted);
      font-size: 20px;
      transition: color 0.3s ease;
    }

    .input-wrapper.focused .material-icons-outlined {
      color: var(--color-primary);
    }

    .form-input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      font-family: inherit;
    }

    select.form-input {
      cursor: pointer;
    }

    .helper-text {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      margin-top: var(--spacing-sm);
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .helper-text .material-icons-outlined {
      font-size: 14px;
    }

    .submit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      width: 100%;
      padding: var(--spacing-md);
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
      color: var(--color-text-inverse);
      border: none;
      border-radius: var(--radius-lg);
      font-size: var(--font-size-base);
      font-weight: 600;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      margin-top: var(--spacing-lg);
      font-family: inherit;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(26, 86, 219, 0.35);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .results {
      margin-top: var(--spacing-xl);
      animation: fadeInUp 0.5s ease both;
    }

    .election-banner {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      border-radius: var(--radius-xl);
      color: var(--color-text-inverse);
      margin-bottom: var(--spacing-xl);
      box-shadow: 0 8px 30px rgba(26, 86, 219, 0.3);
    }

    .banner-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-lg);
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .banner-icon-wrap .material-icons-outlined {
      font-size: 28px;
    }

    .election-banner h3 {
      font-size: var(--font-size-lg);
      font-weight: 700;
    }

    .election-banner p {
      font-size: var(--font-size-sm);
      opacity: 0.9;
    }

    .result-section {
      margin-bottom: var(--spacing-xl);
    }

    .result-section h2 {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-md);
    }

    .section-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .section-icon .material-icons-outlined {
      font-size: 20px;
    }

    .loc-icon { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
    .early-icon { background: linear-gradient(135deg, #10b981, #059669); }
    .link-icon { background: linear-gradient(135deg, #7c3aed, #5b21b6); }

    .locations-grid {
      display: grid;
      gap: var(--spacing-md);
    }

    .location-card {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--spacing-md) var(--spacing-lg);
      transition: all 0.3s ease;
      animation: fadeInUp 0.4s ease both;
    }

    .location-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateX(4px);
    }

    .location-card h4 {
      font-size: var(--font-size-base);
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-xs);
    }

    .location-card .address {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .location-card .hours {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      margin-top: var(--spacing-sm);
    }

    .location-card .hours .material-icons-outlined {
      font-size: 14px;
    }

    .location-card .notes {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      font-style: italic;
      margin-top: var(--spacing-xs);
    }

    .early-vote-list {
      list-style: none;
    }

    .early-vote-list li {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      border-bottom: 1px solid var(--color-border-light);
    }

    .early-vote-list li .material-icons-outlined {
      font-size: 16px;
      color: var(--color-primary);
    }

    .links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-md);
    }

    .link-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      color: var(--color-text-primary);
      font-weight: 500;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .link-card:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .link-card-icon {
      color: var(--color-primary);
    }

    .arrow {
      margin-left: auto;
      font-size: 16px;
      color: var(--color-text-muted);
      transition: transform 0.3s ease;
    }

    .link-card:hover .arrow {
      transform: translateX(4px);
    }
  `]
})
export class VoterInfoComponent implements OnInit {

  protected readonly civicService = inject(CivicService);
  readonly electionService = inject(ElectionService);

  readonly selectedCountry = signal('US');

  readonly countries = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' }
  ] as const;

  readonly address = signal('');
  readonly selectedElection = signal('');
  readonly addressFocused = signal(false);

  ngOnInit(): void {
    this.civicService.loadElections();
  }

  selectCountry(code: string): void {
    this.selectedCountry.set(code);
    if (code === 'US') {
      this.electionService.clearCountryResource();
    } else {
      this.electionService.loadCountryResource(code);
    }
  }

  onAddressInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.address.set(target.value);
  }

  onElectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedElection.set(target.value);
  }

  lookupVoterInfo(): void {
    const addr = this.address().trim();
    const electionId = this.selectedElection();
    if (addr && electionId) {
      this.civicService.loadVoterInfo(addr, electionId);
    }
  }
}
