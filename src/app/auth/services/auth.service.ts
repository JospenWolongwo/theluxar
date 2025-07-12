/* eslint-disable max-lines */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import type { Observable } from 'rxjs';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../shared/services/notification.service';
import type { TokenPayload, User, VerifyResponse } from '../models/auth.models';
import { ApiService } from '../../services/api.service';

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

  constructor(
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService,
    private apiService: ApiService
  ) {
    // Check if we already have tokens in localStorage
    this.checkAuthState();
  }

  /**
   * Redirects to the backend authentication pages
   * @param authType The type of authentication page to redirect to (login, signup)
   * @param returnUrl The URL to return to after authentication
   */
  public redirectToAuth(authType: string, returnUrl = '/'): void {
    try {
      // First check if auth server is reachable
      this.checkServerAvailability(this.authApiUrl, () => {
        // Build the redirect URL and navigate to auth server
        const url = this.buildAuthUrl(authType, returnUrl);
        window.location.href = url;
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Builds the appropriate authentication URL based on auth type according to API documentation
   * @param authType The type of authentication page (login, signup)
   * @param returnUrl The URL to return to after authentication
   * @returns The fully constructed authentication URL
   */
  private buildAuthUrl(authType: string, returnUrl: string): string {
    // Create the client-name:path-to-redirect format
    const clientName = 'luxar-frontend';
    const redirectParam = `${clientName}:${returnUrl}`;

    // Determine the endpoint based on auth type
    switch (authType) {
      case 'signup':
      case 'register':
        return `${this.authApiUrl}/signup?redirect=${encodeURIComponent(
          redirectParam
        )}`;

      case 'login':
      default:
        return `${this.authApiUrl}/login?redirect=${encodeURIComponent(
          redirectParam
        )}`;
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
    this.notificationService.showError(
      'Unable to connect to the authentication service. Please try again later.'
    );
  }

  /**
   * Check current authentication state based on stored tokens (via cookies)
   * Since hello-identity uses HttpOnly cookies, we validate session by calling an authenticated endpoint
   */
  private checkAuthState(): void {
    // Since we're using HttpOnly cookies, we can't check them directly in JavaScript
    // Instead, we'll call an authenticated endpoint to check authentication status
    this.verifySession();
  }

  /**
   * Verify the current session by making a request to an authenticated endpoint
   */
  private verifySession(): void {
    // Try to get user's cart as a way to verify authentication
    // This endpoint requires authentication and will return user data if authenticated
    this.apiService
      .get<any>('/carts', null)
      .subscribe({
        next: (response: any) => {
          // If we get a successful response, user is authenticated
          // For now, we'll assume the user is authenticated if the request succeeds
          // and create a basic user object
          if (response) {
            // Create a basic user object since we don't have detailed user info
            const user: User = {
              id: 'authenticated-user',
              firstName: 'User',
              lastName: '',
              email: ''
            };
            console.log('AuthService: Setting user state to authenticated:', user);
            this.currentUserSubject.next(user);
            this.isAuthenticatedSubject.next(true);
          } else {
            this.clearAuthData();
          }
        },
        error: (error: any) => {
          // If cart request fails, user is not authenticated
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

      // Create a basic user object since we don't have detailed user info
      const user: User = {
        id: payload.sub,
        firstName: 'User',
        lastName: '',
        email: ''
      };
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    } catch (error) {
      this.clearAuthData();
      this.notificationService.showError(
        'Authentication failed. Please try again.'
      );
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
  public refreshToken(): Observable<{
    accessToken: string;
    refreshToken: string;
  }> {
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
            // The fetchUserInfo method is removed, so we'll just update the subject
            // with a basic user object if we were to re-add it.
            // For now, we'll just clear auth data on refresh error.
            this.clearAuthData();
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
    this.http
      .post(`${this.authApiUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
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

  /**
   * Track authentication-related events for analytics
   * @param eventName Name of the event to track
   * @param eventData Optional data to include with the event
   */
  public trackAuthEvent(
    eventName: string,
    eventData: Record<string, any> = {}
  ): void {
    // This is a placeholder for actual analytics tracking
    // In a production app, this would integrate with your analytics service
    console.log(`Auth event: ${eventName}`, eventData);

    // Example integration with analytics services:
    // if (environment.production) {
    //   try {
    //     // Track with your preferred analytics service
    //     // analytics.track(eventName, {
    //     //   ...eventData,
    //     //   timestamp: new Date().toISOString(),
    //     //   userId: this.currentUserValue?.id || 'anonymous'
    //     // });
    //   } catch (error) {
    //     console.error('Analytics tracking error:', error);
    //   }
    // }
  }

  /**
   * Handles return from authentication process
   * Should be called when app loads to check for successful auth
   * @returns Promise that resolves when auth state check completes
   */
  public async handleAuthReturn(): Promise<void> {
    console.log('handleAuthReturn called - checking authentication status');

    // Check if this is a redirect from authentication service
    const isAuthRedirect = this.isAuthRedirect();
    console.log('Is this a redirect from auth service?', isAuthRedirect);

    // Note about HttpOnly cookies
    console.log('NOTE: BAL_ess and BAL_esh are HttpOnly cookies and cannot be detected with document.cookie');
    console.log('If authentication is working, these cookies are present but not visible to JavaScript');
    
    // Small delay to ensure everything is initialized properly
    const delayTime = isAuthRedirect ? 1000 : 300; 
    console.log(`Waiting ${delayTime}ms before verifying session...`);
    await new Promise((resolve) => setTimeout(resolve, delayTime));

    try {
      // Get the stored pre-login URL if any
      const preLoginUrl = localStorage.getItem('preLoginUrl');
      console.log('Pre-login URL from localStorage:', preLoginUrl);

      // Use a Promise wrapper around the verifySession observable
      await new Promise<void>((resolve, reject) => {
        console.log('Making call to /carts endpoint to verify authentication');
        
        // Try to get user's cart as a way to verify authentication
        this.apiService
          .get<any>('/carts', null)
          .subscribe({
            next: (response: any) => {
              console.log('Received /carts response:', response);

              if (response) {
                console.log('Session verified successfully - user is authenticated');
                // Session is valid, create a basic user object
                const user: User = {
                  id: 'authenticated-user',
                  firstName: 'User',
                  lastName: '',
                  email: ''
                };
                console.log('AuthService handleAuthReturn: Setting user state to authenticated:', user);
                this.currentUserSubject.next(user);
                this.isAuthenticatedSubject.next(true);
                
                    // If authenticated and we have a stored URL, navigate back
                    if (preLoginUrl) {
                      try {
                        // Parse the URL to get just the path if it's on the same domain
                        const url = new URL(preLoginUrl);
                        const currentDomain = window.location.origin;

                        if (url.origin === currentDomain) {
                          // Same domain, use router for better SPA experience
                          this.router.navigateByUrl(url.pathname + url.search);
                        } else {
                          // Different domain, do a full navigation
                          window.location.href = preLoginUrl;
                        }

                        // Clear the stored URL
                        localStorage.removeItem('preLoginUrl');

                        // Notify user of successful authentication
                        this.notificationService.showSuccess(
                          'Successfully authenticated'
                        );
                      } catch (e) {
                        console.error('Error parsing pre-login URL:', e);
                      }
                    }
                    resolve();
              } else {
                console.log('No response from /carts - user not authenticated');
                this.clearAuthData();
                resolve();
              }
            },
            error: (error: any) => {
              console.error('Error verifying session:', error);
              this.clearAuthData();
              resolve(); // Don't reject, just resolve with cleared auth state
            },
          });
      });
    } catch (error) {
      console.error('Error in handleAuthReturn:', error);
      this.clearAuthData();
    }
  }

  /**
   * Determines if the current page load is a redirect from the authentication service
   * Uses URL patterns, query params, or referrer to detect auth redirects
   */
  private isAuthRedirect(): boolean {
    // Check for query params that might indicate a redirect from auth service
    const hasAuthParams: boolean = window.location.search.includes('login') || 
                        window.location.search.includes('auth') ||
                        window.location.search.includes('token');
    
    // Check URL path patterns that might indicate a redirect from auth
    const pathIndicatesAuth: boolean = window.location.pathname.includes('auth') || 
                             window.location.pathname === '/' || 
                             window.location.pathname === '/home';
    
    // Check referrer if available
    const referrer = document.referrer;
    const referrerIsAuth: boolean = referrer ? (
      referrer.includes('/login') || 
      referrer.includes('/auth') || 
      referrer.includes(environment.auth.baseUrl)
    ) : false;
    
    // Return true if any conditions suggest this is a redirect from auth
    return hasAuthParams || pathIndicatesAuth || referrerIsAuth;
  }
}
