import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import type { ScreenSize } from '../../shared/types';
import { SCREEN_SIZES } from '../../shared/utils';
import { AddToCartSuccessComponent } from '../components/add-to-cart-success/add-to-cart-success.component';
import { CartService } from '../services/cart.service';
import type { WishlistItem } from '../services/wishlist.service';
import { WishlistService } from '../services/wishlist.service';

@Component({
  selector: 'app-wishlist-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule, AddToCartSuccessComponent],
  templateUrl: './wishlist-page.component.html',
  styleUrls: ['./wishlist-page.component.scss'],
  host: {
    class: 'block w-full',
  },
})
export class WishlistPageComponent {
  wishlistItems: WishlistItem[] = [];
  private subscription = new Subscription();
  currentScreenSize: ScreenSize = {
    xs: false,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    ltSm: false,
    ltMd: false,
    ltLg: false,
    ltXl: false,
    gtXs: false,
    gtSm: false,
    gtMd: false,
    gtLg: false,
  };
  showSuccessModal = false;
  lastAddedProduct: WishlistItem | null = null;

  // eslint-disable-next-line max-params
  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private responsive: BreakpointObserver,
    private library: FaIconLibrary
  ) {
    this.library.addIconPacks(fas, far, fab);
  }

  ngOnInit(): void {
    // Track screen size changes for responsive design
    const screenSizes = ['ltMd'] as const;

    screenSizes.forEach((screenSize) => {
      this.subscription.add(
        this.responsive.observe([SCREEN_SIZES[screenSize]]).subscribe((state) => {
          this.currentScreenSize[screenSize as keyof ScreenSize] = state.matches;
        })
      );
    });

    // Subscribe to wishlist changes
    this.subscription.add(
      this.wishlistService.getWishlistItems().subscribe((items) => {
        this.wishlistItems = items;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Remove item from wishlist
   */
  onRemoveItem(productId: string): void {
    this.wishlistService.removeFromWishlist(productId);
  }

  /**
   * Add item to cart and remove from wishlist
   */
  addToCart(item: WishlistItem): void {
    // Add to cart using CartService
    this.cartService.addToCart(item.product);

    // Remove from wishlist
    this.wishlistService.removeFromWishlist(item.product.id);

    // Show success modal
    this.lastAddedProduct = item;
    this.showSuccessModal = true;
  }

  /**
   * Hide the success modal
   */
  hideSuccessModal(): void {
    this.showSuccessModal = false;
  }

  /**
   * Clear the entire wishlist
   */
  clearWishlist(): void {
    this.wishlistService.clearWishlist();
  }
}
