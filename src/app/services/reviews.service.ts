import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { map, catchError, of } from 'rxjs';
import { REVIEWS } from '../../shared/data/reviews.data';
import type { Review } from '../../shared/types/review.type';
import { ApiService } from './api.service';
import { BaseService } from './base.service';

export interface ApiReview {
  id?: string;
  rating: number;
  comment: string;
  user?: { email: string };
  username?: string;
  title?: string;
  feedbackDetails?: string;
  feedbackSummary?: string;
  createdAt?: string;
  verified?: boolean;
  helpful?: number;
  notHelpful?: number;
  content?: string;
  imageUrl?: string;
  position?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewsService extends BaseService {
  constructor(private apiService: ApiService) {
    super();
  }

  /**
   * Get all reviews
   */
  getAllReviews(): Observable<Review[]> {
    const endpoint = '/reviews';
    
    // Prepare fallback data from mock reviews
    const fallbackData = this.normalizeReviews(this.convertReviewsToApiReviews(REVIEWS));

    return this.apiService.get<ApiReview[]>(endpoint, this.convertReviewsToApiReviews(REVIEWS)).pipe(
      map((reviews) => this.normalizeReviews(reviews)),
      catchError((error) => {
        console.warn('Failed to load reviews from API, using fallback data:', error);
        return of(fallbackData);
      })
    );
  }

  /**
   * Get reviews by product ID
   */
  getReviewsByProduct(productId: string): Observable<Review[]> {
    const endpoint = `/reviews/product/${productId}`;
    
    // Prepare fallback data - filter mock reviews for this product
    const fallbackData = this.normalizeReviews(this.convertReviewsToApiReviews(REVIEWS.slice(0, 5))); // Show first 5 reviews as fallback

    return this.apiService.get<ApiReview[]>(endpoint, this.convertReviewsToApiReviews(REVIEWS.slice(0, 5))).pipe(
      map((reviews) => this.normalizeReviews(reviews)),
      catchError((error) => {
        console.warn(`Failed to load reviews for product ${productId} from API, using fallback data:`, error);
        return of(fallbackData);
      })
    );
  }

  /**
   * Get review by ID
   */
  getReviewById(id: string): Observable<Review> {
    const endpoint = `/reviews/${id}`;
    
    // Prepare fallback data
    const fallbackData: Review = {
      id,
      username: 'Anonymous',
      comment: 'Review not available',
      rating: 0,
      title: 'Review Not Found',
      date: new Date(),
      verified: false
    };

    return this.apiService.get<ApiReview>(endpoint, this.convertReviewToApiReview(fallbackData)).pipe(
      map((review) => this.normalizeReview(review)),
      catchError((error) => {
        console.warn(`Failed to load review ${id} from API, using fallback data:`, error);
        return of(fallbackData);
      })
    );
  }

  /**
   * Create a new review
   */
  createReview(review: Partial<Review>): Observable<Review> {
    const endpoint = '/reviews';
    
    // Prepare the review data for API
    const apiReview: ApiReview = {
      rating: review.rating || 0,
      comment: review.comment || '',
      title: review.title || '',
      verified: review.verified || false
    };

    return this.apiService.post<ApiReview>(endpoint, apiReview, apiReview).pipe(
      map((response) => this.normalizeReview(response)),
      catchError((error) => {
        console.error('Failed to create review:', error);
        throw error;
      })
    );
  }

  /**
   * Update a review
   */
  updateReview(id: string, review: Partial<Review>): Observable<Review> {
    const endpoint = `/reviews/${id}`;
    
    // Prepare the review data for API
    const apiReview: ApiReview = {
      rating: review.rating || 0,
      comment: review.comment || '',
      title: review.title || ''
    };

    return this.apiService.patch<ApiReview>(endpoint, apiReview, apiReview).pipe(
      map((response) => this.normalizeReview(response)),
      catchError((error) => {
        console.error(`Failed to update review ${id}:`, error);
        throw error;
      })
    );
  }

  /**
   * Delete a review
   */
  deleteReview(id: string): Observable<void> {
    const endpoint = `/reviews/${id}`;

    return this.apiService.delete<void>(endpoint, undefined).pipe(
      catchError((error) => {
        console.error(`Failed to delete review ${id}:`, error);
        throw error;
      })
    );
  }

  /**
   * Convert Review[] to ApiReview[]
   */
  private convertReviewsToApiReviews(reviews: Review[]): ApiReview[] {
    return reviews.map(review => this.convertReviewToApiReview(review));
  }

  /**
   * Convert Review to ApiReview
   */
  private convertReviewToApiReview(review: Review): ApiReview {
    return {
      id: typeof review.id === 'string' ? review.id : review.id?.toString(),
      rating: review.rating,
      comment: review.comment || review.reviewText || '',
      username: review.username || review.name,
      title: review.title || review.position || '',
      verified: review.verified || false,
      helpful: review.helpful || 0,
      notHelpful: review.notHelpful || 0,
      content: review.content || '',
      imageUrl: review.imageUrl || '',
      position: review.position
    };
  }

  /**
   * Normalize API review data to frontend Review format
   */
  private normalizeReviews(reviews: ApiReview[]): Review[] {
    return reviews.map((review) => this.normalizeReview(review));
  }

  /**
   * Normalize a single API review to frontend Review format
   */
  private normalizeReview(review: ApiReview): Review {
    return {
      id: review.id || '',
      username: review.user?.email || review.username || 'Anonymous',
      comment: review.comment || review.feedbackDetails || '',
      rating: Number(review.rating || 0),
      title: review.title || review.feedbackSummary || '',
      date: review.createdAt ? new Date(review.createdAt) : new Date(),
      verified: review.verified ?? false,
      helpful: Number(review.helpful || 0),
      notHelpful: Number(review.notHelpful || 0),
      content: review.content || '',
      imageUrl: review.imageUrl || '',
      position: review.position
    };
  }
} 