import { Component, ChangeDetectionStrategy, inject, AfterViewInit, ElementRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-icon">
          <span class="material-icons-outlined">how_to_vote</span>
        </div>
        <h1>Welcome to Election Assistant</h1>
        <p class="login-subtitle">Sign in to access representative lookup and voter information features.</p>

        @if (authService.isGoogleConfigured()) {
          <div class="google-btn-wrapper">
            <div #googleBtn aria-label="Sign in with Google"></div>
          </div>
          <div class="divider">
            <span>or</span>
          </div>
        }

        <button class="guest-btn" (click)="signInAsGuest()" aria-label="Continue as Guest">
          <span class="material-icons-outlined">person_outline</span>
          <span>Continue as Guest</span>
        </button>

        <p class="login-note">
          <span class="material-icons-outlined">info</span>
          Election process education is available without signing in.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      padding: var(--spacing-xl);
      animation: fadeInUp 0.5s ease both;
    }

    .login-card {
      text-align: center;
      max-width: 420px;
      width: 100%;
      padding: var(--spacing-2xl);
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
    }

    .login-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto var(--spacing-lg);
      border-radius: var(--radius-xl);
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .login-icon .material-icons-outlined {
      font-size: 32px;
      color: white;
    }

    h1 {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-sm);
    }

    .login-subtitle {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-xl);
      line-height: 1.6;
    }

    .google-btn-wrapper {
      display: flex;
      justify-content: center;
      margin-bottom: var(--spacing-md);
      min-height: 44px;
    }

    .divider {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-md);
      color: var(--color-text-muted);
      font-size: var(--font-size-xs);
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--color-border);
    }

    .guest-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      width: 100%;
      padding: 12px var(--spacing-lg);
      background: var(--color-bg-sidebar);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-lg);
      color: var(--color-text-primary);
      font-size: var(--font-size-base);
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      margin-bottom: var(--spacing-xl);
    }

    .guest-btn:hover {
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
      color: var(--color-text-inverse);
      border-color: var(--color-primary);
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(26, 86, 219, 0.3);
    }

    .guest-btn .material-icons-outlined {
      font-size: 20px;
    }

    .login-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .login-note .material-icons-outlined {
      font-size: 14px;
    }
  `]
})
export class LoginComponent implements AfterViewInit {

  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly googleBtnRef = viewChild<ElementRef<HTMLDivElement>>('googleBtn');

  ngAfterViewInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return;
    }

    if (this.authService.isGoogleConfigured()) {
      try {
        const btnEl = this.googleBtnRef();
        if (btnEl) {
          this.authService.initializeGoogleSignIn(btnEl.nativeElement);
        }
      } catch {
        // Google SDK may not be loaded yet
      }
    }
  }

  signInAsGuest(): void {
    this.authService.signInAsGuest();
    this.router.navigate(['/']);
  }
}
