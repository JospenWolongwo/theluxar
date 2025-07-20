/* eslint-disable max-lines */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { map, catchError, of, tap } from 'rxjs';
import { MOCK_PRODUCTS } from '../../shared/data/products.data';
import { REVIEWS } from '../../shared/data/reviews.data';
import type { Review } from '../../shared/types/review.type';
import type { StockAvailabilityStatus } from '../../shared/enums';
import type { ApiReview, ApiStock } from '../../shared/types/api-types';
import type { Product } from '../../shared/types/product.type';
import { generateProductSlug } from '../../shared/utils/string.utils';
import { ApiService } from './api.service';
import { BaseService } from './base.service';
import { ReviewsService } from './reviews.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService extends BaseService {
  constructor(
    private apiService: ApiService,
    private reviewsService: ReviewsService
  ) {
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

          // Normalize category info
          let normalizedCategory = null;
          let normalizedCategoryName = '';
          if (Array.isArray(product.categories) && product.categories.length > 0) {
            normalizedCategory = {
              id: product.categories[0].id,
              name: product.categories[0].name,
            };
            normalizedCategoryName = product.categories[0].name;
          } else if (product.category && typeof product.category === 'object') {
            normalizedCategory = {
              id: product.category.id || product.categoryId || '',
              name: product.category.name || product.categoryName || '',
            };
            normalizedCategoryName = normalizedCategory.name;
          } else if (product.categoryId || product.categoryName) {
            normalizedCategory = {
              id: product.categoryId || '',
              name: product.categoryName || '',
            };
            normalizedCategoryName = product.categoryName || '';
          }

          // Robustly combine galleryImages and images, deduplicate, fallback to imageUrl
          let normalizedGalleryImages: string[] = [];
          if (Array.isArray(product.galleryImages)) {
            normalizedGalleryImages = product.galleryImages.slice();
          }
          if (Array.isArray(product.images)) {
            const imageUrls = product.images.map((img: any) => img.url).filter(Boolean);
            normalizedGalleryImages = [...normalizedGalleryImages, ...imageUrls];
          }
          // Remove duplicates
          normalizedGalleryImages = Array.from(new Set(normalizedGalleryImages));
          if (normalizedGalleryImages.length === 0 && product.imageUrl) {
            normalizedGalleryImages = [product.imageUrl];
          }

          const normalizedProduct = {
            ...product,
            id: product.id || '',
            name: product.name || 'Unknown Product',
            specs: product.specs || '',
            price: Number(product.price || 0),
            currency: product.currency || 'XAF',
            imageUrl: product.imageUrl || '/assets/images/products/placeholder.jpg',
            galleryImages: normalizedGalleryImages,
            features: product.features || [],
            label: product.label || null,
            labelColor: product.labelColor || '#000000',
            inStock: product.inStock ?? true,
            shortDescription: product.shortDescription || '',
            inWishlist: product.inWishlist ?? false,
            category: normalizedCategory,
            categoryName: normalizedCategoryName,
            tag: product.tag || '',
            stocks: this.normalizeStocks(product.stocks),
            reviews: this.normalizeReviews(product.reviews),
            rating: product.rating || this.calculateAverageRating(product.reviews),
            slug: generateProductSlug(product.name || 'product', idPart)
          };

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
    // Use the ReviewsService to get reviews
    return this.reviewsService.getReviewsByProduct(productId).pipe(
      map((reviews) => {
        // Convert Review[] to the format expected by Product interface
        return reviews.map(review => ({
          id: typeof review.id === 'string' ? review.id : review.id?.toString() || '',
          username: review.username || 'Anonymous',
          comment: review.comment || '',
          rating: review.rating,
          title: review.title || '',
          date: review.date,
          verified: review.verified || false,
          helpful: review.helpful || 0,
          notHelpful: review.notHelpful || 0,
          content: review.content || '',
          imageUrl: review.imageUrl || '',
          position: review.position
        }));
      })
    );
  }

  /**
   * Search products
   * @param query Search query
   * @param page Page number (default: 1)
   * @param size Results per page (default: 10)
   */
  searchProducts(query: string, page = 1, size = 10): Observable<Product[]> {
    const endpoint = `/products/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`;
    
    // For fallback, filter mock products based on query
    const fallbackData = MOCK_PRODUCTS.filter(product => {
      const searchableText = [
        product.name,
        product.description,
        product.shortDescription,
        product.categoryName,
        product.tag,
      ].filter(Boolean).join(' ').toLowerCase();
      
      return searchableText.includes(query.toLowerCase());
    });
    

    return this.apiService.get<Product[]>(endpoint, fallbackData).pipe(
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
    
    // Normalize and map category names - backend category names are capitalized
    // and don't always exactly match route names (e.g. 'perfumes' route vs 'Perfumes' category)
    const normalizedRouteCategory = categoryNameOrId;
    const backendCategoryMap: Record<string, string> = {
      'watches': 'Watches',
      'jewelry': 'Jewelry',
      'perfumes': 'Perfumes',
      'kids': 'Kids',
      'men': 'Men',  // Special handling
      'women': 'Women',  // Special handling
    };
    
    // If there's a direct mapping for this route category, use it
    let targetBackendCategory = backendCategoryMap[normalizedRouteCategory.toLowerCase()];
    if (!targetBackendCategory) {
      // If no mapping exists, just capitalize the first letter for consistency
      targetBackendCategory = normalizedRouteCategory.charAt(0).toUpperCase() + normalizedRouteCategory.slice(1);
    }
    
    // Try the API endpoint first
    return this.apiService.get<Product[]>(endpoint, []).pipe(
      map((products: any[]) => {
        // If API returns products, use them
        if (products.length > 0) {
          // Normalize the products to match our Product type
          const normalizedProducts = products.map((product: any) => {
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
              slug: generateProductSlug(product.name || 'product', idPart),
              category: product.category || null,
              categoryName: product.categoryName || product.category?.name || null
            } as Product;
          });
          
          // Exclude current product if specified
          if (currentProductId) {
            return normalizedProducts.filter(p => p.id !== currentProductId);
          }
          
          return normalizedProducts;
        } else {
          throw new Error('No products returned from API');
        }
      }),
      catchError((err: Error) => {
        
        // Fallback: Get limited products and filter by category
        return this.getProducts(limit || 50).pipe(
          map((allProducts) => {
            // Force re-parse the mock products to ensure we get correct structure
            // This addresses any potential serialization/deserialization issues
            const processedProducts = [...MOCK_PRODUCTS].map(p => ({
              ...p,
              // Ensure category is properly structured
              category: p.category,
              categoryName: p.categoryName || p.category?.name || ''
            }));
            
            // Use normalized route category for filtering
            const normalizedCategoryInput = categoryNameOrId.toLowerCase().trim();
            
            // Filter products by category
            let filteredProducts = processedProducts.filter((product: Product) => {
              // Direct category match - this is the primary matching method
              const productCatName = product.category?.name || product.categoryName || '';
              
              // PERFUMES CATEGORY
              if (normalizedCategoryInput === 'perfumes') {
                return productCatName === 'Perfumes';
              }
              
              // JEWELRY CATEGORY
              if (normalizedCategoryInput === 'jewelry') {
                return productCatName === 'Jewelry';
              }
              
              // WATCHES CATEGORY
              if (normalizedCategoryInput === 'watches') {
                return productCatName === 'Watches';
              }
              
              // KIDS CATEGORY
              if (normalizedCategoryInput === 'kids') {
                return productCatName === 'Kids';
              }
              
              // Special handling for MEN category
              if (normalizedCategoryInput === 'men') {
                // Products specifically for men in Watches or Perfumes categories
                if (productCatName === 'Watches' || productCatName === 'Perfumes') {
                  const productName = (product.name || '').toLowerCase();
                  const productSpecs = (product.specs || '').toLowerCase();
                  
                  // Check if specifically for men
                  return productName.includes('men') || 
                         productSpecs.includes('men') || 
                         productName.includes('cologne') ||
                         productName.includes('gentleman') ||
                         productName.includes('chronograph');
                }
                return false;
              }
              
              // Special handling for WOMEN category
              if (normalizedCategoryInput === 'women') {
                // Most jewelry and women's perfumes
                if (productCatName === 'Jewelry' || productCatName === 'Perfumes') {
                  // Exclude children's jewelry
                  const productName = (product.name || '').toLowerCase();
                  if (!productName.includes('children') && !productName.includes('kid')) {
                    // For perfumes, check if specifically for women
                    if (productCatName === 'Perfumes') {
                      const productSpecs = (product.specs || '').toLowerCase();
                      return !productSpecs.includes('men') && 
                             (productName.includes('women') || 
                              productName.includes('ladies') ||
                              productName.includes('parfum'));
                    }
                    
                    // Assume jewelry is for women unless explicitly for men or children
                    return true;
                  }
                }
                return false;
              }
              
              // For other categories, use exact matching with the backend category name
              
              // Direct match with backend category name (case-sensitive)
              if (productCatName === targetBackendCategory) {
                return true;
              }
              
              // Case-insensitive category name match
              if (productCatName.toLowerCase() === targetBackendCategory.toLowerCase()) {
                return true;
              }
              
              // Check tag field for categories like "jewelry"
              if (product.tag) {
                const productTag = product.tag.toLowerCase();
                if (productTag === normalizedCategoryInput) {
                  return true;
                }
              }
              
              return false;
            });
            
            // Exclude current product if specified
            if (currentProductId) {
              filteredProducts = filteredProducts.filter(p => p.id !== currentProductId);
            }
            
            // Apply limit
            if (limit && limit > 0 && filteredProducts.length > limit) {
              filteredProducts = filteredProducts.slice(0, limit);
            }
            
            return filteredProducts;
          })
        );
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
