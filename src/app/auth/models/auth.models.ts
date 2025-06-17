/**
 * User profile information returned from the authentication server
 */
export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * JWT token payload structure for decoding authentication tokens
 */
export interface TokenPayload {
  sub: string; // User ID
  iat: number; // Issued at time
  exp: number; // Expiration time
}

/**
 * Response from verification endpoint when checking if session is valid
 */
export interface VerifyResponse {
  userId: string;
  valid: boolean;
}
