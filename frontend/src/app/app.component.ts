import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-layout">
      <header class="app-header">
        <div class="header-content">
          <a routerLink="/" class="logo">
            <div class="logo-icon-wrapper">
              <span class="logo-icon material-icons-outlined">how_to_vote</span>
              <span class="logo-pulse"></span>
            </div>
            <span class="logo-text">Election<span class="logo-highlight">Assistant</span></span>
          </a>
          <nav class="nav-links">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <span class="material-icons-outlined">public</span>
              <span class="nav-label">Countries</span>
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
          <button class="theme-toggle" (click)="toggleTheme()" [attr.aria-label]="'Toggle theme'">
            <span class="material-icons-outlined theme-icon" [class.rotating]="true">
              {{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}
            </span>
          </button>
        </div>
      </header>
      <main class="app-main">
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
        flex-wrap: wrap;
        gap: var(--spacing-md);
      }
      .nav-links {
        order: 3;
        width: 100%;
        overflow-x: auto;
      }
      .logo-text {
        display: none;
      }
    }
  `]
})
export class AppComponent {
  readonly themeService: ThemeService;

  constructor(themeService: ThemeService) {
    this.themeService = themeService;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
