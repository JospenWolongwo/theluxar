/* eslint-disable max-lines */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import type { StockAvailabilityStatus } from '../../shared/enums';
import type { ApiReview, ApiStock } from '../../shared/types/api-types';
import type { Product } from '../../shared/types/product.type';
import { generateProductSlug } from '../../shared/utils/string.utils';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService extends BaseService {
  constructor(protected http: HttpClient) {
    super();
  }

  /**
   * Get all products with optional limit
   * @param limit Optional number of products to return
   */
  getProducts(limit?: number): Observable<Product[]> {
    const url = limit ? `${this.baseUrl}/products?limit=${limit}` : `${this.baseUrl}/products`;

    return this.http.get<Product[]>(url, this.httpOptions).pipe(
      map((response) => {
        return response.map((product) => {
          // Generate the product ID part for the slug
          const idPart = product.id?.substring(0, 8) || '';

          const normalizedProduct = {
            ...product,
            // Provide defaults for critical properties that might be missing
            id: product.id || '',
            name: product.name || 'Unknown Product',
            specs: product.specs || '',
            price: Number(product.price || 0),
            currency: product.currency || 'XAF',
            imageUrl: product.imageUrl || 'assets/images/products/placeholder.png',
            galleryImages: product.galleryImages || [product.imageUrl || 'assets/images/products/placeholder.png'],
            features: product.features || [],
            label: product.label || null,
            labelColor: product.labelColor || '#000000',
            inStock: product.inStock ?? true,
            shortDescription: product.shortDescription || '',
            inWishlist: product.inWishlist ?? false,
            stocks: this.normalizeStocks(product.stocks),
            reviews: this.normalizeReviews(product.reviews),
            rating: product.rating || this.calculateAverageRating(product.reviews),
          };

          // Generate and set the slug using shared utility
          normalizedProduct.slug = generateProductSlug(normalizedProduct.name, idPart);

          return normalizedProduct;
        });
      })
    );
  }

  /**
   * Get a product by ID
   * @param id Product ID
   */
  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/product/${id}`, this.httpOptions).pipe(
      map((product) => ({
        ...product,
        id: product.id || '',
        name: product.name || 'Unknown Product',
        specs: product.specs || '',
        price: Number(product.price || 0),
        currency: product.currency || 'XAF',
        imageUrl: product.imageUrl || 'assets/images/products/placeholder.png',
        galleryImages: product.galleryImages || [product.imageUrl || 'assets/images/products/placeholder.png'],
        features: product.features || [],
        label: product.label || null,
        labelColor: product.labelColor || '#000000',
        inStock: product.inStock ?? true,
        shortDescription: product.shortDescription || '',
        inWishlist: product.inWishlist ?? false,
        stocks: this.normalizeStocks(product.stocks),
        reviews: this.normalizeReviews(product.reviews),
        rating: product.rating || this.calculateAverageRating(product.reviews),
      }))
    );
  }

  /**
   * Get a product by slug (product-name-uniqueid format)
   * @param slug Product slug
   */
  getProductBySlug(slug: string): Observable<Product> {
    // For now, this will fetch all products and filter client-side
    // In a real-world scenario, you'd create a dedicated API endpoint

    return this.getProducts().pipe(
      map((products) => {
        const product = products.find((p) => {
          // Using the shared utility function for consistent slug generation
          const productSlug = generateProductSlug(p.name, p.id.substring(0, 8));

          return productSlug === slug;
        });

        if (!product) {
          throw new Error(`Product with slug '${slug}' not found`);
        }

        return product;
      })
    );
  }

  // Removed duplicate generateSlug method - now using shared utility function

  /**
   * Get product stocks by product ID
   * @param productId Product ID
   */
  getProductStocks(productId: string): Observable<Product['stocks']> {
    return this.http
      .get<Product['stocks']>(`${this.baseUrl}/product/${productId}/stocks`, this.httpOptions)
      .pipe(map((stocks) => this.normalizeStocks(stocks)));
  }

  /**
   * Get product reviews by product ID
   * @param productId Product ID
   */
  getProductReviews(productId: string): Observable<Product['reviews']> {
    return this.http
      .get<Product['reviews']>(`${this.baseUrl}/product/${productId}/reviews`, this.httpOptions)
      .pipe(map((reviews) => this.normalizeReviews(reviews)));
  }

  /**
   * Search products
   * @param query Search query
   * @param page Page number (default: 1)
   * @param size Results per page (default: 10)
   */
  searchProducts(query: string, page = 1, size = 10): Observable<Product[]> {
    return this.http.post<Product[]>(`${this.baseUrl}/search/products`, { query, page, size }, this.httpOptions).pipe(
      map((products) => {
        return products.map((product) => ({
          ...product,
          // Ensure critical fields have default values
          id: product.id || '',
          name: product.name || 'Unknown Product',
          specs: product.specs || '',
          price: Number(product.price || 0),
          currency: product.currency || 'XAF',
          imageUrl: product.imageUrl || 'assets/images/products/placeholder.png',
          galleryImages: product.galleryImages || [product.imageUrl || 'assets/images/products/placeholder.png'],
          features: product.features || [],
          label: product.label || null,
          labelColor: product.labelColor || '#000000',
          inStock: product.inStock ?? true,
          shortDescription: product.shortDescription || '',
          inWishlist: product.inWishlist ?? false,
          stocks: this.normalizeStocks(product.stocks),
          reviews: this.normalizeReviews(product.reviews),
          rating: product.rating || this.calculateAverageRating(product.reviews),
        }));
      })
    );
  }

  /**
   * Get products by category ID
   * @param categoryId Category ID
   * @param limit Optional number of products to return
   * @param currentProductId Optional current product ID to exclude from results
   */
  getProductsByCategory(categoryName: string, limit?: number, currentProductId?: string): Observable<Product[]> {
    // Since the category-specific endpoint doesn't exist, we'll fetch all products and filter client-side
    return this.getProducts().pipe(
      map((products) => {
        // Normalize the category names for precise matching
        const normalizedCategoryName = categoryName.trim().toLowerCase();
        const normalizedCategoryNamePlural = normalizedCategoryName + 's';

        // Filter products by the specified category name
        let filteredProducts = products.filter((product) => {
          const productCategory = product.categoryName?.trim().toLowerCase() || '';

          return (
            productCategory === normalizedCategoryName ||
            productCategory === normalizedCategoryNamePlural ||
            productCategory.includes(normalizedCategoryName) ||
            productCategory.includes(normalizedCategoryNamePlural)
          );
        });

        // Exclude the current product if ID is provided
        if (currentProductId) {
          filteredProducts = filteredProducts.filter((product) => product.id !== currentProductId);
        }

        // Apply limit if specified
        if (limit && limit > 0) {
          filteredProducts = filteredProducts.slice(0, limit);
        }

        return filteredProducts;
      })
    );
  }

  /**
   * Helper method to normalize stock data
   */
  private normalizeStocks(stocks?: ApiStock[]): Product['stocks'] {
    if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
      return [];
    }

    return stocks.map((stock) => ({
      id: stock.id || '',
      quantity: Number(stock.quantity || 0),
      price: Number(stock.price || 0),
      characteristics: stock.characteristics || {},
      isAvailable: stock.isAvailable ?? true,
      discount: stock.discount || 0,
      discounts: stock.discounts || [],
      availabilityStatus: stock.availabilityStatus as StockAvailabilityStatus,
      keepingUnit: stock.keepingUnit || '',
      guarantee: stock.guarantee,
      pictures: stock.pictures || [],
      description: stock.description,
      shortDescription: stock.description?.shortDescription || null,
      longDescription: stock.description?.longDescription || null,
      manualPdf: stock.manualPdf || null,
      deliveryDuration: stock.deliveryDuration || null,
      liked: stock.liked || false,
    }));
  }

  /**
   * Helper method to normalize review data
   */
  private normalizeReviews(reviews?: ApiReview[]): Product['reviews'] {
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return [];
    }

    return reviews.map((review) => ({
      id: review.id || '',
      // Map API fields to both API-specific and UI-specific properties
      username: review.user?.email || review.username || 'Anonymous',
      name: review.username || review.user?.email || 'Anonymous', // For UI components
      comment: review.comment || review.feedbackDetails || '',
      reviewText: review.comment || review.feedbackDetails || '', // For UI components
      rating: Number(review.rating || 0),
      title: review.title || review.feedbackSummary || '',
      date: review.createdAt || new Date(),
      verified: review.verified ?? false,
      helpful: Number(review.helpful || 0),
      notHelpful: Number(review.notHelpful || 0),
      content: review.content || '',
      imageUrl: review.imageUrl || '',
      // If there's a position in the original data, preserve it
      position: review.position as string | undefined,
    }));
  }

  /**
   * Calculate average rating from reviews
   */
  private calculateAverageRating(reviews?: ApiReview[]): number {
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return 0;
    }

    const sum = reviews.reduce((total, review) => total + Number(review.rating || 0), 0);

    return Number((sum / reviews.length).toFixed(1));
  }
}
