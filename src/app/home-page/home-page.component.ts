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
            imageUrl: product.imageUrl || product.gallery || '/assets/images/products/placeholder.jpg',
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

    // Apply filters - each filter category is combined with AND logic
    // Within each category, options are combined with OR logic
    this.filteredProducts = this.products.filter((product) => {
      // Check each filter category
      for (const [category, values] of Object.entries(filters)) {
        if (values.length === 0) continue; // Skip empty filter groups
        
        // Check if product matches any value in this category (OR logic within category)
        const categoryMatches = this.matchProductToFilterCategory(product, category.toLowerCase(), values);
        
        // If product doesn't match any value in this category, exclude it (AND logic between categories)
        if (!categoryMatches) return false;
      }
      
      // Product matched all filter categories
      return true;
    });
  }

  /**
   * Check if a product matches a specific filter category
   * @param product The product to check
   * @param category The filter category (lowercase)
   * @param values The selected filter values for this category
   * @returns true if the product matches at least one value in this category
   */
  private matchProductToFilterCategory(product: Product, category: string, values: string[]): boolean {
    // Skip if no values are selected
    if (values.length === 0) return true;
    
    // Handle each filter category differently based on the product's properties
    switch (category) {
      case 'categories': {
        // Compare lowercased, dash/space-insensitive values for both filter and product
        return values.some(value => {
          const filterVal = value.toLowerCase().replace(/[-\s]/g, '');
          const productCat = (product.category?.name || product.categoryName || '').toLowerCase().replace(/[-\s]/g, '');
          return filterVal === productCat;
        });
      }
      case 'brands':
        // Check if product brand matches any selected brand
        const brand = product.brand?.toLowerCase() || '';
        return values.some(value => brand.includes(value.toLowerCase()));
      
      case 'price':
        // Handle price range filters
        if (values.includes('all')) return true;
        
        const price = product.price || 0;
        return values.some(priceRange => {
          if (priceRange === '0-500') return price >= 0 && price <= 500;
          if (priceRange === '500-1000') return price > 500 && price <= 1000;
          if (priceRange === '1000-5000') return price > 1000 && price <= 5000;
          if (priceRange === '5000-plus' || priceRange === 'over-5000') return price > 5000;
          if (priceRange === 'under-500') return price < 500;
          return false;
        });
      
      case 'product range':
        // Match against product name, description, category, or tag
        return values.some(value => {
          const productText = [
            product.name || '',
            product.shortDescription || '',
            product.category?.name || '',
            product.categoryName || '',
            product.tag || ''
          ].join(' ').toLowerCase();
          
          return this.matchFilterTextToProduct(value, productText);
        });
      
      case 'material':
        // Match against product description and specs
        return values.some(material => {
          const productSpecs = (product.specs || '').toLowerCase();
          const productDesc = (product.shortDescription || '').toLowerCase();
          const materialLower = material.toLowerCase();
          
          return productSpecs.includes(materialLower) || 
                 productDesc.includes(materialLower) || 
                 (product.name || '').toLowerCase().includes(materialLower);
        });
      
      case 'features':
      case 'occasions':
      case 'certifications':
      case 'ethical standards':
      case 'collections': {
        // Robust collections filter: check collections, label, tag, features, category, etc., normalizing both sides
        return values.some(value => {
          const filterVal = value.toLowerCase().replace(/[-\s]/g, '');
          const collections = (product as any)?.collections;
          if (collections) {
            if (Array.isArray(collections)) {
              if (collections.some((c: string) => typeof c === 'string' && c.toLowerCase().replace(/[-\s]/g, '').includes(filterVal))) return true;
            } else if (typeof collections === 'string') {
              if (collections.toLowerCase().replace(/[-\s]/g, '').includes(filterVal)) return true;
            }
          }
          if (typeof product.label === 'string' && product.label.toLowerCase().replace(/[-\s]/g, '').includes(filterVal)) return true;
          if ((product.tag || '').toLowerCase().replace(/[-\s]/g, '').includes(filterVal)) return true;
          if (product.features && Array.isArray(product.features)) {
            if (product.features.some((feature: string) => feature.toLowerCase().replace(/[-\s]/g, '').includes(filterVal))) return true;
          }
          const productDesc = (product.shortDescription || '').toLowerCase().replace(/[-\s]/g, '');
          if (productDesc.includes(filterVal)) return true;
          const productCat = (product.category?.name || product.categoryName || '').toLowerCase().replace(/[-\s]/g, '');
          if (productCat === filterVal) {
            console.log('[COLLECTIONS FILTER MATCH]', { filterVal, productCat, product });
            return true;
          } else {
            console.log('[COLLECTIONS FILTER NO MATCH]', { filterVal, productCat, product });
          }
          return false;
        });
      }

      // For any other filter category that we haven't explicitly handled
      default:
        // Try to find matches in product name, description, or specs
        return values.some(value => {
          const searchText = [
            product.name || '',
            product.shortDescription || '',
            product.specs || '',
            product.categoryName || '',
            product.tag || ''
          ].join(' ').toLowerCase();
          
          return searchText.includes(value.toLowerCase());
        });
    }
  }
  
  /**
   * Helper to match filter values to product text content
   * Handles special cases for product ranges like 'women's jewelry'
   */
  private matchFilterTextToProduct(filterValue: string, productText: string): boolean {
    const value = filterValue.toLowerCase();
    
    // Special handling for filter values
    switch (value) {
      case 'womens-jewelry':
        return productText.includes('women') && 
               (productText.includes('jewelry') || productText.includes('jewel'));
      
      case 'mens-jewelry':
        return productText.includes('men') && 
               (productText.includes('jewelry') || productText.includes('jewel'));
      
      case 'luxury-watches':
        return productText.includes('watch') && 
               (productText.includes('luxury') || 
                productText.includes('premium') || 
                productText.includes('gold') || 
                productText.includes('diamond'));
      
      case 'diamond-collections':
        return productText.includes('diamond');
      
      case 'exclusive-fragrances':
        return (productText.includes('fragrance') || 
                productText.includes('perfume') || 
                productText.includes('cologne')) && 
               (productText.includes('exclusive') || 
                productText.includes('premium') || 
                productText.includes('luxury'));
      
      default:
        // Default behavior - direct text matching
        return productText.includes(value);
    }
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
