import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import type { Product } from '../../shared/types/product.type';

export interface WishlistItem {
  product: Product;
  addedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private wishlistItems: WishlistItem[] = [];
  private wishlistSubject = new BehaviorSubject<WishlistItem[]>([]);
  private wishlistCountSubject = new BehaviorSubject<number>(0);

  constructor() {
    // Load wishlist from local storage on initialization
    this.loadWishlist();
    // Initialize the wishlist count
    this.wishlistCountSubject.next(this.getItemsCount());
  }

  /**
   * Get observable for wishlist items
   */
  getWishlistItems(): Observable<WishlistItem[]> {
    return this.wishlistSubject.asObservable();
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
      this.wishlistItems.push(newItem);

      // Update the product's inWishlist flag
      product.inWishlist = true;

      this.updateWishlist();
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

      // Remove the item
      this.wishlistItems = this.wishlistItems.filter((item) => item.product.id !== productId);
      this.updateWishlist();
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

    this.wishlistItems = [];
    this.updateWishlist();
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

        this.wishlistSubject.next([...this.wishlistItems]);
      } catch (error) {
        this.wishlistItems = [];
        this.wishlistSubject.next([]);
      }
    }
  }
}
