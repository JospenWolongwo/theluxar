import type { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import type { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../../shared/services/notification.service';
import { AuthService } from './auth.service';

/**
 * Intercepts HTTP requests to manage authentication errors
 * With HttpOnly cookies approach, we don't need to manually attach tokens
 * The browser automatically includes cookies for relevant domains
 * This interceptor only handles authentication errors (401) and logout redirection
 */
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  /**
   * Intercept HTTP requests to handle authentication errors
   * @param request The original HTTP request
   * @param next The HTTP handler
   * @returns An observable of the HTTP event stream
   */
  intercept<T>(request: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
    // With HttpOnly cookies, we don't need to manually add tokens
    // Browser will automatically include cookies for the domain

    // Handle authentication errors
    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) {
            // 401 Unauthorized - session expired or invalid
            this.handleAuthError();
          } else if (error.status === 403) {
            // 403 Forbidden - user doesn't have permission
            this.notificationService.showError("You don't have permission to access this resource");
          }
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Handle authentication errors (401)
   * Logs the user out and redirects to home page with a notification
   */
  private handleAuthError(): void {
    // Clear the current session
    this.authService.logout();

    // Navigate to home page
    this.router.navigate(['']);

    // Show notification
    this.notificationService.showError('Your session has expired. Please log in again.');
  }
}
