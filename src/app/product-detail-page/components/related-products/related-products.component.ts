import { CommonModule } from '@angular/common';
import type { OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import type { Product } from '../../../../shared/types/product.type';
import { StarRatingComponent } from '../../../components/star-rating/star-rating.component';

@Component({
  selector: 'app-related-products',
  standalone: true,
  imports: [CommonModule, RouterModule, StarRatingComponent, FontAwesomeModule],
  templateUrl: './related-products.component.html',
  styleUrls: ['./related-products.component.scss'],
})
export class RelatedProductsComponent implements OnInit, OnChanges {
  @Input() products: Product[] = [];
  @Input() isMobile = false;
  @Input() isTablet = false;

  currentPage = 0;
  itemsPerPage = 4; // Default for desktop
  totalPages = 0;
  isAnimating = false;

  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
  }

  ngOnInit(): void {
    this.calculateItemsPerPage();
    this.calculatePages();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isMobile'] || changes['isTablet']) {
      this.calculateItemsPerPage();
      this.calculatePages();

      // Reset to first page when screen size changes
      this.currentPage = 0;
    }

    if (changes['products']) {
      console.log('RelatedProductsComponent: Products changed:', this.products);
      console.log('RelatedProductsComponent: Products length:', this.products.length);
      this.calculatePages();
    }
  }

  /**
   * Calculate how many items should be shown per page based on screen size
   */
  calculateItemsPerPage(): void {
    if (this.isMobile) {
      this.itemsPerPage = 1;
    } else if (this.isTablet) {
      this.itemsPerPage = 2;
    } else {
      this.itemsPerPage = 4;
    }
  }

  calculatePages(): void {
    if (!this.products || this.products.length === 0) {
      this.totalPages = 0;

      return;
    }

    this.totalPages = Math.ceil(this.products.length / this.itemsPerPage);

    // Make sure current page is valid
    if (this.currentPage >= this.totalPages) {
      this.currentPage = Math.max(0, this.totalPages - 1);
    }
  }

  /**
   * Gets an array of all page indices
   */
  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  /**
   * Get array for pagination indicators
   */
  getPagesArray(): number[] {
    return Array(this.totalPages).fill(0);
  }

  /**
   * Navigate to a specific page
   */
  goToPage(pageIndex: number): void {
    if (this.isAnimating || pageIndex === this.currentPage || pageIndex < 0 || pageIndex >= this.totalPages) {
      return;
    }

    this.isAnimating = true;
    this.currentPage = pageIndex;

    // Reset animating flag after transition completes
    setTimeout(() => {
      this.isAnimating = false;
    }, 500); // Match this with the CSS transition duration
  }

  /**
   * Get products for a specific page
   */
  getProductRowsForPage(page: number): Product[] {
    if (page < 0 || page >= this.totalPages || !this.products.length) {
      return [];
    }

    // Calculate start and end indices for the current page
    const startIndex = page * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.products.length);

    // Get the products for this page
    const pageProducts = this.products.slice(startIndex, endIndex);

    // If we're on desktop and don't have enough products to fill the row,
    // add empty slots to maintain the grid structure
    if (!this.isMobile && !this.isTablet && pageProducts.length < this.itemsPerPage) {
      const emptySlots = this.itemsPerPage - pageProducts.length;
      for (let i = 0; i < emptySlots; i++) {
        // We'll filter these out in the template
        pageProducts.push({} as Product);
      }
    }

    if (this.isMobile && pageProducts.length > 1) {
      return [pageProducts[0]];
    }

    return pageProducts;
  }

  /**
   * Navigate to the next page
   */
  nextPage(): void {
    if (this.isAnimating || this.currentPage >= this.totalPages - 1) {
      return;
    }

    this.isAnimating = true;
    this.currentPage = this.currentPage + 1;

    // Reset animating flag after transition completes
    setTimeout(() => {
      this.isAnimating = false;
    }, 500);
  }

  /**
   * Navigate to the previous page
   */
  prevPage(): void {
    if (this.isAnimating || this.currentPage <= 0) {
      return;
    }

    this.isAnimating = true;
    this.currentPage = this.currentPage - 1;

    // Reset animating flag after transition completes
    setTimeout(() => {
      this.isAnimating = false;
    }, 500); // Match this with the CSS transition duration
  }

  /**
   * Format currency for display
   */
  formatCurrency(price: number, currency = 'XAF') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }
}
