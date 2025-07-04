import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';
import type { Product } from '../../shared/types/product.type';
import { ApiService } from './api.service';
import { BaseService } from './base.service';

export interface WishlistItem {
  product: Product;
  addedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class WishlistService extends BaseService {
  private wishlistItems: WishlistItem[] = [];
  private wishlistSubject = new BehaviorSubject<WishlistItem[]>([]);
  private wishlistCountSubject = new BehaviorSubject<number>(0);

  constructor(private apiService: ApiService) {
    super();
    // Load wishlist from local storage on initialization
    this.loadWishlist();
    // Initialize the wishlist count
    this.wishlistCountSubject.next(this.getItemsCount());
  }

  /**
   * Get observable for wishlist items
   */
  getWishlistItems(): Observable<WishlistItem[]> {
    // Attempt to get wishlist from API first
    return this.apiService.get<WishlistItem[]>('/wishlists', []).pipe(
      catchError(() => {
        // If API call fails, return local wishlist
        return of(this.wishlistItems);
      }),
      tap((items) => {
        // Update local wishlist with items from API
        this.wishlistItems = items;
        
        // Ensure dates are parsed as Date objects
        this.wishlistItems.forEach((item) => {
          item.addedAt = new Date(item.addedAt);
          
          // Set the inWishlist flag on products
          if (item.product) {
            item.product.inWishlist = true;
          }
        });
        
        this.wishlistSubject.next([...this.wishlistItems]);
        this.wishlistCountSubject.next(this.getItemsCount());
        
        // Update local storage as fallback
        localStorage.setItem('wishlist', JSON.stringify(this.wishlistItems));
      })
    );
  }

  /**
   * Get observable for wishlist items count
   */
  getWishlistItemsCount(): Observable<number> {
    return this.wishlistCountSubject.asObservable();
  }

  /**
   * Add product to wishlist
   */
  addToWishlist(product: Product): void {
    // Check if product is already in wishlist
    const existingItem = this.wishlistItems.find((item) => item.product.id === product.id);

    if (!existingItem) {
      const newItem: WishlistItem = {
        product,
        addedAt: new Date(),
      };
      
      // Try to add to wishlist via API
      this.apiService.post<WishlistItem>('/wishlists', newItem, newItem).pipe(
        catchError(() => {
          // If API call fails, update local wishlist
          this.wishlistItems.push(newItem);
          return of(newItem);
        })
      ).subscribe(() => {
        // Update the product's inWishlist flag
        product.inWishlist = true;
        
        this.updateWishlist();
      });
    }
  }

  /**
   * Remove item from wishlist
   */
  removeFromWishlist(productId: string): void {
    const index = this.wishlistItems.findIndex((item) => item.product.id === productId);

    if (index !== -1) {
      // Update the product's inWishlist flag
      this.wishlistItems[index].product.inWishlist = false;
      
      // Try to remove from wishlist via API
      this.apiService.delete<void>(`/wishlists/${productId}`, undefined).pipe(
        catchError(() => {
          // If API call fails, update local wishlist
          this.wishlistItems = this.wishlistItems.filter((item) => item.product.id !== productId);
          return of(undefined);
        })
      ).subscribe(() => {
        // Remove the item locally after API call completes
        this.wishlistItems = this.wishlistItems.filter((item) => item.product.id !== productId);
        this.updateWishlist();
      });
    }
  }

  /**
   * Toggle item in wishlist (add if not present, remove if present)
   */
  toggleWishlistItem(product: Product): boolean {
    const isInWishlist = this.isInWishlist(product.id);

    if (isInWishlist) {
      this.removeFromWishlist(product.id);

      return false;
    } else {
      this.addToWishlist(product);

      return true;
    }
  }

  /**
   * Check if product is in wishlist
   */
  isInWishlist(productId: string): boolean {
    return this.wishlistItems.some((item) => item.product.id === productId);
  }

  /**
   * Clear the entire wishlist
   */
  clearWishlist(): void {
    // Update all products' inWishlist flags
    this.wishlistItems.forEach((item) => {
      item.product.inWishlist = false;
    });
    
    // Try to clear wishlist via API
    this.apiService.delete<void>('/wishlist', undefined).pipe(
      catchError(() => {
        // If API call fails, clear local wishlist
        this.wishlistItems = [];
        return of(undefined);
      })
    ).subscribe(() => {
      this.wishlistItems = [];
      this.updateWishlist();
    });
  }

  /**
   * Get total count of items in wishlist
   */
  private getItemsCount(): number {
    return this.wishlistItems.length;
  }

  /**
   * Update wishlist state and persist to local storage
   */
  private updateWishlist(): void {
    // Update the wishlist subject
    this.wishlistSubject.next([...this.wishlistItems]);

    // Update wishlist count subject
    this.wishlistCountSubject.next(this.getItemsCount());

    // Save to local storage
    localStorage.setItem('wishlist', JSON.stringify(this.wishlistItems));
  }

  /**
   * Load wishlist from local storage
   */
  private loadWishlist(): void {
    // Try to load wishlist from API first
    this.apiService.get<WishlistItem[]>('/wishlist', []).pipe(
      catchError(() => {
        // If API call fails, load from localStorage
        const storedWishlist = localStorage.getItem('wishlist');
        
        if (storedWishlist) {
          try {
            this.wishlistItems = JSON.parse(storedWishlist);
            
            // Ensure dates are parsed as Date objects
            this.wishlistItems.forEach((item) => {
              item.addedAt = new Date(item.addedAt);
              
              // Set the inWishlist flag on products
              if (item.product) {
                item.product.inWishlist = true;
              }
            });
          } catch (error) {
            localStorage.removeItem('wishlist');
            this.wishlistItems = [];
          }
        } else {
          this.wishlistItems = [];
        }
        
        return of(this.wishlistItems);
      })
    ).subscribe((items) => {
      this.wishlistItems = items;
      
      // Ensure dates are parsed as Date objects and flags are set
      this.wishlistItems.forEach((item) => {
        item.addedAt = new Date(item.addedAt);
        if (item.product) {
          item.product.inWishlist = true;
        }
      });
      
      this.wishlistSubject.next([...this.wishlistItems]);
      this.wishlistCountSubject.next(this.getItemsCount());
    });
  }
}
