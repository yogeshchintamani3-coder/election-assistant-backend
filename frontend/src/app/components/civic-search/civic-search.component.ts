import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CivicService } from '../../services/civic.service';

@Component({
  selector: 'app-civic-search',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="civic-search-page">
      <header class="page-header">
        <div class="header-badge">
          <span class="material-icons-outlined">person_search</span>
          Google Civic API
        </div>
        <h1 class="page-title">Find Your <span class="title-gradient">Representatives</span></h1>
        <p class="page-subtitle">Enter a U.S. address to discover your elected officials at every level of government.</p>
      </header>

      <div class="search-box">
        <div class="input-group" [class.focused]="inputFocused()">
          <span class="material-icons-outlined input-icon">location_on</span>
          <input
            type="text"
            [value]="address()"
            (input)="onAddressInput($event)"
            (focus)="inputFocused.set(true)"
            (blur)="inputFocused.set(false)"
            placeholder="Enter an address (e.g., 1600 Pennsylvania Ave, Washington, DC)"
            class="search-input"
            (keyup.enter)="search()"
          />
          <button class="search-btn" (click)="search()" [disabled]="!address().trim() || civicService.loading()">
            @if (civicService.loading()) {
              <span class="material-icons-outlined spin">autorenew</span>
            } @else {
              <span class="material-icons-outlined">search</span>
            }
            Search
          </button>
        </div>
      </div>

      @if (civicService.error()) {
        <div class="error-banner">
          <span class="material-icons-outlined">error_outline</span>
          <p>{{ civicService.error() }}</p>
        </div>
      }

      @if (civicService.representatives().length > 0) {
        <div class="results-section">
          <div class="results-header">
            <h2>Your Representatives</h2>
            <span class="results-count">{{ civicService.representatives().length }} offices found</span>
          </div>
          <div class="representatives-grid">
            @for (office of civicService.representatives(); track office.officeName; let idx = $index) {
              <div class="office-card" [style.animation-delay]="idx * 0.08 + 's'">
                <div class="office-header">
                  <div class="office-badge">
                    <span class="material-icons-outlined">account_balance</span>
                  </div>
                  <div>
                    <h3>{{ office.officeName }}</h3>
                    <span class="division-name">{{ office.divisionName }}</span>
                  </div>
                </div>
                <div class="officials-list">
                  @for (official of office.officials; track official.name) {
                    <div class="official-item">
                      <div class="official-avatar">
                        @if (official.photoUrl) {
                          <img [src]="official.photoUrl" [alt]="official.name" loading="lazy" />
                        } @else {
                          <span class="material-icons-outlined">person</span>
                        }
                      </div>
                      <div class="official-info">
                        <span class="official-name">{{ official.name }}</span>
                        <span class="official-party">{{ official.party }}</span>
                        @if (official.phones.length > 0) {
                          <span class="official-phone">
                            <span class="material-icons-outlined">phone</span>
                            {{ official.phones[0] }}
                          </span>
                        }
                      </div>
                      @if (official.urls.length > 0) {
                        <a [href]="official.urls[0]" target="_blank" rel="noopener" class="official-link">
                          <span class="material-icons-outlined">open_in_new</span>
                        </a>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .civic-search-page {
      padding-bottom: var(--spacing-2xl);
      animation: fadeInUp 0.4s ease both;
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
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(6, 182, 212, 0.1));
      border: 1px solid rgba(124, 58, 237, 0.2);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--color-secondary);
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
      background: linear-gradient(135deg, var(--color-secondary), var(--color-accent));
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

    .search-box {
      max-width: 700px;
      margin: 0 auto var(--spacing-xl);
      animation: fadeInUp 0.5s ease both;
      animation-delay: 0.15s;
    }

    .input-group {
      display: flex;
      align-items: center;
      background: var(--color-bg-card);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--spacing-sm);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .input-group.focused {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    .input-icon {
      color: var(--color-text-muted);
      padding: 0 var(--spacing-sm);
      transition: color 0.3s ease;
    }

    .input-group.focused .input-icon {
      color: var(--color-primary);
    }

    .search-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: var(--font-size-base);
      background: transparent;
      color: var(--color-text-primary);
      padding: var(--spacing-sm);
      font-family: inherit;
    }

    .search-input::placeholder {
      color: var(--color-text-muted);
    }

    .search-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-sm) var(--spacing-lg);
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
      color: var(--color-text-inverse);
      border: none;
      border-radius: var(--radius-lg);
      font-weight: 600;
      font-size: var(--font-size-sm);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
    }

    .search-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(26, 86, 219, 0.35);
    }

    .search-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md) var(--spacing-lg);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-xl);
      color: var(--color-error);
      animation: fadeInUp 0.3s ease both;
    }

    .results-section {
      animation: fadeInUp 0.5s ease both;
    }

    .results-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-lg);
    }

    .results-header h2 {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .results-count {
      font-size: var(--font-size-xs);
      font-weight: 500;
      color: var(--color-text-muted);
      background: var(--color-bg-sidebar);
      padding: 4px 12px;
      border-radius: var(--radius-full);
    }

    .representatives-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: var(--spacing-lg);
    }

    .office-card {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: fadeInUp 0.5s ease both;
    }

    .office-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-lg);
    }

    .office-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--color-bg-sidebar);
      border-bottom: 1px solid var(--color-border);
    }

    .office-badge {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .office-badge .material-icons-outlined {
      font-size: 18px;
    }

    .office-header h3 {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .division-name {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .officials-list {
      padding: var(--spacing-md);
    }

    .official-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-sm) 0;
    }

    .official-item + .official-item {
      border-top: 1px solid var(--color-border-light);
      padding-top: var(--spacing-md);
    }

    .official-avatar {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-full);
      background: var(--color-bg-sidebar);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }

    .official-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .official-avatar .material-icons-outlined {
      color: var(--color-text-muted);
    }

    .official-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .official-name {
      font-weight: 600;
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
    }

    .official-party {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .official-phone {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .official-phone .material-icons-outlined {
      font-size: 12px;
    }

    .official-link {
      color: var(--color-primary);
      padding: var(--spacing-sm);
      border-radius: var(--radius-full);
      transition: all 0.3s ease;
      display: flex;
    }

    .official-link:hover {
      background: rgba(59, 130, 246, 0.08);
      transform: scale(1.1);
    }

    .official-link .material-icons-outlined {
      font-size: 18px;
    }
  `]
})
export class CivicSearchComponent {

  protected readonly civicService = inject(CivicService);
  readonly address = signal('');
  readonly inputFocused = signal(false);

  onAddressInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.address.set(target.value);
  }

  search(): void {
    const addr = this.address().trim();
    if (addr) {
      this.civicService.searchRepresentatives(addr);
    }
  }
}
