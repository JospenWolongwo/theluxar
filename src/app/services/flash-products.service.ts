import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { map, catchError, of } from 'rxjs';
import { FLASH_SALE_PRODUCTS, BEST_SELLER_PRODUCTS, TOP_RATED_PRODUCTS, NEW_PRODUCTS } from '../../shared/data';
import type { Product } from '../../shared/types';
import { ApiService } from './api.service';
import { BaseService } from './base.service';

export interface FlashProductsResponse {
  flashSale: Product[];
  bestSellers: Product[];
  topRated: Product[];
  newProducts: Product[];
}

@Injectable({
  providedIn: 'root',
})
export class FlashProductsService extends BaseService {
  constructor(private apiService: ApiService) {
    super();
  }

  /**
   * Get all flash products (limited offers, best sellers, etc.)
   */
  getFlashProducts(): Observable<FlashProductsResponse> {
    const endpoint = '/products/flash';
    
    // Prepare fallback data from mock products
    const fallbackData: FlashProductsResponse = {
      flashSale: FLASH_SALE_PRODUCTS,
      bestSellers: BEST_SELLER_PRODUCTS,
      topRated: TOP_RATED_PRODUCTS,
      newProducts: NEW_PRODUCTS
    };

    return this.apiService.get<FlashProductsResponse>(endpoint, fallbackData).pipe(
      map((response) => {
        // Normalize the response to ensure all products have required fields
        return {
          flashSale: this.normalizeProducts(response.flashSale || []),
          bestSellers: this.normalizeProducts(response.bestSellers || []),
          topRated: this.normalizeProducts(response.topRated || []),
          newProducts: this.normalizeProducts(response.newProducts || [])
        };
      }),
      catchError((error) => {
        return of(fallbackData);
      })
    );
  }

  /**
   * Get flash sale products only
   */
  getFlashSaleProducts(): Observable<Product[]> {
    return this.getFlashProducts().pipe(
      map(response => response.flashSale)
    );
  }

  /**
   * Get best seller products only
   */
  getBestSellerProducts(): Observable<Product[]> {
    return this.getFlashProducts().pipe(
      map(response => response.bestSellers)
    );
  }

  /**
   * Get top rated products only
   */
  getTopRatedProducts(): Observable<Product[]> {
    return this.getFlashProducts().pipe(
      map(response => response.topRated)
    );
  }

  /**
   * Get new products only
   */
  getNewProducts(): Observable<Product[]> {
    return this.getFlashProducts().pipe(
      map(response => response.newProducts)
    );
  }

  /**
   * Normalize product data to ensure all required fields are present
   */
  private normalizeProducts(products: any[]): Product[] {
    return products.map((product: any) => ({
      id: product.id || '',
      name: product.name || 'Unknown Product',
      specs: product.specs || '',
      price: Number(product.price || 0),
      currency: product.currency || 'XAF',
      imageUrl: product.imageUrl || '/assets/images/products/placeholder.jpg',
      images: product.images || [{ id: '1', url: product.imageUrl || '/assets/images/products/placeholder.jpg' }],
      galleryImages: product.galleryImages || (product.imageUrl ? [product.imageUrl] : ['/assets/images/products/placeholder.jpg']),
      features: product.features || [],
      label: product.label || null,
      labelColor: product.labelColor || '#000000',
      inStock: product.inStock ?? true,
      shortDescription: product.shortDescription || '',
      inWishlist: product.inWishlist ?? false,
      stocks: product.stocks || [],
      reviews: product.reviews || [],
      rating: product.rating || { average: 0, count: 0 },
      tag: product.tag || '',
      volume: product.volume || '',
      brand: product.brand || 'TheLuxar',
      description: product.description || '',
      category: product.category || { id: 'unknown', name: 'Unknown' },
      categoryName: product.categoryName || 'Unknown',
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: product.updatedAt || new Date().toISOString(),
      active: product.active ?? true,
      minPrice: product.minPrice || product.price || 0,
      maxPrice: product.maxPrice || product.price || 0,
      slug: product.slug || this.generateSlug(product.name, product.id)
    }));
  }

  /**
   * Generate a slug from product name and ID
   */
  private generateSlug(name: string, id: string): string {
    const nameSlug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const idPart = id.substring(0, 8);
    return `${nameSlug}-${idPart}`;
  }
} 