/* eslint-disable max-lines */
import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { IconName } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import type { CoreFeature, IncludedItem, SpecItem } from '../../../../shared/interfaces';
import { Product } from '../../../../shared/types';

@Component({
  selector: 'app-product-tabs',
  templateUrl: './product-tabs.component.html',
  styleUrls: ['./product-tabs.component.scss'],
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
})
export class ProductTabsComponent implements OnInit {
  @Input() product!: Product;
  @Input() isMobile = false;
  @Input() isTablet = false;

  technicalData: SpecItem[] = [];
  coreFeatures: CoreFeature[] = [];
  includedItems: IncludedItem[] = [];
  isExpandedDescription = false;

  getIconName(iconString: string): IconName {
    // If the string already matches an IconName, return it directly
    // Otherwise, provide a fallback icon name
    return (iconString as IconName) || ('info-circle' as IconName);
  }

  // Map of common spec names to icons
  private iconMap: Record<string, string> = {
    processor: 'microchip',
    cpu: 'microchip',
    ram: 'memory',
    memory: 'memory',
    storage: 'hdd',
    'hard drive': 'hdd',
    ssd: 'database',
    hdd: 'database',
    'graphics card': 'desktop',
    gpu: 'desktop',
    display: 'tv',
    screen: 'tv',
    battery: 'battery-full',
    weight: 'weight',
    dimensions: 'ruler',
    os: 'window-maximize',
    'operating system': 'window-maximize',
    camera: 'camera',
    webcam: 'camera',
    keyboard: 'keyboard',
    charger: 'plug',
    'power supply': 'power-off',
    wifi: 'wifi',
    bluetooth: 'bluetooth',
    ports: 'usb',
    connections: 'usb',
    warranty: 'shield-alt',
  };

  constructor(private library: FaIconLibrary) {
    // Add Font Awesome icon packs
    this.library.addIconPacks(fas, far, fab);
  }

  ngOnInit(): void {
    this.prepareSpecifications();

    // If we still don't have any core features after processing, add some defaults
    if (this.coreFeatures.length === 0) {
      // Add default core features for demonstration
      this.addDefaultCoreFeatures();
    }
  }

  /**
   * Prepare product specifications from product data
   */
  prepareSpecifications(): void {
    // Reset arrays
    this.technicalData = [];
    this.coreFeatures = [];
    this.includedItems = [];

    // Process the basic product data
    if (this.product.brand) {
      this.technicalData.push({ label: 'Brand', value: this.product.brand });
    }

    this.technicalData.push({ label: 'Model', value: this.product.name });
    this.technicalData.push({ label: 'Article number', value: this.product.id });

    // Add specs if available
    if (this.product.specs) {
      this.technicalData.push({ label: 'Specifications', value: this.product.specs });
    }

    // Process the features array if available
    if (this.product.features && this.product.features.length > 0) {
      this.product.features.forEach((feature) => {
        // Try to detect included items (accessories)
        if (
          feature.toLowerCase().includes('included') ||
          feature.toLowerCase().includes('accessory') ||
          feature.toLowerCase().includes('box')
        ) {
          const icon = this.getIconForSpec(feature);
          this.includedItems.push({
            icon,
            label: feature,
            note: '(Standard)',
          });
        } else {
          this.technicalData.push({ label: 'Feature', value: feature });
        }
      });
    }

    // Process the extra attributes
    if (this.product.extraAttributes) {
      Object.keys(this.product.extraAttributes).forEach((key) => {
        if (this.product.extraAttributes && key in this.product.extraAttributes) {
          const value = this.product.extraAttributes[key];
          const stringValue = typeof value === 'string' ? value : String(value);

          // Identify core features
          if (this.isCommonSpec(key)) {
            const icon = this.getIconForSpec(key);
            this.coreFeatures.push({
              icon,
              label: this.formatLabel(key),
              value: stringValue,
            });
          }

          // Add to technical data
          this.technicalData.push({
            label: this.formatLabel(key),
            value: stringValue,
          });
        }
      });
    }

    // Process product characteristics from stocks if available
    if (this.product.stocks && this.product.stocks.length > 0) {
      this.product.stocks.forEach((stock) => {
        if (stock.characteristics) {
          Object.keys(stock.characteristics).forEach((key) => {
            const value = stock.characteristics?.[key] || '';

            // Identify core features
            if (this.isCommonSpec(key)) {
              const icon = this.getIconForSpec(key);
              this.coreFeatures.push({
                icon,
                label: this.formatLabel(key),
                value,
              });
            }

            // Add to technical data
            this.technicalData.push({
              label: this.formatLabel(key),
              value,
            });
          });
        }
      });
    }

    // If we don't have any included items, add defaults
    if (this.includedItems.length === 0) {
      this.includedItems = [
        { icon: 'power-off', label: 'Power supply', note: '(Standard)' },
        { icon: 'plug', label: 'Charging cable', note: '(Standard)' },
      ];
    }

    // If we don't have core features, generate default ones from technical data
    if (this.coreFeatures.length === 0) {
      // Look for common specs in the technical data
      const commonKeys = ['processor', 'ram', 'storage', 'graphics', 'display'];

      commonKeys.forEach((key) => {
        const spec = this.technicalData.find(
          (s) => s.label.toLowerCase().includes(key) || key.includes(s.label.toLowerCase())
        );

        if (spec) {
          this.coreFeatures.push({
            icon: this.getIconForSpec(key),
            label: spec.label,
            value: spec.value,
          });
        }
      });
    }

    // Remove duplicates from core features
    this.coreFeatures = this.removeDuplicates(this.coreFeatures, 'label');

    // Limit core features to 6 for display
    if (this.coreFeatures.length > 6) {
      this.coreFeatures = this.coreFeatures.slice(0, 6);
    }
  }

  /**
   * Toggle the expanded state of the product description
   */
  toggleDescription(): void {
    this.isExpandedDescription = !this.isExpandedDescription;
  }

  /**
   * Check if a key is likely a common specification
   */
  private isCommonSpec(key: string): boolean {
    const normalizedKey = key.toLowerCase();

    return Object.keys(this.iconMap).some(
      (iconKey) => normalizedKey.includes(iconKey) || iconKey.includes(normalizedKey)
    );
  }

  /**
   * Get an appropriate icon for a specification
   */
  private getIconForSpec(key: string): string {
    const normalizedKey = key.toLowerCase();

    // Try to find a direct match
    // eslint-disable-next-line keyword-spacing
    for (const [iconKey, icon] of Object.entries(this.iconMap)) {
      if (normalizedKey.includes(iconKey) || iconKey.includes(normalizedKey)) {
        return icon;
      }
    }

    // Default icon if no match
    return 'info-circle';
  }

  /**
   * Format a specification label to be more readable
   */
  private formatLabel(key: string): string {
    // Convert camelCase to spaces
    let formatted = key.replace(/([A-Z])/g, ' $1').toLowerCase();

    // Convert snake_case to spaces
    formatted = formatted.replace(/_/g, ' ');

    // Capitalize first letter
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  /**
   * Remove duplicate items from an array based on a property
   */
  private removeDuplicates<T>(array: T[], property: keyof T): T[] {
    return array.filter((obj, index, self) => index === self.findIndex((t) => t[property] === obj[property]));
  }

  /**
   * Add default core features when no data is available from the product
   */
  private addDefaultCoreFeatures(): void {
    this.coreFeatures = [
      { icon: 'microchip', label: 'Processor', value: 'Intel i5' },
      { icon: 'memory', label: 'RAM', value: '16 GB' },
      { icon: 'hdd', label: 'Storage', value: '256 GB' },
      { icon: 'database', label: 'Hard drive type', value: 'SSD' },
      { icon: 'desktop', label: 'Graphics', value: 'Intel UHD Graphics' },
      { icon: 'tv', label: 'Display', value: '14 inch' },
    ];
  }
}
