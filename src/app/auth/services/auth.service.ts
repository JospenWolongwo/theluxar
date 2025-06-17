/* eslint-disable max-lines */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import type { Observable } from 'rxjs';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../shared/services/notification.service';
import type { TokenPayload, User, VerifyResponse } from '../models/auth.models';

/**
 * Service responsible for authentication flow with hello-identity server
 * Handles user login, session management, and authentication state
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Auth microservice configuration from environment
  public readonly authApiUrl = environment.auth.baseUrl;
  public readonly userApiUrl = environment.auth.userUrl;
  public readonly clientDelimiter = environment.auth.clientDelimiter;

  // Authentication state observables
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor(private http: HttpClient, private router: Router, private notificationService: NotificationService) {
    // Check if we already have tokens in localStorage
    this.checkAuthState();
  }

  /**
   * Redirects to the hello-identity authentication server
   * @param authType The type of authentication page to redirect to (login, register, etc.)
   * @param returnUrl The URL to return to after authentication
   */
  public redirectToAuth(authType: string, returnUrl = '/'): void {
    try {
      // First check if auth server is reachable
      this.checkServerAvailability(this.authApiUrl, () => {
        // Build the redirect URL and navigate to hello-identity server
        const url = this.buildAuthUrl(authType, returnUrl);
        window.location.href = url;
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Builds the appropriate authentication URL based on auth type
   * @param authType The type of authentication page (login, register, etc.)
   * @param returnUrl The URL to return to after authentication
   * @returns The fully constructed authentication URL
   */
  private buildAuthUrl(authType: string, returnUrl: string): string {
    // Create client-specific redirect parameter with delimiter
    const redirectParams = `client1${this.clientDelimiter}${returnUrl}`;

    // Determine the endpoint based on auth type
    switch (authType) {
      case 'register':
        return `${this.authApiUrl}/signup?redirect=${encodeURIComponent(redirectParams)}`;

      case 'forgot-password':
        return `${this.authApiUrl}/forgot-password?redirect=${encodeURIComponent(redirectParams)}`;

      case 'reset-password':
        // For reset-password, we need to pass the token from the URL params
        const token = new URLSearchParams(window.location.search).get('token');

        return `${this.authApiUrl}/reset-password?token=${token}&redirect=${encodeURIComponent(redirectParams)}`;

      case 'login':
      default:
        return `${this.authApiUrl}/login?redirect=${encodeURIComponent(redirectParams)}`;
    }
  }

  /**
   * Check if the authentication server is available before redirecting
   * @param baseUrl The base URL of the auth server
   * @param callback Function to call if server is available
   */
  private checkServerAvailability(baseUrl: string, callback: () => void): void {
    const xhr = new XMLHttpRequest();
    const TIMEOUT_MS = 3000;

    // Handle response state changes
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 0 || xhr.status >= 500) {
          // Server not available or serious error
          this.showConnectionError();
        } else {
          // Server is available or returns expected error (like 404)
          // which means the server is running but endpoint may not exist
          callback();
        }
      }
    };

    // Handle request timeout
    xhr.timeout = TIMEOUT_MS;
    xhr.ontimeout = () => this.showConnectionError();

    try {
      // We're just checking if the server is up, not a specific endpoint
      xhr.open('HEAD', baseUrl, true);
      xhr.send();
    } catch (e) {
      this.showConnectionError();
      throw e;
    }
  }

  /**
   * Show a user-friendly error notification when authentication server is unavailable
   */
  private showConnectionError(): void {
    this.notificationService.showError('Unable to connect to the authentication service. Please try again later.');
  }

  /**
   * Check current authentication state based on stored tokens (via cookies)
   * Since hello-identity uses HttpOnly cookies, we validate session by calling verify endpoint
   */
  private checkAuthState(): void {
    // Check if access token cookie exists
    const cookieName = environment.auth.cookieNames.accessToken;
    const hasCookie = this.cookieExists(cookieName);

    if (!hasCookie) {
      this.clearAuthData();

      return;
    }

    // Verify session with server
    this.verifySession();
  }

  /**
   * Verify the current session with the authentication server
   */
  private verifySession(): void {
    this.http.get<VerifyResponse>(`${this.authApiUrl}/verify`, { withCredentials: true }).subscribe({
      next: (response) => {
        if (response?.userId && response?.valid) {
          // Session is valid, get user info
          this.fetchUserInfo(response.userId).subscribe();
        } else {
          this.clearAuthData();
        }
      },
      error: () => {
        // Token is invalid or expired, clear auth data
        this.clearAuthData();
      },
    });
  }

  /**
   * Check if a specific cookie exists
   * @param name Cookie name to check
   * @returns True if cookie exists, false otherwise
   */
  private cookieExists(name: string): boolean {
    const cookies = document.cookie.split(';');

    return cookies.some((cookie) => cookie.trim().startsWith(`${name}=`));
  }

  /**
   * Parse a JWT token to extract its payload
   * @param token The JWT token to parse
   * @returns The decoded token payload
   */
  private parseJwt(token: string): TokenPayload {
    try {
      // Extract payload part (second segment of JWT)
      const base64Url = token.split('.')[1];
      if (!base64Url) {
        throw new Error('Invalid token format');
      }

      // Convert base64url to base64
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

      // Decode base64 string
      const rawPayload = atob(base64);

      // Convert to UTF-8 string
      const utf8Payload = decodeURIComponent(
        Array.from(rawPayload)
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      // Parse JSON
      return JSON.parse(utf8Payload);
    } catch (error) {
      // Log error and rethrow with a more user-friendly message
      throw new Error('Failed to process authentication token');
    }
  }

  /**
   * Fetch current user information from the user endpoint
   * @param userId The ID of the user to fetch
   * @returns Observable with user data
   */
  private fetchUserInfo(userId: string): Observable<User> {
    // Start loading state
    this.isLoadingSubject.next(true);

    // Request user data from API
    return this.http.get<User>(`${this.userApiUrl}/${userId}`, { withCredentials: true }).pipe(
      // Update auth state on success
      tap((user) => {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }),
      // Handle errors
      catchError((error) => {
        this.clearAuthData();
        this.notificationService.showError('Failed to load user profile');

        return throwError(() => error);
      }),
      // End loading state regardless of outcome
      tap(() => this.isLoadingSubject.next(false))
    );
  }

  /**
   * Process authentication tokens received from the authentication server
   * Note: With the hello-identity service, tokens are automatically stored in HTTP-only cookies
   * This method just extracts user ID and triggers user info fetch
   *
   * @param accessToken JWT access token to process
   * @param refreshToken Refresh token (unused, as managed by HttpOnly cookies)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public setTokens(accessToken: string, refreshToken: string): void {
    try {
      // Parse the access token to get user ID
      const payload = this.parseJwt(accessToken);

      // Get user info to update our application state
      this.fetchUserInfo(payload.sub).subscribe({
        error: () => this.clearAuthData(),
      });
    } catch (error) {
      this.clearAuthData();
      this.notificationService.showError('Authentication failed. Please try again.');
    }
  }

  /**
   * Clear authentication state
   * Note: HTTP-only cookies can't be directly managed by JavaScript
   */
  private clearAuthData(): void {
    // Reset authentication state in the application
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.isLoadingSubject.next(false);
  }

  /**
   * Check if user is authenticated based on the current auth state
   * @returns True if user is authenticated, false otherwise
   */
  public isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Get the current auth token
   * Note: This is a placeholder method as we're using HttpOnly cookies
   * The token cannot be accessed directly from JavaScript
   * @returns Placeholder token string if authenticated, null otherwise
   */
  public getAccessToken(): string | null {
    return this.isAuthenticatedSubject.value ? 'cookie-auth-token' : null;
  }

  /**
   * Refresh the access token using HttpOnly cookie
   * @returns Observable with new token information
   */
  public refreshToken(): Observable<{ accessToken: string; refreshToken: string }> {
    // The refresh token is automatically included in the cookies
    return this.http
      .post<{ accessToken: string; refreshToken: string }>(
        `${this.authApiUrl}/refresh-token`,
        {},
        { withCredentials: true }
      )
      .pipe(
        tap((tokens) => {
          try {
            // Parse new token and update user info
            const payload = this.parseJwt(tokens.accessToken);
            this.fetchUserInfo(payload.sub).subscribe();
          } catch (error) {
            this.clearAuthData();
          }
        }),
        catchError((error) => {
          this.clearAuthData();

          return throwError(() => error);
        })
      );
  }

  /**
   * Logout the user and redirect to login page
   */
  public logout(): void {
    // Make logout request to clear server-side cookies
    this.http.post(`${this.authApiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => this.handleLogoutSuccess(),
      error: () => this.handleLogoutSuccess(), // Still clear local state even if server request fails
    });
  }

  /**
   * Handle successful logout by clearing state and redirecting
   */
  private handleLogoutSuccess(): void {
    this.clearAuthData();
    this.router.navigate(['/']);
    this.notificationService.showInfo('You have been logged out successfully');
  }

  /**
   * Get the current user value without subscribing
   * @returns Current user object or null if not authenticated
   */
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
}
