import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Product } from '../../../shared/types';

@Component({
  selector: 'app-flash-product-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './flash-product-card.component.html',
  styleUrl: './flash-product-card.component.scss',
})
export class FlashProductCardComponent {
  @Input() product!: Product;
  @Input() isMobile = false;
  @Input() isTablet = false;
  @Output() wishlistToggle = new EventEmitter<string>();

  constructor(private router: Router) {}

  /**
   * Navigate to product detail page using the product slug
   */
  navigateToProductDetail(): void {
    if (this.product?.slug) {
      this.router.navigate(['/product', this.product.slug]);
    } else if (this.product?.id) {
      // Fallback to ID if slug is not available
      this.router.navigate(['/product', this.product.id]);
    }
  }

  /**
   * Toggle product in wishlist
   */
  toggleWishlist(event: MouseEvent): void {
    // Stop click event from propagating to parent (card)
    event.stopPropagation();

    this.product.inWishlist = !this.product.inWishlist;
    this.wishlistToggle.emit(this.product.id);
  }

  getRatingCount(): number {
    if (!this.product.rating) {
      return 0;
    }

    return typeof this.product.rating === 'number' ? 0 : this.product.rating.count || 0;
  }

  getRatingAverage(): number {
    if (!this.product.rating) {
      return 0;
    }

    return typeof this.product.rating === 'number' ? this.product.rating : this.product.rating.average || 0;
  }
}
