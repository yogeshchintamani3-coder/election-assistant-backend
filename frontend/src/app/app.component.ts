import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="app-layout">
      <header class="app-header">
        <div class="header-content">
          <a routerLink="/" class="logo" (click)="closeMobileMenu()">
            <div class="logo-icon-wrapper">
              <span class="logo-icon material-icons-outlined">how_to_vote</span>
              <span class="logo-pulse"></span>
            </div>
            <span class="logo-text">Election<span class="logo-highlight">Assistant</span></span>
          </a>
          <nav class="nav-links" aria-label="Main navigation">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <span class="material-icons-outlined">school</span>
              <span class="nav-label">Learning</span>
            </a>
            <a routerLink="/civic-search" routerLinkActive="active">
              <span class="material-icons-outlined">person_search</span>
              <span class="nav-label">Representatives</span>
            </a>
            <a routerLink="/voter-info" routerLinkActive="active">
              <span class="material-icons-outlined">location_on</span>
              <span class="nav-label">Voter Info</span>
            </a>
          </nav>
          <button
            type="button"
            class="mobile-menu-btn"
            (click)="toggleMobileMenu()"
            [attr.aria-expanded]="mobileMenuOpen()"
            aria-controls="mobile-nav-drawer"
            [attr.aria-label]="mobileMenuOpen() ? 'Close menu' : 'Open menu'">
            <span class="material-icons-outlined">{{ mobileMenuOpen() ? 'close' : 'menu' }}</span>
          </button>
          <div class="header-actions">
            @if (authService.isAuthenticated()) {
              <div class="user-info">
                @if (authService.user(); as user) {
                  @if (user.picture) {
                    <img [src]="user.picture" [alt]="user.name" class="user-avatar" referrerpolicy="no-referrer" />
                  } @else {
                    <span class="material-icons-outlined user-avatar-icon">account_circle</span>
                  }
                  <span class="user-name">{{ user.name }}</span>
                }
                <button class="auth-btn sign-out-btn" (click)="signOut()" aria-label="Sign out">
                  <span class="material-icons-outlined">logout</span>
                </button>
              </div>
            } @else {
              <a routerLink="/login" class="auth-btn sign-in-btn" aria-label="Sign in">
                <span class="material-icons-outlined">login</span>
                <span class="auth-label">Sign In</span>
              </a>
            }
            <button class="theme-toggle" (click)="toggleTheme()" aria-label="Toggle theme">
              <span class="material-icons-outlined theme-icon">
                {{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}
              </span>
            </button>
          </div>
        </div>
        @if (mobileMenuOpen()) {
          <div class="mobile-nav-overlay" (click)="closeMobileMenu()" role="presentation">
            <nav
              id="mobile-nav-drawer"
              class="mobile-nav-drawer"
              (click)="$event.stopPropagation()"
              aria-label="Main navigation">
              <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileMenu()">
                <span class="material-icons-outlined">school</span>
                <span class="nav-label">Learning</span>
              </a>
              <a routerLink="/civic-search" routerLinkActive="active" (click)="closeMobileMenu()">
                <span class="material-icons-outlined">person_search</span>
                <span class="nav-label">Representatives</span>
              </a>
              <a routerLink="/voter-info" routerLinkActive="active" (click)="closeMobileMenu()">
                <span class="material-icons-outlined">location_on</span>
                <span class="nav-label">Voter Info</span>
              </a>
            </nav>
          </div>
        }
      </header>
      <main id="main-content" class="app-main">
        <router-outlet />
      </main>
      <footer class="app-footer">
        <div class="footer-content">
          <span class="footer-logo material-icons-outlined">how_to_vote</span>
          <p>Election Assistant &mdash; Empowering informed voters worldwide</p>
          <p class="footer-sub">Powered by Google Civic Information API</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--color-bg-card);
      border-bottom: 1px solid var(--color-border);
      box-shadow: var(--shadow-sm);
      backdrop-filter: blur(12px);
      background: rgba(255, 255, 255, 0.85);
      animation: fadeInDown 0.5s ease;
    }

    [data-theme="dark"] .app-header {
      background: rgba(30, 41, 59, 0.85);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--spacing-md) var(--spacing-lg);
      display: flex;
      align-items: center;
      gap: var(--spacing-xl);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--font-size-xl);
      font-weight: 800;
      color: var(--color-primary);
      text-decoration: none;
      transition: transform 0.3s ease;
    }

    .logo:hover {
      transform: scale(1.03);
    }

    .logo-icon-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-icon {
      font-size: 28px;
      z-index: 1;
    }

    .logo-pulse {
      position: absolute;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--color-primary);
      opacity: 0.15;
      animation: pulseGlow 3s ease-in-out infinite;
    }

    .logo-text {
      letter-spacing: -0.5px;
    }

    .logo-highlight {
      background: linear-gradient(135deg, var(--color-secondary), var(--color-accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .nav-links {
      display: flex;
      gap: var(--spacing-xs);
      flex: 1;
    }

    .nav-links a {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-lg);
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      font-weight: 500;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-decoration: none;
      position: relative;
      overflow: hidden;
    }

    .nav-links a::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--color-primary);
      opacity: 0;
      transition: opacity 0.3s ease;
      border-radius: var(--radius-lg);
    }

    .nav-links a:hover {
      color: var(--color-primary);
      transform: translateY(-1px);
    }

    .nav-links a:hover::before {
      opacity: 0.06;
    }

    .nav-links a.active {
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
      color: var(--color-text-inverse);
      box-shadow: 0 4px 12px rgba(26, 86, 219, 0.35);
    }

    .nav-links a.active::before {
      display: none;
    }

    .nav-links a .material-icons-outlined {
      font-size: 18px;
      position: relative;
      z-index: 1;
    }

    .nav-label {
      position: relative;
      z-index: 1;
    }

    .mobile-menu-btn {
      display: none;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-bg-sidebar);
      color: var(--color-text-secondary);
      flex-shrink: 0;
    }

    .mobile-nav-overlay {
      display: none;
      position: fixed;
      inset: 0;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.45);
      z-index: 200;
      padding: var(--spacing-lg);
      padding-top: 72px;
    }

    .mobile-nav-drawer {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
      max-width: 320px;
      margin-left: auto;
      padding: var(--spacing-lg);
      background: var(--color-bg-card);
      border-radius: var(--radius-xl);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-xl);
    }

    .mobile-nav-drawer a {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      border-radius: var(--radius-lg);
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      font-weight: 500;
      text-decoration: none;
    }

    .mobile-nav-drawer a.active {
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
      color: var(--color-text-inverse);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-full);
      object-fit: cover;
      border: 2px solid var(--color-border);
    }

    .user-avatar-icon {
      font-size: 32px;
      color: var(--color-text-muted);
    }

    .user-name {
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--color-text-secondary);
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .auth-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-md);
      border-radius: var(--radius-lg);
      font-size: var(--font-size-sm);
      font-weight: 500;
      transition: all 0.3s ease;
      border: 1px solid var(--color-border);
      background: var(--color-bg-sidebar);
      color: var(--color-text-secondary);
      text-decoration: none;
      font-family: inherit;
    }

    .auth-btn:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }

    .auth-btn .material-icons-outlined {
      font-size: 18px;
    }

    .auth-label {
      display: inline;
    }

    .theme-toggle {
      background: var(--color-bg-sidebar);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
      width: 40px;
      height: 40px;
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .theme-toggle:hover {
      background: var(--color-primary);
      color: var(--color-text-inverse);
      border-color: var(--color-primary);
      transform: rotate(180deg);
      box-shadow: 0 4px 15px rgba(26, 86, 219, 0.3);
    }

    .theme-icon {
      font-size: 20px;
    }

    .app-main {
      flex: 1;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: var(--spacing-xl) var(--spacing-lg);
    }

    .app-footer {
      text-align: center;
      padding: var(--spacing-xl) var(--spacing-lg);
      border-top: 1px solid var(--color-border);
      background: var(--color-bg-card);
    }

    .footer-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .footer-logo {
      font-size: 24px;
      color: var(--color-primary);
      opacity: 0.6;
    }

    .footer-content p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      font-weight: 500;
    }

    .footer-sub {
      color: var(--color-text-muted);
      font-size: var(--font-size-xs) !important;
      font-weight: 400 !important;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-wrap: nowrap;
        gap: var(--spacing-md);
      }
      .nav-links {
        display: none;
      }
      .mobile-menu-btn {
        display: flex;
        margin-left: auto;
      }
      .mobile-nav-overlay {
        display: block;
      }
      .logo-text {
        display: none;
      }
      .user-name {
        display: none;
      }
    }
  `]
})
export class AppComponent {
  readonly themeService = inject(ThemeService);
  readonly authService = inject(AuthService);
  readonly mobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  signOut(): void {
    this.authService.signOut();
  }
}
