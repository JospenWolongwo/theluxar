import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowRight, faClock } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { BEST_SELLER_PRODUCTS, FLASH_SALE_PRODUCTS, NEW_PRODUCTS, TOP_RATED_PRODUCTS } from '../../../shared/data';
import type { Product } from '../../../shared/types';
import { CountdownService, type CountdownTime } from '../../services/countdown.service';
import { FlashProductsService } from '../../services/flash-products.service';
import { WishlistService } from '../../services/wishlist.service';
import { FlashProductCardComponent } from '../flash-product-card/flash-product-card.component';

@Component({
  selector: 'app-flash-products-section',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule, FlashProductCardComponent],
  templateUrl: './flash-products-section.component.html',
  styleUrls: ['./flash-products-section.component.scss'],
})
export class FlashProductsSectionComponent implements OnInit, OnDestroy {
  @Input() isMobile = false;
  @Input() isTablet = false;
  @Output() wishlistToggled = new EventEmitter<string>();

  flashSaleProducts: Product[] = [];
  bestSellerProducts: Product[] = [];
  topRatedProducts: Product[] = [];
  newProducts: Product[] = [];
  isLoading = true;
  error = false;
  countdown: CountdownTime = { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };

  private subscription = new Subscription();

  // Icons
  faArrowRight = faArrowRight;
  faClock = faClock;

  constructor(
    private wishlistService: WishlistService,
    private flashProductsService: FlashProductsService,
    private countdownService: CountdownService
  ) {}

  ngOnInit(): void {
    this.loadFlashProducts();
    this.startCountdown();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Load flash products from the service
   */
  private loadFlashProducts(): void {
    this.isLoading = true;
    this.error = false;

    this.subscription.add(
      this.flashProductsService.getFlashProducts().subscribe({
        next: (response) => {
          this.flashSaleProducts = response.flashSale;
          this.bestSellerProducts = response.bestSellers;
          this.topRatedProducts = response.topRated;
          this.newProducts = response.newProducts;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = true;
          this.isLoading = false;
          
          // Use fallback data
          this.flashSaleProducts = FLASH_SALE_PRODUCTS;
          this.bestSellerProducts = BEST_SELLER_PRODUCTS;
          this.topRatedProducts = TOP_RATED_PRODUCTS;
          this.newProducts = NEW_PRODUCTS;
        }
      })
    );
  }

  /**
   * Start the countdown timer
   */
  private startCountdown(): void {
    this.subscription.add(
      this.countdownService.getFlashSaleCountdown().subscribe({
        next: (countdown) => {
          this.countdown = countdown;
        },
        error: (error) => {
          // Handle countdown error silently
        }
      })
    );
  }

  /**
   * Format time for display
   */
  formatTime(time: number): string {
    return this.countdownService.formatTime(time);
  }

  /**
   * Check if countdown has expired
   */
  isCountdownExpired(): boolean {
    return this.countdownService.isExpired(this.countdown);
  }

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
