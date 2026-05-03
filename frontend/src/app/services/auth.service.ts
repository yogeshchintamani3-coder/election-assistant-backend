import { Injectable, signal, computed, NgZone, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

declare const google: {
  accounts: {
    id: {
      initialize: (config: Record<string, unknown>) => void;
      renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
      prompt: () => void;
      revoke: (email: string, callback: () => void) => void;
    };
  };
};

export interface UserProfile {
  readonly email: string;
  readonly name: string;
  readonly picture: string;
}

interface AuthResponse {
  readonly token: string;
  readonly email: string;
  readonly name: string;
  readonly picture: string;
}

interface PublicConfig {
  readonly googleClientId: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly ngZone = inject(NgZone);
  private readonly http = inject(HttpClient);
  private readonly authUrl = `${environment.apiBaseUrl}/api/auth`;
  private readonly configUrl = `${environment.apiBaseUrl}/api/config`;

  private readonly tokenState = signal<string | null>(null);
  private readonly userState = signal<UserProfile | null>(null);
  private readonly authLoadingState = signal<boolean>(false);
  private readonly authErrorState = signal<string | null>(null);
  private readonly googleClientIdState = signal<string>('');
  private readonly configLoadedState = signal<boolean>(false);
  private readonly googleSdkReadyState = signal<boolean>(false);
  private readonly publicEmailsState = signal<string[]>(['test@example.com']);
  private googleInitialized = false;

  readonly token = this.tokenState.asReadonly();
  readonly user = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenState() !== null);
  readonly isGoogleConfigured = computed(() => this.googleClientIdState().length > 0);
  readonly configLoaded = this.configLoadedState.asReadonly();
  readonly googleSdkReady = this.googleSdkReadyState.asReadonly();
  readonly googleReady = computed(() => this.isGoogleConfigured() && this.googleSdkReadyState());
  readonly authLoading = this.authLoadingState.asReadonly();
  readonly authError = this.authErrorState.asReadonly();
  readonly publicEmails = this.publicEmailsState.asReadonly();

  constructor() {
    console.log('[AuthService] Initializing...');
    this.restoreSession();
    this.loadPublicConfig();
    this.pollForGoogleSdk();
    this.loadPublicEmails();
  }

  initializeGoogleSignIn(buttonElement: HTMLElement): void {
    const clientId = this.googleClientIdState();
    if (!clientId || !this.isGoogleSdkAvailable()) {
      return;
    }

    if (!this.googleInitialized) {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: { credential: string }) => {
          this.ngZone.run(() => this.handleCredentialResponse(response));
        },
        auto_select: false,
      });
      this.googleInitialized = true;
    }

    google.accounts.id.renderButton(buttonElement, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'continue_with',
      shape: 'rectangular',
      width: 300,
    });
  }

  loginWithEmail(email: string, password: string): void {
    this.authLoadingState.set(true);
    this.authErrorState.set(null);

    this.http.post<AuthResponse>(`${this.authUrl}/login`, { email, password })
      .subscribe({
        next: (res) => this.handleAuthSuccess(res),
        error: (err) => {
          const message = err.error?.message ?? 'Login failed. Please check your credentials.';
          this.authErrorState.set(message);
          this.authLoadingState.set(false);
        }
      });
  }

  registerWithEmail(name: string, email: string, password: string): void {
    this.authLoadingState.set(true);
    this.authErrorState.set(null);

    this.http.post<AuthResponse>(`${this.authUrl}/register`, { name, email, password })
      .subscribe({
        next: (res) => this.handleAuthSuccess(res),
        error: (err) => {
          const message = err.error?.message ?? 'Registration failed. Please try again.';
          this.authErrorState.set(message);
          this.authLoadingState.set(false);
        }
      });
  }

  signInAsGuest(): void {
    const guestUser: UserProfile = {
      email: 'guest@election-assistant.app',
      name: 'Guest User',
      picture: '',
    };
    const guestToken = 'guest-session';
    this.tokenState.set(guestToken);
    this.userState.set(guestUser);
    localStorage.setItem('election-assistant-token', guestToken);
    localStorage.setItem('election-assistant-user', JSON.stringify(guestUser));
  }

  signOut(): void {
    const user = this.userState();
    const currentToken = this.tokenState();
    if (user && currentToken !== 'guest-session') {
      try {
        google.accounts.id.revoke(user.email, () => {});
      } catch {
        // Google SDK may not be loaded
      }
    }
    this.tokenState.set(null);
    this.userState.set(null);
    this.authErrorState.set(null);
    this.googleInitialized = false;
    localStorage.removeItem('election-assistant-token');
    localStorage.removeItem('election-assistant-user');
  }

  private isGoogleSdkAvailable(): boolean {
    return typeof google !== 'undefined' &&
           typeof google.accounts !== 'undefined' &&
           typeof google.accounts.id !== 'undefined';
  }

  private pollForGoogleSdk(): void {
    if (this.isGoogleSdkAvailable()) {
      this.googleSdkReadyState.set(true);
      return;
    }
    let attempts = 0;
    const maxAttempts = 50;
    const interval = setInterval(() => {
      attempts++;
      if (this.isGoogleSdkAvailable()) {
        this.googleSdkReadyState.set(true);
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 200);
  }

  private loadPublicConfig(): void {
    this.http.get<PublicConfig>(`${this.configUrl}/public`)
      .subscribe({
        next: (config) => {
          console.log('[AuthService] Public config loaded:', config);
          const clientId = config.googleClientId || environment.googleClientId;
          this.googleClientIdState.set(clientId);
          this.configLoadedState.set(true);
        },
        error: (err) => {
          console.error('[AuthService] Failed to load public config:', err);
          const fallbackId = environment.googleClientId;
          if (fallbackId) {
            console.log('[AuthService] Using environment fallback for Google Client ID');
            this.googleClientIdState.set(fallbackId);
          }
          this.configLoadedState.set(true);
        }
      });
  }

  private loadPublicEmails(): void {
    this.http.get<string[]>(`${this.authUrl}/public-emails`)
      .subscribe({
        next: (emails) => this.publicEmailsState.set(emails),
        error: (err) => console.error('[AuthService] Failed to load public emails:', err)
      });
  }

  private handleCredentialResponse(response: { credential: string }): void {
    const googleIdToken = response.credential;
    this.authLoadingState.set(true);
    this.authErrorState.set(null);

    this.http.post<AuthResponse>(`${this.authUrl}/google`, { idToken: googleIdToken })
      .subscribe({
        next: (res) => this.handleAuthSuccess(res),
        error: () => {
          this.authErrorState.set('Google authentication failed. Please try again.');
          this.authLoadingState.set(false);
        }
      });
  }

  private handleAuthSuccess(authResponse: AuthResponse): void {
    const user: UserProfile = {
      email: authResponse.email,
      name: authResponse.name,
      picture: authResponse.picture ?? '',
    };

    this.tokenState.set(authResponse.token);
    this.userState.set(user);
    localStorage.setItem('election-assistant-token', authResponse.token);
    localStorage.setItem('election-assistant-user', JSON.stringify(user));
    this.authLoadingState.set(false);
  }

  private restoreSession(): void {
    const token = localStorage.getItem('election-assistant-token');
    const userJson = localStorage.getItem('election-assistant-user');

    if (token && userJson) {
      try {
        if (token === 'guest-session') {
          this.tokenState.set(token);
          this.userState.set(JSON.parse(userJson));
          return;
        }
        const payload = this.decodeJwtPayload(token);
        const exp = Number(payload?.['exp'] ?? 0);
        if (payload && exp > 0 && exp * 1000 > Date.now()) {
          this.tokenState.set(token);
          this.userState.set(JSON.parse(userJson));
        } else {
          this.signOut();
        }
      } catch {
        this.signOut();
      }
    }
  }

  private decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }
}
