/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { CommonModule } from '@angular/common';
import type { OnChanges, SimpleChanges } from '@angular/core';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { StockAvailabilityStatus } from '../../../../shared/enums';
import type { ColorOption } from '../../../../shared/interfaces';
import type { Stock } from '../../../../shared/types';
import { Product } from '../../../../shared/types';
import { AddToCartComponent } from '../../../components/add-to-cart/add-to-cart.component';
import { AddToCartSuccessComponent } from '../../../components/add-to-cart-success/add-to-cart-success.component';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-product-info',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, AddToCartComponent, AddToCartSuccessComponent],
  templateUrl: './product-info.component.html',
  styleUrls: ['./product-info.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProductInfoComponent implements OnChanges {
  @Input() product!: Product;
  @Input() selectedStock: Stock | null = null;
  @Input() isMobile = false;
  @Input() isTablet = false;

  quantity = 1;
  currentPrice = 0;
  stockAvailability = '';
  stockAvailabilityStatus = StockAvailabilityStatus.IN_STOCK;
  showSuccessModal = false;

  // Color selection properties
  productColors: ColorOption[] = [];
  selectedColor = '';

  constructor(private library: FaIconLibrary, private cartService: CartService) {
    // Add all the icons
    this.library.addIconPacks(fas, far, fab);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] || changes['selectedStock']) {
      this.updatePriceAndAvailability();
      this.initializeColors();
    }
  }

  updatePriceAndAvailability(): void {
    if (this.selectedStock) {
      // Use stock price if a stock is selected
      this.currentPrice = this.selectedStock.price;

      // For development purposes, you can force a specific status here
      // For real data, we'd use the actual status from the API
      if (this.selectedStock.availabilityStatus) {
        this.stockAvailabilityStatus = this.selectedStock.availabilityStatus;
      } else {
        // Determine status based on quantity and availability
        this.stockAvailabilityStatus = this.determineStockStatus(this.selectedStock);
      }

      // Update the display message based on the status
      this.updateAvailabilityMessage();
    } else {
      // Use product price if no stock is selected
      this.currentPrice = this.product.price;

      // For development, set a default status
      this.stockAvailabilityStatus = this.product.inStock
        ? StockAvailabilityStatus.IN_STOCK
        : StockAvailabilityStatus.OUT_OF_STOCK;

      // Update the display message
      this.updateAvailabilityMessage();
    }
  }

  /**
   * Determine the stock availability status based on quantity and isAvailable flag
   */
  private determineStockStatus(stock: Stock): StockAvailabilityStatus {
    if (!stock.isAvailable) {
      return StockAvailabilityStatus.OUT_OF_STOCK;
    }

    if (stock.quantity > 10) {
      return StockAvailabilityStatus.IN_STOCK;
    } else if (stock.quantity > 0) {
      return StockAvailabilityStatus.LOW_STOCK;
    } else {
      return StockAvailabilityStatus.BACKORDER;
    }
  }

  /**
   * Update the human-readable availability message based on the status
   */
  private updateAvailabilityMessage(): void {
    switch (this.stockAvailabilityStatus) {
      case StockAvailabilityStatus.IN_STOCK:
        this.stockAvailability = 'In Stock';
        break;
      case StockAvailabilityStatus.LOW_STOCK:
        const quantity = this.selectedStock?.quantity || 0;
        this.stockAvailability = `Low Stock (${quantity} remaining)`;
        break;
      case StockAvailabilityStatus.BACKORDER:
        this.stockAvailability = 'On Backorder';
        break;
      case StockAvailabilityStatus.OUT_OF_STOCK:
        this.stockAvailability = 'Out of Stock';
        break;
      default: // Default for development
        this.stockAvailability = 'In Stock';
        break;
    }
  }

  // Initialize available colors from product stocks
  initializeColors(): void {
    if (!this.product?.stocks?.length) {
      return;
    }

    // Get unique colors from product stocks
    const colorMap = new Map<string, ColorOption>();

    this.product.stocks.forEach((stock) => {
      if (stock.characteristics?.['color']) {
        const colorValue = stock.characteristics['color'];
        if (!colorMap.has(colorValue)) {
          colorMap.set(colorValue, {
            value: colorValue,
            label: colorValue,
            hex: this.getColorHex(colorValue),
          });
        }
      }
    });

    // Convert map to array
    this.productColors = Array.from(colorMap.values());

    // Select first color by default if no color is selected
    if (this.productColors.length > 0 && !this.selectedColor) {
      this.selectedColor = this.productColors[0].value;
    }
  }

  // Get hex code for common colors or default to a sensible value
  getColorHex(color: string): string {
    const colorMap: Record<string, string> = {
      Black: '#000000',
      White: '#FFFFFF',
      Silver: '#C0C0C0',
      Gray: '#808080',
      'Space Gray': '#9B9B9B',
      Gold: '#FFD700',
      'Rose Gold': '#B76E79',
      Blue: '#0000FF',
      Red: '#FF0000',
      Green: '#008000',
    };

    return colorMap[color] || '#CCCCCC';
  }

  // Handle color selection
  selectColor(color: string): void {
    this.selectedColor = color;

    // Find matching stock with this color
    if (this.product?.stocks) {
      const matchingStock = this.product.stocks.find(
        (stock) => stock.characteristics?.['color'] === color && stock.isAvailable
      );

      if (matchingStock) {
        // Simulate selection of this stock variant (TODO implemet real logic)
        console.log(`Selected stock with color: ${color}`);
      }
    }
  }

  formatCurrency(price: number, currency = 'XAF'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  incrementQuantity(): void {
    this.quantity = this.quantity + 1;
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity = this.quantity - 1;
    }
  }

  addToCart(): void {
    if (!this.product) {
      return;
    }

    // Add product to cart
    this.cartService.addToCart(this.product, this.quantity);

    // Show success modal
    this.showSuccessModal = true;
  }

  /**
   * Handle product added from cart button component
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onProductAdded(product: Product): void {
    this.showSuccessModal = true;
  }

  /**
   * Hide the success modal
   */
  hideSuccessModal(): void {
    this.showSuccessModal = false;
  }

  addToWishlist(): void {
    // Toggle wishlist status for this product
    this.product.inWishlist = !this.product.inWishlist;
  }
}
