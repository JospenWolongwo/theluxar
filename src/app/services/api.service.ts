import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiBaseUrl;
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true, // Include cookies for authentication
  };

  constructor(private http: HttpClient) {}

  /**
   * Generic GET request with error handling and optional fallback
   * @param endpoint API endpoint path
   * @param fallbackData Optional fallback data to return if API call fails
   */
  public get<T>(endpoint: string, fallbackData?: T): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`Making API request to: ${url}`);
    
    return this.http.get<T>(url, this.httpOptions).pipe(
      tap((response) => {
        console.log(`API response from ${endpoint}:`, response);
      }),
      catchError((error) => {
        console.warn(`API request failed for ${endpoint}:`, error);
        return this.handleError(error, fallbackData);
      })
    );
  }

  /**
   * Generic POST request with error handling
   * @param endpoint API endpoint path
   * @param body Request body
   * @param fallbackData Optional fallback data to return if API call fails
   */
  public post<T>(endpoint: string, body: any, fallbackData?: T): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.post<T>(url, body, this.httpOptions).pipe(
      catchError((error) => this.handleError(error, fallbackData))
    );
  }

  /**
   * Generic PUT request with error handling
   * @param endpoint API endpoint path
   * @param body Request body
   * @param fallbackData Optional fallback data to return if API call fails
   */
  public put<T>(endpoint: string, body: any, fallbackData?: T): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.put<T>(url, body, this.httpOptions).pipe(
      catchError((error) => this.handleError(error, fallbackData))
    );
  }

  /**
   * Generic PATCH request with error handling
   * @param endpoint API endpoint path
   * @param body Request body
   * @param fallbackData Optional fallback data to return if API call fails
   */
  public patch<T>(endpoint: string, body: any, fallbackData?: T): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.patch<T>(url, body, this.httpOptions).pipe(
      catchError((error) => this.handleError(error, fallbackData))
    );
  }

  /**
   * Generic DELETE request with error handling
   * @param endpoint API endpoint path
   * @param fallbackData Optional fallback data to return if API call fails
   */
  public delete<T>(endpoint: string, fallbackData?: T): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.delete<T>(url, this.httpOptions).pipe(
      catchError((error) => this.handleError(error, fallbackData))
    );
  }

  /**
   * Handle HTTP errors and return fallback data if provided
   * @param error HTTP error
   * @param fallbackData Optional fallback data
   */
  private handleError<T>(error: HttpErrorResponse, fallbackData?: T): Observable<T> {
    // Error handling logic without console logs
    
    // If fallback data is provided, return it
    if (fallbackData !== undefined) {
      return of(fallbackData);
    }

    // Otherwise, rethrow the error
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  /**
   * Check if the backend is available
   * @returns Observable<boolean>
   */
  public isBackendAvailable(): Observable<boolean> {
    const url = `${this.baseUrl}/health`;
    return this.http.get<any>(url, { ...this.httpOptions, responseType: 'text' as 'json' }).pipe(
      catchError(() => of(false)),
      // If we get any response, the backend is available
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      catchError((_) => of(false))
    );
  }
}
