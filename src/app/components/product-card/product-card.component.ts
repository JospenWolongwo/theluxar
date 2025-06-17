import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { Product } from '../../../shared/types/product.type';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
})
export class ProductCardComponent implements OnInit {
  @Input() product!: Product;
  @Input() isMobile = false;
  @Input() isTablet = false;
  @Output() wishlistToggle = new EventEmitter<string>();
  @Output() reserveClick = new EventEmitter<string>();

  defaultImage = 'assets/images/products/placeholder.png';
  showFullDescription = false;

  constructor(library: FaIconLibrary, private router: Router) {
    library.addIconPacks(fab, fas, far);
  }

  ngOnInit(): void {
    // Ensure product has all required properties to avoid template errors
    if (this.product.price === undefined || this.product.price === null) {
      this.product.price = 0;
    }
    if (!this.product.currency) {
      this.product.currency = 'XAF';
    }

    // Set default values if not provided
    if (!this.product.specs) {
      if (this.product.description) {
        this.product.specs = this.truncate(this.product.description, 60);
      } else if (this.product.shortDescription) {
        this.product.specs = this.truncate(this.product.shortDescription, 60);
      }
    }

    if (!this.product.imageUrl) {
      this.product.imageUrl = this.defaultImage;
    }

    // Ensure inStock is a boolean
    if (this.product.inStock === undefined) {
      this.product.inStock = true; // Default to in stock if not specified
    }
  }

  /**
   * Check if the product has a discount
   */
  hasDiscount(): boolean {
    if (!this.product.extraAttributes) {
      return false;
    }
    const originalPrice = this.product.extraAttributes['originalPrice'];

    return originalPrice !== undefined && originalPrice !== null && Number(originalPrice) > this.product.price;
  }

  /**
   * Get the discount percentage
   */
  getDiscountPercentage(): number {
    if (!this.hasDiscount()) {
      return 0;
    }
    const originalPrice = this.product.extraAttributes?.['originalPrice'];

    return this.calculateDiscount(originalPrice, this.product.price);
  }

  private truncate(text: string | undefined, maxLength: number): string {
    if (!text) {
      return '';
    }
    // Remove HTML tags if any
    const plainText = text.replace(/<[^>]*>/g, '');

    return plainText.length > maxLength ? `${plainText.substring(0, maxLength)}...` : plainText;
  }

  /**
   * Calculate discount percentage between original and sale price
   */
  private calculateDiscount(originalPrice: unknown, salePrice: number): number {
    try {
      // Convert to number if it's a string or other type
      const original = typeof originalPrice === 'string' ? parseFloat(originalPrice) : Number(originalPrice);

      // Validate inputs
      if (isNaN(original) || isNaN(salePrice) || original <= 0 || salePrice <= 0) {
        return 0;
      }

      if (original <= salePrice) {
        return 0;
      }

      // Calculate and round the discount percentage
      const discount = ((original - salePrice) / original) * 100;

      return Math.round(discount);
    } catch (error) {
      // Use a proper logger in production
      return 0;
    }
  }

  // Simple getter for image source with fallback
  get imageSrc(): string {
    return this.product.imageUrl || this.defaultImage;
  }

  // Handle image loading error
  onImageError(): void {
    this.product.imageUrl = this.defaultImage;
  }

  toggleWishlist(event: MouseEvent): void {
    // Stop click event from propagating to parent (card)
    event.stopPropagation();

    this.product.inWishlist = !this.product.inWishlist;
    this.wishlistToggle.emit(this.product.id);
  }

  onReserveClick(event: MouseEvent): void {
    // Stop click event from propagating to parent (card)
    event.stopPropagation();

    this.reserveClick.emit(this.product.id);
  }

  /**
   * Navigate to product detail page using the product slug
   */
  navigateToProductDetail(): void {
    if (this.product?.slug) {
      this.router.navigate(['/product', this.product.slug]);
    } else if (this.product?.id) {
      // Fallback to ID if slug is not available
      // Silently use ID instead of slug if not available
      this.router.navigate(['/product', this.product.id]);
    }
  }

  getLabelClass(): string {
    if (!this.product.label) {
      return '';
    }
    const label = this.product.label.toLowerCase();

    if (label.includes('sale') || label.includes('off') || label.includes('%')) {
      return 'label-sale';
    }
    if (label.includes('new') || label.includes('nouveau') || label === 'new') {
      return 'label-nouveau';
    }
    if (label.includes('solde') || label.includes('soldes')) {
      return 'label-solde';
    }
    if (label.includes('promo') || label.includes('promotion')) {
      return 'label-promo';
    }
    if (label.includes('bestseller') || label.includes('best-seller')) {
      return 'label-bestseller';
    }
    if (label.includes('luxury') || label.includes('luxe')) {
      return 'label-luxury';
    }

    return 'label-default';
  }
}
