import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

/**
 * Interface for promotion items displayed in the banner
 * @property id - Unique identifier and CSS class for the promotion item
 * @property title - Main title of the promotion (e.g., brand name)
 * @property tagline - Secondary title/subtitle (e.g., product model)
 * @property price - Price of the product (optional, empty string if not displayed)
 * @property currency - Currency code (optional, empty string if price not displayed)
 * @property label - Label text displayed on the banner (e.g., "NEW", "SALE")
 * @property imageUrl - Path to the product image
 * @property link - URL to navigate to when item is clicked
 */
interface PromotionItem {
  id: string;
  title: string;
  tagline: string;
  price: string;
  currency: string;
  label: string;
  imageUrl: string;
  link: string;
}

@Component({
  selector: 'app-promotion-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './promotion-banner.component.html',
  styleUrl: './promotion-banner.component.scss',
})
export class PromotionBannerComponent {
  @Input() isMobile = false;
  @Input() isTablet = false;
  @Input() resultsCount?: number;
  @Input() sortOption = 'Most Popular';

  promotionItems: PromotionItem[] = [
    {
      id: 'luxury-watch',
      title: 'Audemars Piguet',
      tagline: 'Royal Oak Collection',
      price: '38,500',
      currency: 'FCFA',
      label: 'EXCLUSIVE',
      imageUrl: 'assets/images/luxury-watch.jpg',
      link: '/products/category/watches',
    },
    {
      id: 'luxury-perfume',
      title: 'Chanel',
      tagline: 'Exclusive Fragrance',
      price: '12,500',
      currency: 'FCFA',
      label: 'NEW ARRIVAL',
      imageUrl: 'assets/images/luxury-perfume.jpg',
      link: '/products/category/perfumes',
    },
  ];

  filterCategories: string[] = ['Rings', 'Necklaces', 'Watches', 'Bracelets', 'Earrings', 'Collections'];

  constructor(private router: Router) {}

  navigateToCategory(link: string): void {
    this.router.navigateByUrl(link);
  }

  applyFilter(category: string): void {
    this.router.navigate(['/products'], {
      queryParams: { category: category.toLowerCase() },
    });
  }
}
