import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ElectionService } from '../../services/election.service';

@Component({
  selector: 'app-country-selector',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero-section">
      <div class="hero-bg">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>
      <div class="hero-content">
        <div class="hero-badge">
          <span class="material-icons-outlined">public</span>
          Explore 5 Countries
        </div>
        <h1 class="hero-title">Understand Elections<br/><span class="title-gradient">Worldwide</span></h1>
        <p class="hero-subtitle">
          Interactive step-by-step election guides with timelines, eligibility criteria,
          and live civic data — all in one place.
        </p>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">5</span>
            <span class="stat-label">Countries</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">12</span>
            <span class="stat-label">Election Types</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">50+</span>
            <span class="stat-label">Process Steps</span>
          </div>
        </div>
      </div>
    </section>

    @if (electionService.loading()) {
      <div class="loading-section">
        <div class="skeleton-grid">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="skeleton-card">
              <div class="skeleton-header">
                <div class="skeleton-flag"></div>
                <div class="skeleton-title"></div>
              </div>
              <div class="skeleton-body">
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
              </div>
            </div>
          }
        </div>
      </div>
    }

    @if (electionService.error()) {
      <div class="error-banner animate-fade-in-up">
        <span class="material-icons-outlined">error_outline</span>
        <p>{{ electionService.error() }}</p>
        <button (click)="electionService.loadCountries()" class="btn btn-sm">Retry</button>
      </div>
    }

    <div class="country-grid">
      @for (country of electionService.countries(); track country.code; let idx = $index) {
        <div class="country-card" [style.animation-delay]="idx * 0.08 + 's'">
          <div class="card-glow"></div>
          <div class="country-header">
            <span class="country-flag">{{ country.flagEmoji }}</span>
            <div>
              <h2 class="country-name">{{ country.name }}</h2>
              <span class="country-count">{{ country.electionTypes.length }} election types</span>
            </div>
          </div>
          <div class="election-types">
            @for (type of country.electionTypes; track type; let tIdx = $index) {
              <button class="election-type-btn" (click)="navigateToElection(country.code, type)"
                      [style.animation-delay]="(idx * 0.08 + tIdx * 0.04) + 's'">
                <span class="btn-icon material-icons-outlined">arrow_forward</span>
                <span class="btn-text">{{ type }}</span>
                <span class="btn-arrow material-icons-outlined">chevron_right</span>
              </button>
            }
          </div>
        </div>
      }
    </div>

    <section class="features-section">
      <h2 class="section-title">What You'll Learn</h2>
      <div class="features-grid">
        <div class="feature-card" style="animation-delay: 0.1s">
          <div class="feature-icon-wrap gradient-1">
            <span class="material-icons-outlined">timeline</span>
          </div>
          <h3>Step-by-Step Process</h3>
          <p>Follow the complete election journey from announcement to results with interactive timelines.</p>
        </div>
        <div class="feature-card" style="animation-delay: 0.2s">
          <div class="feature-icon-wrap gradient-2">
            <span class="material-icons-outlined">calendar_today</span>
          </div>
          <h3>Key Dates & Timelines</h3>
          <p>Understand important deadlines and milestones in each election cycle at a glance.</p>
        </div>
        <div class="feature-card" style="animation-delay: 0.3s">
          <div class="feature-icon-wrap gradient-3">
            <span class="material-icons-outlined">how_to_reg</span>
          </div>
          <h3>Eligibility Criteria</h3>
          <p>Know who can vote and what requirements must be met in each country.</p>
        </div>
        <div class="feature-card" style="animation-delay: 0.4s">
          <div class="feature-icon-wrap gradient-4">
            <span class="material-icons-outlined">person_search</span>
          </div>
          <h3>Find Representatives</h3>
          <p>Look up your elected officials using live Google Civic Information data.</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-section {
      position: relative;
      text-align: center;
      padding: var(--spacing-2xl) var(--spacing-lg) var(--spacing-xl);
      margin-bottom: var(--spacing-xl);
      overflow: hidden;
      border-radius: var(--radius-xl);
    }

    .hero-bg {
      position: absolute;
      inset: 0;
      overflow: hidden;
      z-index: 0;
    }

    .gradient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.18;
      animation: float 8s ease-in-out infinite;
    }

    .orb-1 {
      width: 350px;
      height: 350px;
      background: var(--color-primary);
      top: -80px;
      left: -50px;
      animation-delay: 0s;
    }

    .orb-2 {
      width: 280px;
      height: 280px;
      background: var(--color-secondary);
      top: -40px;
      right: -30px;
      animation-delay: 2s;
    }

    .orb-3 {
      width: 200px;
      height: 200px;
      background: var(--color-accent);
      bottom: -60px;
      left: 50%;
      transform: translateX(-50%);
      animation-delay: 4s;
    }

    .hero-content {
      position: relative;
      z-index: 1;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: 6px 16px;
      background: linear-gradient(135deg, rgba(26, 86, 219, 0.1), rgba(124, 58, 237, 0.1));
      border: 1px solid rgba(26, 86, 219, 0.2);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--color-primary);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: var(--spacing-lg);
      animation: fadeInDown 0.6s ease both;
    }

    .hero-badge .material-icons-outlined {
      font-size: 14px;
    }

    .hero-title {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 900;
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-md);
      line-height: 1.15;
      animation: fadeInUp 0.7s ease both;
      animation-delay: 0.1s;
    }

    .title-gradient {
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-accent));
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: gradientShift 4s ease infinite;
    }

    .hero-subtitle {
      font-size: var(--font-size-lg);
      color: var(--color-text-secondary);
      max-width: 640px;
      margin: 0 auto;
      line-height: 1.7;
      animation: fadeInUp 0.7s ease both;
      animation-delay: 0.2s;
    }

    .hero-stats {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-lg);
      margin-top: var(--spacing-xl);
      animation: fadeInUp 0.7s ease both;
      animation-delay: 0.35s;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .stat-number {
      font-size: var(--font-size-3xl);
      font-weight: 800;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-label {
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-divider {
      width: 1px;
      height: 40px;
      background: var(--color-border);
    }

    /* Skeleton Loading */
    .loading-section {
      margin-bottom: var(--spacing-2xl);
    }

    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--spacing-lg);
    }

    .skeleton-card {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      overflow: hidden;
    }

    .skeleton-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-md);
    }

    .skeleton-flag {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background: linear-gradient(90deg, var(--color-bg-sidebar) 25%, var(--color-bg-elevated) 50%, var(--color-bg-sidebar) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-title {
      height: 20px;
      width: 120px;
      border-radius: var(--radius-sm);
      background: linear-gradient(90deg, var(--color-bg-sidebar) 25%, var(--color-bg-elevated) 50%, var(--color-bg-sidebar) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-body {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .skeleton-line {
      height: 36px;
      width: 100%;
      border-radius: var(--radius-md);
      background: linear-gradient(90deg, var(--color-bg-sidebar) 25%, var(--color-bg-elevated) 50%, var(--color-bg-sidebar) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-line.short {
      width: 70%;
    }

    /* Country Cards */
    .country-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-2xl);
    }

    .country-card {
      position: relative;
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--spacing-lg);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow-sm);
      animation: fadeInUp 0.6s ease both;
      overflow: hidden;
    }

    .card-glow {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-accent));
      background-size: 200% 100%;
      opacity: 0;
      transition: opacity 0.4s ease;
      animation: gradientShift 3s ease infinite;
    }

    .country-card:hover {
      box-shadow: var(--shadow-xl);
      transform: translateY(-6px);
      border-color: transparent;
    }

    .country-card:hover .card-glow {
      opacity: 1;
    }

    .country-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
    }

    .country-flag {
      font-size: 3rem;
      line-height: 1;
      animation: float 4s ease-in-out infinite;
    }

    .country-name {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .country-count {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      font-weight: 500;
    }

    .election-types {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .election-type-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      width: 100%;
      padding: 10px var(--spacing-md);
      background: var(--color-bg-sidebar);
      border: 1px solid transparent;
      border-radius: var(--radius-lg);
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      font-weight: 500;
      text-align: left;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: fadeInUp 0.5s ease both;
    }

    .election-type-btn:hover {
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
      color: var(--color-text-inverse);
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(26, 86, 219, 0.25);
    }

    .btn-icon {
      font-size: 16px;
      opacity: 0;
      transform: translateX(-8px);
      transition: all 0.3s ease;
    }

    .election-type-btn:hover .btn-icon {
      opacity: 1;
      transform: translateX(0);
    }

    .btn-text {
      flex: 1;
    }

    .btn-arrow {
      font-size: 16px;
      opacity: 0;
      transform: translateX(-4px);
      transition: all 0.3s ease;
    }

    .election-type-btn:hover .btn-arrow {
      opacity: 1;
      transform: translateX(0);
    }

    /* Features Section */
    .features-section {
      padding: var(--spacing-2xl) 0;
    }

    .section-title {
      text-align: center;
      font-size: var(--font-size-2xl);
      font-weight: 700;
      margin-bottom: var(--spacing-xl);
      color: var(--color-text-primary);
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: var(--spacing-lg);
    }

    .feature-card {
      text-align: center;
      padding: var(--spacing-xl);
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      animation: fadeInUp 0.6s ease both;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .feature-icon-wrap {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--spacing-md);
      color: white;
    }

    .feature-icon-wrap .material-icons-outlined {
      font-size: 28px;
    }

    .gradient-1 { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
    .gradient-2 { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .gradient-3 { background: linear-gradient(135deg, #10b981, #059669); }
    .gradient-4 { background: linear-gradient(135deg, #7c3aed, #5b21b6); }

    .feature-card h3 {
      font-size: var(--font-size-base);
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-sm);
    }

    .feature-card p {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: 1.6;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--color-error-bg);
      border: 1px solid var(--color-error-border);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-xl);
      color: var(--color-error);
    }

    .btn {
      padding: var(--spacing-sm) var(--spacing-md);
      background: var(--color-primary);
      color: var(--color-text-inverse);
      border: none;
      border-radius: var(--radius-md);
      font-weight: 500;
    }

    .btn-sm {
      font-size: var(--font-size-sm);
      padding: var(--spacing-xs) var(--spacing-md);
    }

    @media (max-width: 640px) {
      .hero-stats {
        gap: var(--spacing-md);
      }
      .stat-number {
        font-size: var(--font-size-2xl);
      }
    }
  `]
})
export class CountrySelectorComponent implements OnInit {

  protected readonly electionService = inject(ElectionService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (!this.electionService.hasCountries()) {
      this.electionService.loadCountries();
    }
  }

  navigateToElection(countryCode: string, electionType: string): void {
    this.router.navigate(['/election', countryCode, electionType]);
  }
}
