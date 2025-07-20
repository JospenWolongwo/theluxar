import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { map, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import { BaseService } from './base.service';

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  children?: Category[];
  imageUrl?: string;
  slug?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoriesService extends BaseService {
  constructor(private apiService: ApiService) {
    super();
  }

  /**
   * Get all categories
   */
  getCategories(): Observable<Category[]> {
    const endpoint = '/categories';
    
    // Prepare fallback data
    const fallbackData: Category[] = [
      { id: 'jewelry', name: 'Jewelry', description: 'Exquisite jewelry pieces' },
      { id: 'watches', name: 'Watches', description: 'Luxury timepieces' },
      { id: 'perfumes', name: 'Perfumes', description: 'Premium fragrances' },
      { id: 'men', name: 'Men', description: 'Men\'s collection' },
      { id: 'women', name: 'Women', description: 'Women\'s collection' },
      { id: 'kids', name: 'Kids', description: 'Children\'s collection' }
    ];

    return this.apiService.get<Category[]>(endpoint, fallbackData).pipe(
      map((categories) => this.normalizeCategories(categories)),
      catchError((error) => {
        return of(fallbackData);
      })
    );
  }

  /**
   * Get root categories (top-level categories)
   */
  getRootCategories(): Observable<Category[]> {
    const endpoint = '/categories/root';
    
    // Prepare fallback data
    const fallbackData: Category[] = [
      { id: 'jewelry', name: 'Jewelry', description: 'Exquisite jewelry pieces' },
      { id: 'watches', name: 'Watches', description: 'Luxury timepieces' },
      { id: 'perfumes', name: 'Perfumes', description: 'Premium fragrances' }
    ];

    return this.apiService.get<Category[]>(endpoint, fallbackData).pipe(
      map((categories) => this.normalizeCategories(categories)),
      catchError((error) => {
        return of(fallbackData);
      })
    );
  }

  /**
   * Get child categories of a specific parent
   */
  getChildCategories(parentId: string): Observable<Category[]> {
    const endpoint = `/categories/parent/${parentId}`;
    
    // Prepare fallback data based on parent
    const fallbackData: Category[] = this.getFallbackChildCategories(parentId);

    return this.apiService.get<Category[]>(endpoint, fallbackData).pipe(
      map((categories) => this.normalizeCategories(categories)),
      catchError((error) => {
        return of(fallbackData);
      })
    );
  }

  /**
   * Get category by ID
   */
  getCategoryById(id: string): Observable<Category> {
    const endpoint = `/categories/${id}`;
    
    // Prepare fallback data
    const fallbackData: Category = {
      id,
      name: 'Unknown Category',
      description: 'Category information not available'
    };

    return this.apiService.get<Category>(endpoint, fallbackData).pipe(
      map((category) => this.normalizeCategory(category)),
      catchError((error) => {
        return of(fallbackData);
      })
    );
  }

  /**
   * Normalize category data to ensure all required fields are present
   */
  private normalizeCategories(categories: any[]): Category[] {
    return categories.map((category: any) => this.normalizeCategory(category));
  }

  /**
   * Normalize a single category
   */
  private normalizeCategory(category: any): Category {
    return {
      id: category.id || '',
      name: category.name || 'Unknown Category',
      description: category.description || '',
      parentId: category.parentId,
      children: category.children ? this.normalizeCategories(category.children) : undefined,
      imageUrl: category.imageUrl || '',
      slug: category.slug || this.generateSlug(category.name, category.id),
      active: category.active ?? true,
      createdAt: category.createdAt || new Date().toISOString(),
      updatedAt: category.updatedAt || new Date().toISOString()
    };
  }

  /**
   * Generate fallback child categories based on parent ID
   */
  private getFallbackChildCategories(parentId: string): Category[] {
    const fallbackMap: Record<string, Category[]> = {
      'jewelry': [
        { id: 'rings', name: 'Rings', description: 'Elegant rings' },
        { id: 'necklaces', name: 'Necklaces', description: 'Beautiful necklaces' },
        { id: 'earrings', name: 'Earrings', description: 'Stunning earrings' },
        { id: 'bracelets', name: 'Bracelets', description: 'Charming bracelets' }
      ],
      'watches': [
        { id: 'luxury-watches', name: 'Luxury Watches', description: 'Premium timepieces' },
        { id: 'sport-watches', name: 'Sport Watches', description: 'Athletic timepieces' },
        { id: 'dress-watches', name: 'Dress Watches', description: 'Formal timepieces' }
      ],
      'perfumes': [
        { id: 'mens-fragrances', name: 'Men\'s Fragrances', description: 'Masculine scents' },
        { id: 'womens-fragrances', name: 'Women\'s Fragrances', description: 'Feminine scents' },
        { id: 'unisex-fragrances', name: 'Unisex Fragrances', description: 'Universal scents' }
      ]
    };

    return fallbackMap[parentId] || [];
  }

  /**
   * Generate a slug from category name and ID
   */
  private generateSlug(name: string, id: string): string {
    const nameSlug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const idPart = id.substring(0, 8);
    return `${nameSlug}-${idPart}`;
  }
} 