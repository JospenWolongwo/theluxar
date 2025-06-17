/* eslint-disable max-lines */
import { CommonModule } from '@angular/common';
import type { AfterViewInit, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import type { Product } from '../../../shared/types';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-products-slider',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './products-slider.component.html',
  styleUrls: ['./products-slider.component.scss'],
})
export class ProductsSliderComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() products: Product[] = [];
  @Input() title = 'Featured Products';
  @Input() isMobile = false;
  @Input() isTablet = false;

  currentSlide = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sliderInterval: any;
  rowsPerView = 5;
  processedProducts: Product[] = [];
  totalPages = 0;

  /**
   * Calculate the number of products to show per page based on device type
   */
  get productsPerPage(): number {
    // Mobile: 4 products (1x4)
    // Tablet: 6 products (2x3)
    // Desktop: 15 products (3x5)
    return this.isMobile ? 4 : this.isTablet ? 6 : 15;
  }

  /**
   * Calculate the total number of pages based on products and device
   */
  get totalSlides(): number {
    if (!this.processedProducts || this.processedProducts.length === 0) {
      return 0;
    }

    return Math.ceil(this.processedProducts.length / this.productsPerPage);
  }

  /**
   * Generate array of slide indices (0, 1, 2, etc.) based on number of pages
   */
  get indicators(): number[] {
    const totalPages = Math.max(1, this.totalSlides);

    return Array(totalPages)
      .fill(0)
      .map((_, i) => i);
  }

  ngOnInit(): void {
    this.updateProductsPerPage();
    this.processProducts();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  ngAfterViewInit(): void {
    this.setupIndicators();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize.bind(this));
    this.stopSlider();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['products']) {
      this.processProducts();
    }
  }

  processProducts(): void {
    if (!Array.isArray(this.products)) {
      this.processedProducts = [];
    } else {
      // Deep clone products to avoid reference issues
      this.processedProducts = JSON.parse(JSON.stringify(this.products));
    }

    // Always recalculate total pages
    this.updateTotalPages();
  }

  // Update total pages calculation to adjust based on products and device
  updateTotalPages(): void {
    // Update totalPages based on calculated slides
    this.totalPages = Math.max(1, this.totalSlides);

    // Ensure current slide is within bounds
    if (this.currentSlide >= this.totalPages) {
      this.currentSlide = 0;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateProductsPerPage();
    this.updateTotalPages();
    this.updateLayout();
  }

  updateLayout(): void {
    const slider = document.querySelector('.slider-products') as HTMLElement;
    if (slider) {
      const slideWidth = 100;
      const translateValue = -this.currentSlide * slideWidth;
      slider.style.transform = `translateX(${translateValue}%)`;
    }
    // Update active indicator
    this.updateActiveIndicator();
  }

  updateActiveIndicator(): void {
    const indicators = document.querySelectorAll('.products-slider-indicator');
    indicators.forEach((indicator, index) => {
      if (index === this.currentSlide) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
  }

  stopSlider(): void {
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.totalPages;
    this.updateSlider();
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.totalPages) % this.totalPages;
    this.updateSlider();
  }

  goToSlide(index: number): void {
    this.currentSlide = index % this.totalPages;
    this.updateSlider();
  }

  updateProductsPerPage(): void {
    this.updateTotalPages();
  }

  updateSlider(): void {
    this.updateLayout();
  }

  setupIndicators(): void {
    const indicators = document.querySelectorAll('.products-slider-indicator');

    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        this.goToSlide(index);
      });
    });
  }

  @Output() wishlistToggled = new EventEmitter<string>();
  @Output() productReserved = new EventEmitter<string>();

  onWishlistToggle(productId: string): void {
    // Forward wishlist toggle to parent component
    this.wishlistToggled.emit(productId);
  }

  onReserveClick(productId: string): void {
    // Forward reserve click to parent component
    this.productReserved.emit(productId);
  }

  // Get products for current slide set
  get currentSlideProducts(): Product[] {
    const startIndex = this.currentSlide * this.productsPerPage;

    return this.processedProducts.slice(startIndex, startIndex + this.productsPerPage);
  }

  /**
   * Get products for a specific page index
   * This distributes products based on device type
   */
  getProductRowsForPage(pageIndex: number): Product[][] {
    const rows: Product[][] = [];

    // Early return if no products
    if (!this.processedProducts || this.processedProducts.length === 0) {
      return [[]];
    }

    // Get products per page based on device
    const productsPerPage = this.productsPerPage;

    // Calculate start and end indices for this page
    const startIndex = pageIndex * productsPerPage;
    const endIndex = Math.min(startIndex + productsPerPage, this.processedProducts.length);

    // If we're past the end of our products array, return empty
    if (startIndex >= this.processedProducts.length) {
      return [[]];
    }

    // Get only products for THIS page
    const pageProducts = this.processedProducts.slice(startIndex, endIndex);

    // Add products to the row if we have any
    if (pageProducts.length > 0) {
      rows.push(pageProducts);
    }

    return rows;
  }

  // Get products organized by rows
  get productRows(): Product[][] {
    const rows: Product[][] = [];
    const products = this.currentSlideProducts;

    for (let i = 0; i < this.rowsPerView; i++) {
      const startIndex = i * 3;
      const rowProducts = products.slice(startIndex, startIndex + 3);
      if (rowProducts.length > 0) {
        rows.push(rowProducts);
      }
    }

    return rows;
  }
}
