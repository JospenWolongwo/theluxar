import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import type { ShowcaseItem } from '../../../shared/types';

@Component({
  selector: 'app-product-banner',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './product-banner.component.html',
  styleUrl: './product-banner.component.scss',
})
export class ProductBannerComponent {
  @Input() isMobile = false;
  @Input() isTablet = false;

  constructor(library: FaIconLibrary) {
    library.addIconPacks(fab, fas, far);
  }

  productData: ShowcaseItem[] = [
    {
      id: 1,
      name: 'Audemars Piguet Royal Oak',
      description: 'Self-winding chronograph with 18k rose gold case and sapphire crystal',
      price: '64,500',
      currency: 'FCFA',
      imageUrl: '/assets/images/luxury-watch.jpg',
      tag: 'Limited Edition',
      benefits: ['Swiss Craftsmanship', 'Lifetime Warranty']
    },
    {
      id: 2,
      name: 'Chanel N°5 Parfum',
      description: 'Iconic fragrance with notes of rose, jasmine and vanilla in a crystal bottle',
      price: '28,750',
      currency: 'FCFA',
      imageUrl: '/assets/images/luxury-perfume.jpg',
      tag: 'Bestseller',
      benefits: ['Pure Extract', 'Signature Scent']
    },
  ];
}
