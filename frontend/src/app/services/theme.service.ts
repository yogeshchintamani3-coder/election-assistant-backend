import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  private readonly darkMode = signal<boolean>(this.getStoredTheme());

  readonly isDark = computed(() => this.darkMode());

  constructor() {
    this.applyTheme();
  }

  toggleTheme(): void {
    this.darkMode.update(v => !v);
    this.applyTheme();
  }

  private applyTheme(): void {
    const theme = this.darkMode() ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('election-assistant-theme', theme);
  }

  private getStoredTheme(): boolean {
    const stored = localStorage.getItem('election-assistant-theme');
    if (stored) {
      return stored === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
