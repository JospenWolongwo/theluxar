/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import type { OnDestroy, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import type { Product, Screen, ScreenSize, Stock } from '../../shared/types';
import { SCREEN_SIZES } from '../../shared/utils';
import { ProductService } from '../services/product.service';
import { ProductGalleryComponent } from './components/product-gallery/product-gallery.component';
// Import standalone components directly with paths
import { ProductInfoComponent } from './components/product-info/product-info.component';
import { ProductReviewsComponent } from './components/product-reviews/product-reviews.component';
import { ProductTabsComponent } from './components/product-tabs/product-tabs.component';
import { RelatedProductsComponent } from './components/related-products/related-products.component';
import { StarRatingComponent } from '../components/star-rating/star-rating.component';

@Component({
  selector: 'app-product-detail-page',
  templateUrl: './product-detail-page.component.html',
  styleUrls: ['./product-detail-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule,
    // All of these are standalone components
    ProductInfoComponent,
    ProductGalleryComponent, 
    ProductReviewsComponent,
    ProductTabsComponent,
    RelatedProductsComponent,
    StarRatingComponent,
  ],
  providers: [ProductService],
})
export class ProductDetailPageComponent implements OnInit, OnDestroy {
  product!: Product;
  relatedProducts: Product[] = [];
  selectedStock: Stock | null = null;
  loading = true;
  error: string | null = null;
  subscription: Subscription = new Subscription();

  // Responsive state using the same approach as HomePage
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

  // Computed properties for backward compatibility
  get isMobile(): boolean {
    return this.currentScreenSize.ltSm;
  }

  get isTablet(): boolean {
    return !this.currentScreenSize.ltSm && this.currentScreenSize.ltLg;
  }

  // eslint-disable-next-line max-params
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly productService: ProductService,
    private readonly iconLibrary: FaIconLibrary
  ) {
    // Add FontAwesome icon packs
    this.iconLibrary.addIconPacks(fas, far, fab);
  }

  ngOnInit(): void {
    this.setupResponsiveObservers();
    this.loadProduct();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private setupResponsiveObservers(): void {
    // Using the same approach as in HomePage component
    const screenSizes: Screen[] = ['ltSm', 'ltLg'];

    screenSizes.forEach((screenSize) => {
      this.subscription.add(
        this.breakpointObserver.observe([SCREEN_SIZES[screenSize]]).subscribe((state) => {
          this.currentScreenSize[screenSize] = state.matches;
        })
      );
    });
  }

  private loadProduct(): void {
    const productSlug = this.route.snapshot.paramMap.get('slug');

    if (!productSlug) {
      this.error = 'Product not found';
      this.loading = false;

      return;
    }

    this.subscription.add(
      this.productService.getProductBySlug(productSlug).subscribe({
        next: (product: Product) => {
          this.product = product;
          this.loading = false;

          // Load related products
          if (product.category?.id) {
            this.loadRelatedProducts(product.category.id);
          }
        },
        error: () => {
          // Handle the error without accessing the error object
          this.error = 'Product not found or unavailable';
          this.loading = false;
        },
      })
    );
  }

  private loadRelatedProducts(categoryId: string): void {
    // Get the category name if available, otherwise use the ID
    const categoryName = this.product.category?.name || categoryId;
    
    console.log('Loading related products for category:', categoryName);
    
    this.subscription.add(
      // Pass the current product ID to exclude it from results, and limit to 8 related products
      this.productService.getProductsByCategory(categoryName, 8, this.product.id).subscribe({
        next: (products: Product[]) => {
          console.log('Related products loaded:', products.length);
          this.relatedProducts = products;
        },
        error: (err) => {
          console.error('Error loading related products:', err);
          // Set empty array to prevent errors in the template
          this.relatedProducts = [];
        },
      })
    );
  }

  onStockSelected(stock: Stock | null): void {
    this.selectedStock = stock;
  }
}
