/* eslint-disable max-lines */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { map, catchError, of } from 'rxjs';
import { MOCK_PRODUCTS } from '../../shared/data/products.data';
import { REVIEWS } from '../../shared/data/reviews.data';
import type { Review } from '../../shared/types/review.type';
import type { StockAvailabilityStatus } from '../../shared/enums';
import type { ApiReview, ApiStock } from '../../shared/types/api-types';
import type { Product } from '../../shared/types/product.type';
import { generateProductSlug } from '../../shared/utils/string.utils';
import { ApiService } from './api.service';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService extends BaseService {
  constructor(private apiService: ApiService) {
    super();
  }

  /**
   * Get all products with optional limit
   * @param limit Optional number of products to return
   */
  getProducts(limit?: number): Observable<Product[]> {
    // Create endpoint URL with limit parameter if provided
    const endpoint = limit ? `/products?limit=${limit}` : '/products';
    
    // Prepare fallback data from mock products
    let fallbackProducts = [...MOCK_PRODUCTS];
    if (limit && fallbackProducts.length > limit) {
      fallbackProducts = fallbackProducts.slice(0, limit);
    }

    return this.apiService.get<Product[]>(endpoint, fallbackProducts).pipe(
      map((products) => {
        return products.map((product: any) => {
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
            imageUrl: product.imageUrl || '/assets/images/products/placeholder.jpg',
            galleryImages: product.galleryImages || (product.imageUrl ? [product.imageUrl] : ['/assets/images/products/placeholder.jpg']),
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
    const endpoint = `/products/${id}`;
    
    // Find the product with matching id in mock data for fallback
    const mockProduct = MOCK_PRODUCTS.find(product => product.id === id);
    const fallbackData = mockProduct || MOCK_PRODUCTS[0]; // Use first product as fallback if no match
    
    return this.apiService.get<Product>(endpoint, fallbackData).pipe(
      map((product: any) => ({
        ...product,
        id: product.id || '',
        name: product.name || 'Unknown Product',
        specs: product.specs || '',
        price: Number(product.price || 0),
        currency: product.currency || 'XAF',
        imageUrl: product.imageUrl || '/assets/images/products/placeholder.jpg',
        galleryImages: product.galleryImages || (product.imageUrl ? [product.imageUrl] : ['/assets/images/products/placeholder.jpg']),
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
        // First try to find the product by exact slug match
        let product = products.find((p) => p.slug === slug);
        
        // If not found, fall back to the original search method
        if (!product) {
          product = products.find((p) => {
            // Using the shared utility function for consistent slug generation
            const productSlug = generateProductSlug(p.name, p.id.substring(0, 8));
            return productSlug === slug;
          });
        }

        // If we still can't find the product, try to find a fallback in mock data
        if (!product) {
          // Look for a fallback in mock data
          const mockProduct = MOCK_PRODUCTS.find(p => {
            const productSlug = generateProductSlug(p.name, p.id.substring(0, 8));
            return productSlug === slug || p.slug === slug;
          });
          
          if (mockProduct) {
            return mockProduct;
          }
          
          // If still no product found, throw an error
          throw new Error(`Product with slug '${slug}' not found`);
        }

        return product;
      }),
      catchError(error => {
        console.error(`Error finding product with slug: ${slug}`, error);
        
        // Look for a fallback in mock data
        const mockProduct = MOCK_PRODUCTS.find(p => {
          const productSlug = generateProductSlug(p.name, p.id.substring(0, 8));
          return productSlug === slug || p.slug === slug;
        });
        
        if (mockProduct) {
          return of(mockProduct);
        }
        
        // If no product found in mock data either, rethrow the error
        throw new Error(`Product with slug '${slug}' not found`);
      })
    );
  }

  // Removed duplicate generateSlug method - now using shared utility function
  /**
   * Get product stocks by product ID
   * @param productId Product ID
   */
  getProductStocks(productId: string): Observable<Product['stocks']> {
    const endpoint = `/stock/product/${productId}`;
    return this.apiService.get<ApiStock[]>(endpoint, []).pipe(
      map((stocks) => this.normalizeStocks(stocks))
    );
  }

  /**
   * Get product reviews by product ID
   * @param productId Product ID
   */
  getProductReviews(productId: string): Observable<Product['reviews']> {
    const endpoint = `/reviews/product/${productId}`;
    
    // Create fallback reviews data - convert REVIEWS (type Review[]) to ApiReview[] 
    const fallbackReviews = REVIEWS.filter(() => Math.random() > 0.5)
      .map(review => {
        return {
          id: review.id?.toString(), // Convert possible number id to string
          rating: review.rating,
          comment: review.reviewText,
          user: { email: review.name },
          username: review.name,
          title: review.position || '',
          feedbackDetails: review.reviewText,
          feedbackSummary: review.position,
          createdAt: review.date || new Date().toISOString(),
          verified: true,
          helpful: 0,
          notHelpful: 0,
          content: review.reviewText,
          imageUrl: review.imageUrl,
          position: review.position
        } as ApiReview;
      });
    
    return this.apiService.get<ApiReview[]>(endpoint, fallbackReviews).pipe(
      map((reviews) => this.normalizeReviews(reviews))
    );
  }

  /**
   * Search products
   * @param query Search query
   * @param page Page number (default: 1)
   * @param size Results per page (default: 10)
   */
  searchProducts(query: string, page = 1, size = 10): Observable<Product[]> {
    const endpoint = `/products/search?q=${query}&page=${page}&size=${size}`;
    
    // Filter mock products for fallback data
    const normalizedQuery = query.toLowerCase();
    const fallbackProducts = MOCK_PRODUCTS.filter((product) => {
      return (
        product.name?.toLowerCase().includes(normalizedQuery) ||
        product.shortDescription?.toLowerCase().includes(normalizedQuery) ||
        product.categoryName?.toLowerCase().includes(normalizedQuery)
      );
    });
    
    return this.apiService.get<Product[]>(endpoint, fallbackProducts).pipe(
      map((products: any[]) => {
        return products.map((product: any) => {
          // Generate the product ID part for the slug
          const idPart = product.id?.substring(0, 8) || '';
          
          return {
            ...product as object,
            id: product.id || '',
            name: product.name || 'Unknown Product',
            specs: product.specs || '',
            price: Number(product.price || 0),
            currency: product.currency || 'XAF',
            imageUrl: product.imageUrl || '/assets/images/products/placeholder.jpg',
            galleryImages: product.galleryImages || (product.imageUrl ? [product.imageUrl] : ['/assets/images/products/placeholder.jpg']),
            features: product.features || [],
            label: product.label || null,
            labelColor: product.labelColor || '#000000',
            inStock: product.inStock ?? true,
            shortDescription: product.shortDescription || '',
            inWishlist: product.inWishlist ?? false,
            stocks: this.normalizeStocks(product.stocks as ApiStock[] | undefined),
            reviews: this.normalizeReviews(product.reviews as ApiReview[] | undefined),
            rating: product.rating || this.calculateAverageRating(product.reviews as ApiReview[] | undefined),
            slug: generateProductSlug(product.name || 'product', idPart)
          } as Product;
        });
      })
    );
  }

  /**
   * Get products by category ID or name
        if (currentProductId) {
          fallbackProducts = fallbackProducts.filter(p => p.id !== currentProductId);
        }
        // Take a random selection
        const maxProducts = Math.min(limit || 4, fallbackProducts.length);
        filteredProducts = fallbackProducts.slice(0, maxProducts);
      }

      return filteredProducts;
    });
  };
  
  // Attempt to call the real API endpoint with fallback to local filtering
  return this.apiService.get<Product[]>(endpoint, null).pipe(
    catchError(() => fallback$),
    map((products: any[]) => {
      return products.map((product: any) => {
        // Standard normalization of product data
        const idPart = product.id?.substring(0, 8) || '';
        
        return {
          ...product as object,
          id: product.id || '',
          name: product.name || 'Unknown Product',
          specs: product.specs || '',
          price: Number(product.price || 0),
          currency: product.currency || 'XAF',
          imageUrl: product.imageUrl || '/assets/images/products/placeholder.jpg',
          galleryImages: product.galleryImages || (product.imageUrl ? [product.imageUrl] : ['/assets/images/products/placeholder.jpg']),
          features: product.features || [],
          label: product.label || null,
          labelColor: product.labelColor || '#000000',
          inStock: product.inStock ?? true,
          shortDescription: product.shortDescription || '',
          inWishlist: product.inWishlist ?? false,
          stocks: this.normalizeStocks(product.stocks as ApiStock[] | undefined),
          reviews: this.normalizeReviews(product.reviews as ApiReview[] | undefined),
          rating: product.rating || this.calculateAverageRating(product.reviews as ApiReview[] | undefined),
          slug: generateProductSlug(product.name || 'product', idPart)
        } as Product;
      });
    })
  );
  }

  /**
   * Get products by category ID or name
   * @param categoryNameOrId Category name or ID
   * @param limit Optional number of products to return
   * @param currentProductId Optional current product ID to exclude from results
   */
  getProductsByCategory(categoryNameOrId: string, limit?: number, currentProductId?: string): Observable<Product[]> {
    const endpoint = `/products/category/${categoryNameOrId}${limit ? `?limit=${limit}` : ''}`;
    
    // Create fallback logic - filter mock products by category
    const fallback$ = this.getProducts().pipe(
      map((products) => {
        // Normalize the category input to lowercase for more flexible matching
        const normalizedCategoryInput = categoryNameOrId.toLowerCase().trim();
        const normalizedCategoryInputPlural = normalizedCategoryInput.endsWith('s') ? normalizedCategoryInput : `${normalizedCategoryInput}s`;

        // Filter products by category name or ID
        let filteredProducts = products.filter((product: Product) => {
          // Try to match by categoryName field if exists
          if (product.categoryName) {
            const productCategoryName = product.categoryName.toLowerCase();
            if (productCategoryName.includes(normalizedCategoryInput) || 
                productCategoryName.includes(normalizedCategoryInputPlural)) {
              return true;
            }
          }
          
          // Check category if available
          if (product.category) {
            const category = product.category;
            const catName = (category.name || '').toLowerCase();
            const catId = (category.id || '').toLowerCase();
            
            return (
              catName === normalizedCategoryInput ||
              catName === normalizedCategoryInputPlural ||
              catName.includes(normalizedCategoryInput) ||
              catName.includes(normalizedCategoryInputPlural) ||
              catId === normalizedCategoryInput
            );
          }
          
          return false;
        });
        
        // Exclude the current product if ID is provided
        if (currentProductId) {
          filteredProducts = filteredProducts.filter((product) => product.id !== currentProductId);
        }

        // Apply limit if specified
        if (limit && limit > 0 && filteredProducts.length > limit) {
          filteredProducts = filteredProducts.slice(0, limit);
        }
        
        // If no products found, return a fallback selection
        if (filteredProducts.length === 0) {
          // Exclude current product from all products
          let fallbackProducts = products;
          if (currentProductId) {
            fallbackProducts = fallbackProducts.filter(p => p.id !== currentProductId);
          }
          // Take a random selection
          const maxProducts = Math.min(limit || 4, fallbackProducts.length);
          filteredProducts = fallbackProducts.slice(0, maxProducts);
        }

        return filteredProducts;
      })
    );
    
    // Attempt to call the real API endpoint with fallback to local filtering
    return this.apiService.get<Product[]>(endpoint, []).pipe(
      catchError((err: Error) => fallback$),
      map((products: any[]) => {
        return products.map((product: any) => {
          // Standard normalization of product data
          const idPart = product.id?.substring(0, 8) || '';
          
          return {
            ...product as object,
            id: product.id || '',
            name: product.name || 'Unknown Product',
            specs: product.specs || '',
            price: Number(product.price || 0),
            currency: product.currency || 'XAF',
            imageUrl: product.imageUrl || '/assets/images/products/placeholder.jpg',
            galleryImages: product.galleryImages || (product.imageUrl ? [product.imageUrl] : ['/assets/images/products/placeholder.jpg']),
            features: product.features || [],
            label: product.label || null,
            labelColor: product.labelColor || '#000000',
            inStock: product.inStock ?? true,
            shortDescription: product.shortDescription || '',
            inWishlist: product.inWishlist ?? false,
            stocks: this.normalizeStocks(product.stocks as ApiStock[] | undefined),
            reviews: this.normalizeReviews(product.reviews as ApiReview[] | undefined),
            rating: product.rating || this.calculateAverageRating(product.reviews as ApiReview[] | undefined),
            slug: generateProductSlug(product.name || 'product', idPart)
          } as Product;
        });
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
