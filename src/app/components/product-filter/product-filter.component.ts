/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import type { FilterCategory } from '../../../shared/interfaces';

@Component({
  selector: 'app-product-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCheckboxModule, MatRadioModule, FontAwesomeModule],
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.scss'],
})
export class ProductFilterComponent {
  @Input() isMobile = false;
  @Input() isTablet = false;
  @Output() filterChange = new EventEmitter<any>();

  filterCategories: FilterCategory[] = [
    {
      title: 'CATEGORIES',
      type: 'icon',
      icon: 'fas list',
      options: [
        { name: 'Watches', value: 'watches', icon: 'fas clock' },
        { name: 'Jewelry', value: 'jewelry', icon: 'fas gem' },
        { name: 'Perfumes', value: 'perfumes', icon: 'fas spray-can' },
        { name: 'Accessories', value: 'accessories', icon: 'fas ring' },
        { name: 'Collections', value: 'collections', icon: 'fas box' },
        { name: 'Gifts', value: 'gifts', icon: 'fas gift' },
      ],
    },
    {
      title: 'BRANDS',
      type: 'text',
      icon: 'fas tags',
      options: [
        { name: 'Rolex', value: 'rolex', checked: false },
        { name: 'Cartier', value: 'cartier', checked: false },
        { name: 'Tiffany & Co.', value: 'tiffany', checked: false },
        { name: 'Bvlgari', value: 'bvlgari', checked: false },
        { name: 'Omega', value: 'omega', checked: false },
        { name: 'Dior', value: 'dior', checked: false },
        { name: 'Chanel', value: 'chanel', checked: false },
      ],
    },
    {
      title: 'PRICE',
      type: 'radio',
      options: [
        { name: 'All prices', value: 'all', count: 0, checked: true },
        { name: 'XAF 0 - XAF 500', value: '0-500', count: 0, checked: false },
        { name: 'XAF 500 - XAF 1,000', value: '500-1000', count: 0, checked: false },
        { name: 'XAF 1,000 - XAF 5,000', value: '1000-5000', count: 0, checked: false },
        { name: 'XAF 5,000+', value: '5000-plus', count: 0, checked: false },
      ],
    },
    {
      title: 'PRODUCT RANGE',
      type: 'checkbox',
      options: [
        { name: 'Women\'s Jewelry', value: 'womens-jewelry', count: 42, checked: false },
        { name: 'Men\'s Jewelry', value: 'mens-jewelry', count: 38, checked: false },
        { name: 'Luxury Watches', value: 'luxury-watches', count: 35, checked: false },
        { name: 'Diamond Collections', value: 'diamond-collections', count: 40, checked: false },
        { name: 'Exclusive Fragrances', value: 'exclusive-fragrances', count: 25, checked: false },
      ],
    },
    {
      title: 'MATERIAL',
      type: 'checkbox',
      options: [
        { name: 'Gold', value: 'gold', count: 42, checked: false },
        { name: 'Silver', value: 'silver', count: 38, checked: false },
        { name: 'Platinum', value: 'platinum', count: 35, checked: false },
        { name: 'Rose Gold', value: 'rose-gold', count: 40, checked: false },
        { name: 'Diamond', value: 'diamond', count: 25, checked: false },
      ],
    },
    {
      title: 'OCCASIONS',
      type: 'checkbox',
      options: [
        { name: 'Wedding', value: 'wedding', count: 28, checked: false },
        { name: 'Anniversary', value: 'anniversary', count: 24, checked: false },
        { name: 'Birthday', value: 'birthday', count: 32, checked: false },
        { name: 'Corporate', value: 'corporate', count: 35, checked: false },
        { name: 'Holiday', value: 'holiday', count: 29, checked: false },
      ],
    },
    {
      title: 'FEATURES',
      type: 'checkbox',
      options: [
        { name: 'Limited Edition', value: 'limited-edition', count: 18, checked: false },
        { name: 'Handcrafted', value: 'handcrafted', count: 22, checked: false },
        { name: 'Engraved', value: 'engraved', count: 15, checked: false },
        { name: 'Vintage', value: 'vintage', count: 12, checked: false },
        { name: 'Custom Design', value: 'custom-design', count: 20, checked: false },
      ],
    },
    {
      title: 'CERTIFICATIONS',
      type: 'checkbox',
      options: [
        { name: 'Conflict-Free', value: 'conflict-free', count: 18, checked: false },
        { name: 'Fair Trade', value: 'fair-trade', count: 22, checked: false },
        { name: 'Certified Authentic', value: 'certified-authentic', count: 25, checked: false },
        { name: 'GIA Certified', value: 'gia-certified', count: 30, checked: false },
        { name: 'Hallmarked', value: 'hallmarked', count: 15, checked: false },
      ],
    },
    {
      title: 'ETHICAL STANDARDS',
      type: 'checkbox',
      options: [
        { name: 'Eco-Friendly', value: 'eco-friendly', count: 12, checked: false },
        { name: 'Sustainable', value: 'sustainable', count: 8, checked: false },
        { name: 'Ethically Sourced', value: 'ethically-sourced', count: 15, checked: false },
        { name: 'Recycled Materials', value: 'recycled-materials', count: 20, checked: false },
      ],
    },
    {
      title: 'PRICE RANGE',
      type: 'checkbox',
      options: [
        { name: 'Under XAF 500', value: 'under-500', count: 45, checked: false },
        { name: 'XAF 500 - XAF 1,000', value: '500-1000', count: 32, checked: false },
        { name: 'XAF 1,000 - XAF 5,000', value: '1000-5000', count: 28, checked: false },
        { name: 'Over XAF 5,000', value: 'over-5000', count: 15, checked: false },
      ],
    },
    {
      title: 'COLLECTIONS',
      type: 'checkbox',
      options: [
        { name: 'Watches', value: 'watches', count: 0, checked: false },
        { name: 'Jewelry', value: 'jewelry', count: 0, checked: false },
        { name: 'Perfumes', value: 'perfumes', count: 0, checked: false },
        { name: 'Accessories', value: 'accessories', count: 0, checked: false },
        { name: 'Gifts', value: 'gifts', count: 0, checked: false },
        { name: 'Rings', value: 'rings', count: 0, checked: false },
        { name: 'Bracelets', value: 'bracelets', count: 0, checked: false },
        { name: 'Earrings', value: 'earrings', count: 0, checked: false },
        { name: 'Necklaces', value: 'necklaces', count: 0, checked: false },
        { name: 'New Arrivals', value: 'new-arrivals', count: 12, checked: false },
        { name: 'Best Sellers', value: 'best-sellers', count: 25, checked: false },
        { name: 'Special Offers', value: 'special-offers', count: 18, checked: false },
      ],
    },
  ];

  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, far, fab);
  }

  parseIcon(iconString: string | undefined): IconProp {
    if (!iconString) {
      return ['fas', 'question'] as IconProp;
    }
    const [prefix, ...nameParts] = iconString.split(' ');
    const name = nameParts[nameParts.length - 1].replace('fa-', '');

    // Handle special cases for Font Awesome 6
    if (name === 'perfume-bottle') {
      return ['fas', 'wine-bottle'] as IconProp;
    }
    if (name === 'face-smile') {
      return ['far', 'smile'] as IconProp;
    }
    if (name === 'spa') {
      return ['fas', 'spa'] as IconProp;
    }

    return [prefix as any, name] as IconProp;
  }

  onFilterChange(): void {
    const activeFilters = this.filterCategories.reduce((acc, category) => {
      const selectedOptions = category.options.filter((option) => option.checked).map((option) => option.value);
      if (selectedOptions.length > 0) {
        acc[category.title.toLowerCase()] = selectedOptions;
      }

      return acc;
    }, {} as Record<string, string[]>);

    this.filterChange.emit(activeFilters);
  }

  /**
   * Reset all filters to their default (unchecked) state and emit the change
   */
  resetFilters(): void {
    this.filterCategories.forEach(category => {
      category.options.forEach(option => {
        // For radio, reset to default (usually first option checked)
        if (category.type === 'radio') {
          option.checked = option === category.options[0];
        } else {
          option.checked = false;
        }
      });
    });
    this.onFilterChange();
  }

  /**
   * Toggle icon-based filter options and update checked state
   */
  toggleIconOption(categoryIdx: number, optionIdx: number): void {
    const category = this.filterCategories[categoryIdx];
    const option = category.options[optionIdx];
    option.checked = !option.checked;
    this.onFilterChange();
  }

  /**
   * Select a radio option and uncheck all others in the same group
   */
  selectRadioOption(categoryIdx: number, optionIdx: number): void {
    const category = this.filterCategories[categoryIdx];
    category.options.forEach((option, idx) => {
      option.checked = idx === optionIdx;
    });
    this.onFilterChange();
  }
}
