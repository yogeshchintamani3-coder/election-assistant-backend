import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ElectionService } from '../../services/election.service';
import { ElectionQuizComponent } from '../election-quiz/election-quiz.component';
import { StepCardComponent } from '../step-card/step-card.component';

@Component({
  selector: 'app-election-timeline',
  standalone: true,
  imports: [RouterLink, StepCardComponent, ElectionQuizComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="timeline-page">
      <nav class="breadcrumb">
        <a routerLink="/" class="breadcrumb-link">
          <span class="material-icons-outlined">home</span>
          Home
        </a>
        <span class="material-icons-outlined separator">chevron_right</span>
        <span class="current">{{ electionService.selectedProcess()?.countryName }} &mdash; {{ electionService.selectedProcess()?.electionType }}</span>
      </nav>

      @if (electionService.loading()) {
        <div class="loading-state" [attr.aria-busy]="electionService.loading()">
          <div class="loading-header-skeleton">
            <div class="skeleton-bar wide"></div>
            <div class="skeleton-bar medium"></div>
          </div>
          @for (i of [1,2,3,4]; track i) {
            <div class="skeleton-step">
              <div class="skeleton-circle"></div>
              <div class="skeleton-step-content">
                <div class="skeleton-bar medium"></div>
                <div class="skeleton-bar short"></div>
              </div>
            </div>
          }
        </div>
      }

      @if (electionService.error()) {
        <div class="error-banner" role="alert" aria-live="polite" aria-label="Error">
          <span class="material-icons-outlined">error_outline</span>
          <p>{{ electionService.error() }}</p>
        </div>
      }

      @if (electionService.selectedProcess(); as process) {
        <div class="step-progress no-print" aria-label="Timeline progress">
          <div class="step-progress-row">
            <span class="step-progress-label">Step {{ activeStepIndex() + 1 }} of {{ process.steps.length }}</span>
            <span class="step-progress-fraction">{{ activeStepIndex() + 1 }} / {{ process.steps.length }}</span>
          </div>
          <div class="step-progress-track">
            <div
              class="step-progress-fill"
              [style.width.%]="process.steps.length ? ((activeStepIndex() + 1) / process.steps.length) * 100 : 0"
            ></div>
          </div>
        </div>

        <header class="process-header">
          <div class="header-badge">
            <span class="material-icons-outlined">how_to_vote</span>
            {{ process.electionType }} Election
          </div>
          <h1 class="process-title">
            {{ process.countryName }}
            <span class="title-accent">Election Process</span>
          </h1>
          <p class="process-description">{{ process.description }}</p>
          <div class="header-meta">
            <div class="meta-chip">
              <span class="material-icons-outlined">format_list_numbered</span>
              {{ process.steps.length }} Steps
            </div>
            <div class="meta-chip">
              <span class="material-icons-outlined">event</span>
              {{ process.keyDates.length }} Key Dates
            </div>
            <div class="meta-chip">
              <span class="material-icons-outlined">verified_user</span>
              {{ process.eligibilityCriteria.length }} Criteria
            </div>
          </div>
        </header>

        <section class="timeline-section">
          <h2 class="section-heading">
            <span class="heading-icon material-icons-outlined">timeline</span>
            Election Process Steps
            <span class="heading-count" role="status">{{ process.steps.length }} steps</span>
          </h2>
          <div class="timeline">
            <div class="timeline-track"></div>
            @for (step of process.steps; track step.order; let idx = $index) {
              <div [style.animation-delay]="idx * 0.08 + 's'">
                <app-step-card
                  [step]="step"
                  [isActive]="activeStep() === step.order"
                  (stepClick)="setActiveStep(step.order, idx)"
                />
              </div>
            }
          </div>
        </section>

        <div class="info-panels">
          <section class="panel key-dates">
            <h2 class="panel-heading">
              <div class="panel-icon dates-icon">
                <span class="material-icons-outlined">calendar_today</span>
              </div>
              Key Dates & Timeline
            </h2>
            <ul class="date-list">
              @for (date of process.keyDates; track date; let idx = $index) {
                <li [style.animation-delay]="idx * 0.06 + 's'" class="date-item">
                  <span class="date-dot"></span>
                  {{ date }}
                </li>
              }
            </ul>
          </section>

          <section class="panel eligibility">
            <h2 class="panel-heading">
              <div class="panel-icon eligibility-icon">
                <span class="material-icons-outlined">how_to_reg</span>
              </div>
              Eligibility to Vote
            </h2>
            <ul class="criteria-list">
              @for (criteria of process.eligibilityCriteria; track criteria; let idx = $index) {
                <li [style.animation-delay]="idx * 0.06 + 's'" class="criteria-item">
                  <span class="material-icons-outlined check">check_circle</span>
                  {{ criteria }}
                </li>
              }
            </ul>
          </section>
        </div>

        <div class="timeline-actions no-print">
          <button type="button" class="action-btn quiz-btn" (click)="toggleQuiz()">
            <span class="material-icons-outlined">{{ showQuiz() ? 'expand_less' : 'quiz' }}</span>
            {{ showQuiz() ? 'Hide quiz' : 'Take quiz' }}
          </button>
          <button type="button" class="action-btn print-btn" (click)="printPage()">
            <span class="material-icons-outlined">print</span>
            Print
          </button>
        </div>

        @if (showQuiz()) {
          <app-election-quiz [electionProcess]="process" />
        }
      }
    </div>
  `,
  styles: [`
    .timeline-page {
      padding-bottom: var(--spacing-2xl);
      animation: fadeInUp 0.4s ease both;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-xl);
      font-size: var(--font-size-sm);
      animation: fadeInDown 0.4s ease both;
    }

    .breadcrumb-link {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      color: var(--color-primary);
      text-decoration: none;
      padding: 4px 10px;
      border-radius: var(--radius-md);
      transition: all 0.2s ease;
    }

    .breadcrumb-link:hover {
      background: rgba(59, 130, 246, 0.08);
    }

    .step-progress {
      margin-bottom: var(--spacing-xl);
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      animation: fadeInUp 0.45s ease both;
    }

    .step-progress-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-sm);
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--color-text-secondary);
    }

    .step-progress-fraction {
      color: var(--color-primary);
      font-variant-numeric: tabular-nums;
    }

    .step-progress-track {
      height: 10px;
      border-radius: var(--radius-full);
      background: var(--color-bg-sidebar);
      overflow: hidden;
    }

    .step-progress-fill {
      height: 100%;
      border-radius: var(--radius-full);
      background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
      transition: width 0.35s ease;
    }

    .timeline-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-md);
      margin-top: var(--spacing-2xl);
      justify-content: center;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: 12px 22px;
      border-radius: var(--radius-full);
      border: 1px solid var(--color-border);
      background: var(--color-bg-card);
      color: var(--color-text-primary);
      font-weight: 600;
      font-size: var(--font-size-sm);
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }

    .action-btn:hover {
      border-color: var(--color-primary-light);
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }

    .action-btn .material-icons-outlined {
      font-size: 20px;
      color: var(--color-primary);
    }

    .quiz-btn {
      background: linear-gradient(135deg, rgba(26, 86, 219, 0.08), rgba(124, 58, 237, 0.08));
    }

    .print-btn .material-icons-outlined {
      font-size: 20px;
    }

    @media print {
      .no-print {
        display: none !important;
      }

      .timeline-page {
        padding-bottom: 0;
        animation: none;
      }

      .process-header,
      .timeline-section,
      .info-panels .panel,
      .step-card {
        box-shadow: none !important;
        break-inside: avoid;
      }

      .timeline-track {
        opacity: 0.5;
      }

      body {
        background: white !important;
        color: #111 !important;
      }
    }

    .breadcrumb-link .material-icons-outlined {
      font-size: 16px;
    }

    .separator {
      font-size: 16px;
      color: var(--color-text-muted);
    }

    .current {
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    /* Loading skeleton */
    .loading-state {
      padding: var(--spacing-xl) 0;
    }

    .loading-header-skeleton {
      margin-bottom: var(--spacing-xl);
    }

    .skeleton-bar {
      height: 20px;
      border-radius: var(--radius-sm);
      background: linear-gradient(90deg, var(--color-bg-sidebar) 25%, var(--color-bg-elevated) 50%, var(--color-bg-sidebar) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      margin-bottom: var(--spacing-sm);
    }

    .skeleton-bar.wide { width: 60%; height: 28px; }
    .skeleton-bar.medium { width: 45%; }
    .skeleton-bar.short { width: 30%; }

    .skeleton-step {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-md);
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
    }

    .skeleton-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(90deg, var(--color-bg-sidebar) 25%, var(--color-bg-elevated) 50%, var(--color-bg-sidebar) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      flex-shrink: 0;
    }

    .skeleton-step-content {
      flex: 1;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--color-error-bg);
      border: 1px solid var(--color-error-border);
      border-radius: var(--radius-md);
      color: var(--color-error);
    }

    /* Process Header */
    .process-header {
      margin-bottom: var(--spacing-2xl);
      animation: fadeInUp 0.5s ease both;
    }

    .header-badge {
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
      margin-bottom: var(--spacing-md);
    }

    .header-badge .material-icons-outlined {
      font-size: 14px;
    }

    .process-title {
      font-size: clamp(1.5rem, 4vw, 2.5rem);
      font-weight: 800;
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-md);
      line-height: 1.2;
    }

    .title-accent {
      display: block;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .process-description {
      font-size: var(--font-size-lg);
      color: var(--color-text-secondary);
      line-height: 1.7;
      max-width: 800px;
      margin-bottom: var(--spacing-lg);
    }

    .header-meta {
      display: flex;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
    }

    .meta-chip {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: 6px 14px;
      background: var(--color-bg-sidebar);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--color-text-secondary);
    }

    .meta-chip .material-icons-outlined {
      font-size: 14px;
      color: var(--color-primary);
    }

    /* Timeline Section */
    .timeline-section {
      margin-bottom: var(--spacing-2xl);
    }

    .section-heading {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-lg);
    }

    .heading-icon {
      color: var(--color-primary);
      font-size: 24px;
    }

    .heading-count {
      font-size: var(--font-size-xs);
      font-weight: 500;
      color: var(--color-text-muted);
      background: var(--color-bg-sidebar);
      padding: 2px 10px;
      border-radius: var(--radius-full);
      margin-left: auto;
    }

    .timeline {
      position: relative;
      padding-left: var(--spacing-lg);
    }

    .timeline-track {
      position: absolute;
      left: 14px;
      top: 0;
      bottom: 0;
      width: 3px;
      background: linear-gradient(to bottom, var(--color-primary), var(--color-secondary), var(--color-accent));
      border-radius: var(--radius-full);
      opacity: 0.3;
    }

    /* Info Panels */
    .info-panels {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-lg);
    }

    .panel {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--spacing-lg);
      transition: all 0.3s ease;
      animation: fadeInUp 0.5s ease both;
    }

    .panel:hover {
      box-shadow: var(--shadow-md);
    }

    .panel-heading {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-lg);
    }

    .panel-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .panel-icon .material-icons-outlined {
      font-size: 22px;
    }

    .dates-icon {
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }

    .eligibility-icon {
      background: linear-gradient(135deg, #10b981, #059669);
    }

    .date-list,
    .criteria-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .date-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: 1.5;
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid var(--color-border-light);
      animation: fadeInUp 0.4s ease both;
    }

    .date-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      flex-shrink: 0;
    }

    .criteria-item {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-sm);
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: 1.5;
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid var(--color-border-light);
      animation: fadeInUp 0.4s ease both;
    }

    .check {
      color: var(--color-success);
      font-size: 18px;
      flex-shrink: 0;
      margin-top: 1px;
    }
  `]
})
export class ElectionTimelineComponent implements OnInit {

  protected readonly electionService = inject(ElectionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly activeStep = signal<number>(0);
  readonly showQuiz = signal(false);
  readonly activeStepIndex = signal(0);

  ngOnInit(): void {
    const countryCode = this.route.snapshot.paramMap.get('countryCode') ?? '';
    const electionType = this.route.snapshot.paramMap.get('electionType') ?? '';

    if (!countryCode || !electionType) {
      this.router.navigate(['/']);
      return;
    }

    this.electionService.loadElectionProcess(countryCode, electionType);
  }

  setActiveStep(stepOrder: number, stepIndex: number): void {
    if (this.activeStep() === stepOrder) {
      this.activeStep.set(0);
    } else {
      this.activeStep.set(stepOrder);
      this.activeStepIndex.set(stepIndex);
    }
  }

  printPage(): void {
    window.print();
  }

  toggleQuiz(): void {
    this.showQuiz.update((v) => !v);
  }
}
