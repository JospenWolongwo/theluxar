import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { MOCK_PRODUCTS, SHOWCASE_ITEMS } from '../../shared/data';
import type { Product, Screen, ScreenSize, ShowcaseItem } from '../../shared/types';
import { SCREEN_SIZES } from '../../shared/utils';
import { FeedbackComponent } from '../components/feedback/feedback.component';
import { FlashProductsSectionComponent } from '../components/flash-products-section/flash-products-section.component';
import { NewsletterComponent } from '../components/newsletter/newsletter.component';
import { ProductBannerComponent } from '../components/product-banner/product-banner.component';
import { ProductFilterComponent } from '../components/product-filter/product-filter.component';
import { ProductsSliderComponent } from '../components/products-slider/products-slider.component';
import { PromotionBannerComponent } from '../components/promotion-banner/promotion-banner.component';
import { ShowcaseCarouselComponent } from '../components/showcase-carousel/showcase-carousel.component';
import { ProductService } from '../services/product.service';
import { WishlistService } from '../services/wishlist.service';

@Component({
  selector: 'app-home-page',
  host: {
    class: 'w-100 flex-col align-items-center',
  },
  standalone: true,
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  imports: [
    CommonModule,
    HttpClientModule,
    NewsletterComponent,
    FeedbackComponent,
    ShowcaseCarouselComponent,
    ProductsSliderComponent,
    ProductFilterComponent,
    ProductBannerComponent,
    PromotionBannerComponent,
    FlashProductsSectionComponent,
  ],
})
export class HomePageComponent {
  subscription: Subscription = new Subscription();
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
  showcaseItems: ShowcaseItem[] = SHOWCASE_ITEMS;
  products: Product[] = [];
  filteredProducts: Product[] = [];
  activeFilters: Record<string, string[]> = {};
  isFilterPopupOpen = false;

  constructor(
    private responsive: BreakpointObserver,
    private productService: ProductService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    const screenSizes: Screen[] = ['ltSm', 'ltLg'];

    screenSizes.forEach((screenSize) => {
      this.subscription.add(
        this.responsive.observe([SCREEN_SIZES[screenSize]]).subscribe((state) => {
          this.currentScreenSize[screenSize] = state.matches;
        })
      );
    });

    // Subscribe to wishlist to check which products are in the wishlist
    this.subscription.add(
      this.wishlistService.getWishlistItems().subscribe((wishlistItems) => {
        // Update the inWishlist flag for all products that are in the wishlist
        const wishlistProductIds = wishlistItems.map((item) => item.product.id);

        // If products are already loaded, update their wishlist status
        if (this.products.length > 0) {
          this.products.forEach((product) => {
            product.inWishlist = wishlistProductIds.includes(product.id);
          });
          this.filteredProducts = [...this.products];
        }
      })
    );

    // Fetch products from API instead of using mock data
    this.productService.getProducts().subscribe({
      next: (products) => {
        if (products && products.length > 0) {
          // Make sure all required fields are present in the products
          this.products = products.map((product) => ({
            ...product,
            // Ensure these fields exist with defaults if they're missing
            imageUrl: product.gallery || 'assets/images/products/placeholder.png',
            inStock: product.inStock ?? true,
            inWishlist: false,
          }));

          // Clone the array to ensure Angular detects the change
          this.filteredProducts = [...this.products];
        } else {
          this.products = MOCK_PRODUCTS;
          this.filteredProducts = [...this.products];
        }
      },
      error: () => {
        // If there's an error, use mock data as fallback
        this.products = MOCK_PRODUCTS;
        this.filteredProducts = [...this.products];
      },
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onFilterChange(filters: Record<string, string[]>): void {
    this.activeFilters = filters;

    // If no filters are active, show all products
    if (Object.keys(filters).length === 0) {
      this.filteredProducts = [...this.products];

      return;
    }

    // Apply filters
    this.filteredProducts = this.products.filter(() => {
      // Replace with actual product filtering logic
      return true;
    });
  }

  toggleFilterPopup(): void {
    this.isFilterPopupOpen = !this.isFilterPopupOpen;
  }

  /**
   * Handle wishlist toggle from product card
   */
  onWishlistToggle(productId: string): void {
    const product = this.products.find((p) => p.id === productId);
    if (product) {
      this.wishlistService.toggleWishlistItem(product);
    }
  }

  /**
   * Handle reserve button click
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onReserveClick(productId: string): void {
    // Handle reserve functionality
  }
}
