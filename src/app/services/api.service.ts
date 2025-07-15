import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError, of, tap, switchMap, firstValueFrom } from 'rxjs';
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
   * Make a GET request with intelligent fallback strategies
   * @param endpoint API endpoint path
   * @param fallbackData Optional fallback data to return if API call fails
   */
  public get<T>(endpoint: string, fallbackData?: T): Observable<T> {
    // Check if we're in production domain (theluxar.com) but using relative URL patterns
    if (this.baseUrl.startsWith('/') && window.location.href.includes('theluxar.com')) {
      console.warn(`Using relative API path in production may cause issues: ${this.baseUrl}`);
      console.warn('Forcing production API URL');
      
      // Force use of production API URL when on production domain
      const productionApiUrl = 'https://theluxarapi-4s3ok4xm.b4a.run';
      const url = `${productionApiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      console.log(`Making forced production API request to: ${url}`);
      
      // Try the production API URL directly
      return this.http.get<T>(url, this.httpOptions).pipe(
        tap(response => console.log(`API response from forced production URL ${url}:`, response)),
        catchError(error => this.handleError(error, fallbackData))
      );
    }
    
    // Standard request for non-production or correctly configured environments
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`Making API request to: ${url}`);
    
    return this.http.get<T>(url, this.httpOptions).pipe(
      tap(response => console.log(`API response from ${endpoint}:`, response)),
      catchError(error => {
        console.warn(`API request failed for ${endpoint}:`, error);
        
        // If we got a parse error but the status was 200, try with text response type
        if (error.status === 200 && error.message && error.message.includes('parsing')) {
          console.log(`Retrying ${endpoint} as text response`);
          
          return this.handleTextResponse<T>(url, endpoint, fallbackData);
        }
        
        return this.handleError(error, fallbackData);
      })
    );
  }
  
  /**
   * Try to handle response as text and parse as JSON or use fallback strategies
   * @param url The URL to request
   * @param endpoint Original endpoint for logging
   * @param fallbackData Optional fallback data
   * @returns Observable of the parsed response or fallback
   */
  private handleTextResponse<T>(url: string, endpoint: string, fallbackData?: T): Observable<T> {
    return this.http.get(url, { ...this.httpOptions, responseType: 'text' }).pipe(
      switchMap(textResponse => {
        console.log(`Received text response from ${endpoint}:`, textResponse);
        
        // Check if response is HTML instead of JSON
        if (typeof textResponse === 'string' && 
            (textResponse.trim().startsWith('<!DOCTYPE') || 
             textResponse.trim().startsWith('<html'))) {
          console.error('Received HTML instead of JSON. This indicates a server routing issue.');
          console.warn('Falling back to production API URL');
          
          return this.tryProductionApi<T>(endpoint, fallbackData);
        }
        
        // Try to parse the text as JSON
        try {
          const jsonResponse = JSON.parse(textResponse);
          return of(jsonResponse as T);
        } catch (parseError) {
          console.error(`Failed to parse text response as JSON:`, parseError);
          
          if (fallbackData !== undefined) {
            return of(fallbackData);
          }
          
          // Try production API as last resort
          return this.tryProductionApi<T>(endpoint, fallbackData);
        }
      }),
      catchError(error => this.handleError(error, fallbackData))
    );
  }
  
  /**
   * Try to fetch data from the production API as a fallback
   * @param endpoint Original endpoint
   * @param fallbackData Optional fallback data
   * @returns Observable of the response or fallback
   */
  private tryProductionApi<T>(endpoint: string, fallbackData?: T): Observable<T> {
    const productionApiUrl = 'https://theluxarapi-4s3ok4xm.b4a.run';
    const fallbackUrl = `${productionApiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    console.log(`Making fallback API request to: ${fallbackUrl}`);
    
    return this.http.get<T>(fallbackUrl, this.httpOptions).pipe(
      catchError(fallbackError => {
        console.error(`Fallback request to production API failed:`, fallbackError);
        return this.handleError(fallbackError, fallbackData);
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
