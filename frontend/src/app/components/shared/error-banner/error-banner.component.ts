import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="error-banner" role="alert" aria-live="polite" aria-label="Error">
      <span class="material-icons-outlined" aria-hidden="true">error_outline</span>
      <p>{{ message() }}</p>
    </div>
  `,
  styles: [`
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
      animation: fadeInUp 0.3s ease both;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ErrorBannerComponent {
  message = input.required<string>();
}
