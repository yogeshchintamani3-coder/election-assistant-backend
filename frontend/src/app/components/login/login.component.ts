import { Component, ChangeDetectionStrategy, inject, AfterViewInit, ElementRef, viewChild, effect, signal, DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-icon">
          <span class="material-icons-outlined">how_to_vote</span>
        </div>
        <h1>Welcome to Election Assistant</h1>
        <p class="login-subtitle">Sign in to access representative lookup and voter information.</p>

        @if (authService.authError(); as error) {
          <div class="error-msg" role="alert">
            <span class="material-icons-outlined">error_outline</span>
            <span>{{ error }}</span>
          </div>
        }

        @if (authService.authLoading()) {
          <div class="loading-wrapper" aria-busy="true">
            <div class="spinner"></div>
            <p>Signing you in...</p>
          </div>
        } @else {

          <!-- Google Sign-In button (always in DOM) -->
          <div class="google-section">
            <div class="google-btn-wrapper" [class.hidden]="!authService.googleReady()">
              <div #googleBtn aria-label="Continue with Google"></div>
            </div>
            @if (!authService.googleReady()) {
              <div class="google-loading">
                <div class="spinner-sm"></div>
                <span>Loading Google Sign-In...</span>
              </div>
            }
          </div>

          <div class="divider"><span>or sign in with email</span></div>

          <!-- Tab Switcher -->
          <div class="tab-switcher">
            <button
              [class.active]="!isRegisterMode()"
              (click)="isRegisterMode.set(false)"
              type="button">Sign In</button>
            <button
              [class.active]="isRegisterMode()"
              (click)="isRegisterMode.set(true)"
              type="button">Register</button>
          </div>

          <!-- Email/Password Form -->
          <form class="email-form" (ngSubmit)="onEmailSubmit()">
            @if (isRegisterMode()) {
              <div class="form-group">
                <label for="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  [(ngModel)]="nameField"
                  name="name"
                  placeholder="Enter your full name"
                  required
                  autocomplete="name" />
              </div>
            }
            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                type="email"
                [(ngModel)]="emailField"
                name="email"
                placeholder="Enter your email"
                required
                autocomplete="email" />
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input
                id="password"
                type="password"
                [(ngModel)]="passwordField"
                name="password"
                placeholder="Enter your password"
                required
                autocomplete="current-password"
                minlength="6" />
            </div>
            <button type="submit" class="submit-btn">
              <span class="material-icons-outlined">{{ isRegisterMode() ? 'person_add' : 'login' }}</span>
              <span>{{ isRegisterMode() ? 'Create Account' : 'Sign In' }}</span>
            </button>
          </form>

          <div class="divider"><span>or</span></div>

          <button class="guest-btn" (click)="signInAsGuest()" aria-label="Continue as Guest">
            <span class="material-icons-outlined">person_outline</span>
            <span>Continue as Guest</span>
          </button>
        }

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

    .error-msg {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-sm) var(--spacing-md);
      margin-bottom: var(--spacing-md);
      background: var(--color-error-bg);
      border: 1px solid var(--color-error-border);
      border-radius: var(--radius-md);
      color: var(--color-error);
      font-size: var(--font-size-sm);
    }

    .error-msg .material-icons-outlined { font-size: 18px; }

    .loading-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-xl) 0;
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .spinner-sm {
      width: 18px;
      height: 18px;
      border: 2px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .loading-wrapper p {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .google-section {
      margin-bottom: var(--spacing-md);
      min-height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .google-btn-wrapper {
      display: flex;
      justify-content: center;
      min-height: 44px;
    }

    .google-btn-wrapper.hidden {
      width: 0;
      height: 0;
      overflow: hidden;
      position: absolute;
      visibility: hidden;
    }

    .google-loading {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      padding: var(--spacing-sm) 0;
    }

    .tab-switcher {
      display: flex;
      background: var(--color-bg-sidebar);
      border-radius: var(--radius-lg);
      padding: 4px;
      margin-bottom: var(--spacing-lg);
      border: 1px solid var(--color-border);
    }

    .tab-switcher button {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .tab-switcher button.active {
      background: var(--color-primary);
      color: var(--color-text-inverse);
      box-shadow: 0 2px 8px rgba(26, 86, 219, 0.3);
    }

    .email-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-md);
      text-align: left;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-group label {
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-group input {
      padding: 10px 14px;
      border: 2px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-family: inherit;
      color: var(--color-text-primary);
      background: var(--color-bg);
      transition: border-color 0.25s ease, box-shadow 0.25s ease;
    }

    .form-group input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.1);
    }

    .form-group input::placeholder {
      color: var(--color-text-muted);
    }

    .submit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
      border: none;
      border-radius: var(--radius-lg);
      color: var(--color-text-inverse);
      font-size: var(--font-size-base);
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(26, 86, 219, 0.4);
    }

    .submit-btn .material-icons-outlined { font-size: 20px; }

    .divider {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin: var(--spacing-md) 0;
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
      font-size: var(--font-size-sm);
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      margin-bottom: var(--spacing-lg);
    }

    .guest-btn:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
      transform: translateY(-1px);
    }

    .guest-btn .material-icons-outlined { font-size: 18px; }

    .login-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .login-note .material-icons-outlined { font-size: 14px; }
  `]
})
export class LoginComponent implements AfterViewInit {

  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly googleBtnRef = viewChild<ElementRef<HTMLDivElement>>('googleBtn');

  readonly isRegisterMode = signal(false);
  private googleButtonRendered = false;
  private renderPollTimer: ReturnType<typeof setInterval> | null = null;
  nameField = '';
  emailField = '';
  passwordField = '';

  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated() && !this.authService.authLoading()) {
        this.router.navigate(['/']);
      }
    });

    effect(() => {
      console.log('[LoginComponent] googleReady state changed:', this.authService.googleReady());
      if (this.authService.googleReady() && !this.googleButtonRendered) {
        this.startRenderPolling();
      }
    });

    this.destroyRef.onDestroy(() => this.clearRenderPolling());
  }

  ngAfterViewInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return;
    }
    this.tryRenderGoogleButton();
  }

  private tryRenderGoogleButton(): void {
    if (!this.authService.googleReady() || this.googleButtonRendered) {
      if (this.googleButtonRendered) console.log('[LoginComponent] Google button already rendered');
      return;
    }
    const btnEl = this.googleBtnRef();
    if (btnEl) {
      console.log('[LoginComponent] Rendering Google button into:', btnEl.nativeElement);
      this.authService.initializeGoogleSignIn(btnEl.nativeElement);
      this.googleButtonRendered = true;
      this.clearRenderPolling();
    } else {
      console.warn('[LoginComponent] Google button container not found in DOM yet');
    }
  }

  private startRenderPolling(): void {
    this.clearRenderPolling();
    this.tryRenderGoogleButton();
    if (this.googleButtonRendered) { return; }

    let attempts = 0;
    this.renderPollTimer = setInterval(() => {
      attempts++;
      this.tryRenderGoogleButton();
      if (this.googleButtonRendered || attempts >= 30) {
        this.clearRenderPolling();
      }
    }, 100);
  }

  private clearRenderPolling(): void {
    if (this.renderPollTimer) {
      clearInterval(this.renderPollTimer);
      this.renderPollTimer = null;
    }
  }

  onEmailSubmit(): void {
    if (this.isRegisterMode()) {
      if (!this.nameField || !this.emailField || !this.passwordField) { return; }
      this.authService.registerWithEmail(this.nameField, this.emailField, this.passwordField);
    } else {
      if (!this.emailField || !this.passwordField) { return; }
      this.authService.loginWithEmail(this.emailField, this.passwordField);
    }
  }

  signInAsGuest(): void {
    this.authService.signInAsGuest();
    this.router.navigate(['/']);
  }
}
