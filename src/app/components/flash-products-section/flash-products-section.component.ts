import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowRight, faClock } from '@fortawesome/free-solid-svg-icons';
import { BEST_SELLER_PRODUCTS, FLASH_SALE_PRODUCTS, NEW_PRODUCTS, TOP_RATED_PRODUCTS } from '../../../shared/data';
import type { Product } from '../../../shared/types';
import { WishlistService } from '../../services/wishlist.service';
import { FlashProductCardComponent } from '../flash-product-card/flash-product-card.component';

@Component({
  selector: 'app-flash-products-section',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule, FlashProductCardComponent],
  templateUrl: './flash-products-section.component.html',
  styleUrls: ['./flash-products-section.component.scss'],
})
export class FlashProductsSectionComponent {
  @Input() isMobile = false;
  @Input() isTablet = false;
  @Output() wishlistToggled = new EventEmitter<string>();

  flashSaleProducts: Product[] = FLASH_SALE_PRODUCTS;
  bestSellerProducts: Product[] = BEST_SELLER_PRODUCTS;
  topRatedProducts: Product[] = TOP_RATED_PRODUCTS;
  newProducts: Product[] = NEW_PRODUCTS;

  // Icons
  faArrowRight = faArrowRight;
  faClock = faClock;

  constructor(private wishlistService: WishlistService) {}

  /**
   * Handle wishlist toggle from product card
   */
  onWishlistToggle(productId: string): void {
    // Find the product in one of our product arrays
    const allProducts = [
      ...this.flashSaleProducts,
      ...this.bestSellerProducts,
      ...this.topRatedProducts,
      ...this.newProducts,
    ];

    const product = allProducts.find((p) => p.id === productId);
    if (product) {
      this.wishlistService.toggleWishlistItem(product);
    }

    // Forward the event to parent components
    this.wishlistToggled.emit(productId);
  }
}
