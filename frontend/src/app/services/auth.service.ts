import { Injectable, signal, computed, NgZone, inject } from '@angular/core';
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

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly ngZone = inject(NgZone);

  private readonly tokenState = signal<string | null>(null);
  private readonly userState = signal<UserProfile | null>(null);

  readonly token = this.tokenState.asReadonly();
  readonly user = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenState() !== null);
  readonly isGoogleConfigured = computed(() => (environment.googleClientId ?? '').length > 0);

  constructor() {
    this.restoreSession();
  }

  initializeGoogleSignIn(buttonElement: HTMLElement): void {
    const clientId = this.getClientId();
    if (!clientId) {
      return;
    }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential: string }) => {
        this.ngZone.run(() => this.handleCredentialResponse(response));
      },
      auto_select: false,
    });

    google.accounts.id.renderButton(buttonElement, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'signin_with',
      shape: 'rectangular',
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
    localStorage.removeItem('election-assistant-token');
    localStorage.removeItem('election-assistant-user');
  }

  private handleCredentialResponse(response: { credential: string }): void {
    const token = response.credential;
    const payload = this.decodeJwtPayload(token);

    if (payload) {
      const user: UserProfile = {
        email: String(payload['email'] ?? ''),
        name: String(payload['name'] ?? ''),
        picture: String(payload['picture'] ?? ''),
      };

      this.tokenState.set(token);
      this.userState.set(user);
      localStorage.setItem('election-assistant-token', token);
      localStorage.setItem('election-assistant-user', JSON.stringify(user));
    }
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

  private getClientId(): string {
    return environment.googleClientId ?? '';
  }
}
