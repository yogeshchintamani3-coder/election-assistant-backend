import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { ElectionStep } from '../../models/election.model';

@Component({
  selector: 'app-step-card',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="step-card" [class.active]="isActive()" (click)="stepClick.emit()">
      <div class="step-connector"></div>
      <div class="step-marker" [class.active]="isActive()">
        <span class="step-number">{{ step().order }}</span>
        <span class="marker-ring"></span>
      </div>
      <div class="step-content">
        <div class="step-header">
          <h3 class="step-title">{{ step().title }}</h3>
          <span class="step-duration">
            <span class="material-icons-outlined">schedule</span>
            {{ step().duration }}
          </span>
        </div>
        @if (isActive()) {
          <div class="step-description-wrap">
            <p class="step-description">{{ step().description }}</p>
          </div>
        }
      </div>
      <span class="expand-icon material-icons-outlined">
        {{ isActive() ? 'expand_less' : 'expand_more' }}
      </span>
    </div>
  `,
  styles: [`
    .step-card {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md);
      padding: var(--spacing-md) var(--spacing-lg);
      margin-bottom: var(--spacing-md);
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      animation: fadeInUp 0.5s ease both;
    }

    .step-card:hover {
      border-color: var(--color-primary-light);
      box-shadow: var(--shadow-md);
      transform: translateX(4px);
    }

    .step-card.active {
      border-color: var(--color-primary);
      box-shadow: 0 8px 30px rgba(26, 86, 219, 0.15);
      background: linear-gradient(135deg, var(--color-bg-card) 0%, rgba(59, 130, 246, 0.04) 100%);
    }

    .step-connector {
      display: none;
    }

    .step-marker {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: all 0.4s ease;
    }

    .step-marker.active {
      transform: scale(1.12);
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
    }

    .marker-ring {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid var(--color-primary);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .step-card.active .marker-ring {
      opacity: 0.3;
      animation: pulseGlow 2s ease-in-out infinite;
    }

    .step-number {
      color: var(--color-text-inverse);
      font-weight: 700;
      font-size: var(--font-size-sm);
    }

    .step-content {
      flex: 1;
      min-width: 0;
    }

    .step-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }

    .step-title {
      font-size: var(--font-size-base);
      font-weight: 600;
      color: var(--color-text-primary);
      transition: color 0.3s ease;
    }

    .step-card.active .step-title {
      color: var(--color-primary);
    }

    .step-duration {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      background: var(--color-bg-sidebar);
      padding: 3px var(--spacing-sm);
      border-radius: var(--radius-full);
      white-space: nowrap;
    }

    .step-duration .material-icons-outlined {
      font-size: 14px;
    }

    .step-description-wrap {
      overflow: hidden;
      animation: slideDown 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;
    }

    .step-description {
      margin-top: var(--spacing-md);
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: 1.7;
      padding: var(--spacing-md);
      background: var(--color-bg-sidebar);
      border-radius: var(--radius-md);
      border-left: 3px solid var(--color-primary);
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        max-height: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        max-height: 300px;
        transform: translateY(0);
      }
    }

    .expand-icon {
      color: var(--color-text-muted);
      font-size: 22px;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }

    .step-card.active .expand-icon {
      color: var(--color-primary);
    }

    .step-card:hover .expand-icon {
      transform: scale(1.15);
    }
  `]
})
export class StepCardComponent {
  step = input.required<ElectionStep>();
  isActive = input<boolean>(false);
  stepClick = output<void>();
}
