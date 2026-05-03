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

        <div class="google-btn-wrapper">
          <div #googleBtn aria-label="Sign in with Google"></div>
        </div>

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
      margin-bottom: var(--spacing-xl);
      min-height: 44px;
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

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly googleBtnRef = viewChild.required<ElementRef<HTMLDivElement>>('googleBtn');

  ngAfterViewInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return;
    }

    try {
      this.authService.initializeGoogleSignIn(this.googleBtnRef().nativeElement);
    } catch {
      // Google SDK may not be loaded yet
    }
  }
}
