import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { map, catchError, of } from 'rxjs';
import { SERVICE_CATEGORIES } from '../../shared/data';
import type { ServiceCategory } from '../../shared/interfaces';
import { ApiService } from './api.service';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root',
})
export class ServiceCategoriesService extends BaseService {
  constructor(private apiService: ApiService) {
    super();
  }

  /**
   * Get all service categories
   */
  getServiceCategories(): Observable<ServiceCategory[]> {
    const endpoint = '/service-categories';
    
    // Prepare fallback data from mock service categories
    const fallbackData = SERVICE_CATEGORIES;

    return this.apiService.get<ServiceCategory[]>(endpoint, fallbackData).pipe(
      map((categories) => this.normalizeServiceCategories(categories)),
      catchError((error) => {
        console.warn('Failed to load service categories from API, using fallback data:', error);
        return of(fallbackData);
      })
    );
  }

  /**
   * Get service category by ID
   */
  getServiceCategoryById(id: string): Observable<ServiceCategory> {
    const endpoint = `/service-categories/${id}`;
    
    // Prepare fallback data
    const fallbackData: ServiceCategory = {
      id,
      title: 'Unknown Service',
      description: 'Service information not available',
      icon: '/assets/icons/placeholder-icon.png',
      features: []
    };

    return this.apiService.get<ServiceCategory>(endpoint, fallbackData).pipe(
      map((category) => this.normalizeServiceCategory(category)),
      catchError((error) => {
        console.warn(`Failed to load service category ${id} from API, using fallback data:`, error);
        return of(fallbackData);
      })
    );
  }

  /**
   * Normalize service category data to ensure all required fields are present
   */
  private normalizeServiceCategories(categories: any[]): ServiceCategory[] {
    return categories.map((category) => this.normalizeServiceCategory(category));
  }

  /**
   * Normalize a single service category
   */
  private normalizeServiceCategory(category: any): ServiceCategory {
    return {
      id: category.id || '',
      title: category.title || 'Unknown Service',
      description: category.description || '',
      icon: category.icon || '/assets/icons/placeholder-icon.png',
      features: category.features || []
    };
  }
} 