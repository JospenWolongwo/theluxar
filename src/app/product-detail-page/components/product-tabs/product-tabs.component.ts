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

// Define the ProductFeature interface for feature specifications
export interface ProductFeature {
  name: string;
  value: string;
}

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
  productSpecifications: ProductFeature[] = [];

  getIconName(iconString: string): IconName {
    // If the string already matches an IconName, return it directly
    // Otherwise, provide a fallback icon name
    return (iconString as IconName) || ('info-circle' as IconName);
  }

  // Map of common spec names to icons
  private iconMap: Record<string, string> = {
    // Computing devices
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
    resolution: 'expand',
    battery: 'battery-full',
    weight: 'weight',
    dimensions: 'ruler',
    os: 'window-maximize',
    'operating system': 'window-maximize',
    camera: 'camera',
    webcam: 'camera',
    keyboard: 'keyboard',
    touchpad: 'hand-pointer',
    charger: 'plug',
    'power supply': 'power-off',
    wifi: 'wifi',
    bluetooth: 'bluetooth',
    ports: 'usb',
    connections: 'usb',
    warranty: 'shield-alt',
    
    // Clothing and accessories
    material: 'tshirt',
    fabric: 'tshirt',
    size: 'ruler-vertical',
    color: 'palette',
    style: 'tag',
    fit: 'user',
    pattern: 'shapes',
    gender: 'venus-mars',
    season: 'sun',
    care: 'hands-wash',
    
    // Home goods and furniture
    assembly: 'tools',
    'care instructions': 'hands-wash',
    finish: 'paint-roller',
    height: 'arrows-alt-v',
    width: 'arrows-alt-h',
    depth: 'cube',
    capacity: 'box-open',
    
    // Electronics (non-computing)
    power: 'bolt',
    voltage: 'bolt',
    wattage: 'bolt',
    connectivity: 'network-wired',
    'remote control': 'remote',
    'smart features': 'robot',
    
    // Miscellaneous
    brand: 'copyright',
    model: 'info-circle',
    type: 'tags'
  };

  constructor(private library: FaIconLibrary) {
    // Add Font Awesome icon packs
    this.library.addIconPacks(fas, far, fab);
  }

  ngOnInit(): void {
    // Load icons
    this.library.addIconPacks(fas, far, fab);

    // Only proceed if we have a valid product
    if (this.product) {
      
      // Determine product category first
      this.determineProductCategory();
      
      // Prepare the specifications from the product data
      this.prepareSpecifications();

      // Add default core features if specs are not available
      if (this.coreFeatures.length === 0) {
        this.addDefaultCoreFeatures();
      }
    }
  }
  
  // Product category information
  productCategory: string = '';
  productType: string = '';
  
  /**
   * Determine the product's category and type for category-specific UI customization
   * Focusing on jewelry, watches, and perfumes as the main product categories
   */
  determineProductCategory(): void {
    // Set default category if nothing is detected
    this.productCategory = 'generic';
    this.productType = 'generic';
    
    if (!this.product) {
      return;
    }
    
    // First check explicit category data
    if (this.product.category?.name) {
      this.productCategory = this.product.category.name.toLowerCase();
    } else if (this.product.categoryName) {
      this.productCategory = this.product.categoryName.toLowerCase();
    }
    
    // Try to infer product type from name, description, specs if category is generic/missing
    if (!this.productCategory || this.productCategory === 'generic') {
      const productText = [
        this.product.name || '',
        this.product.shortDescription || '',
        this.product.description || '',
        this.product.specs || '',
      ].join(' ').toLowerCase();
      
      // Check for luxury shop product type indicators
      if (/watch|timepiece|wristwatch|chronograph|rolex|omega|seiko|casio/i.test(productText)) {
        this.productType = 'watch';
      } else if (/jewelry|jewellery|necklace|bracelet|ring|earring|pendant|gold|silver|diamond|gem|pearl/i.test(productText)) {
        this.productType = 'jewelry';
      } else if (/perfume|fragrance|cologne|eau de|scent|parfum|spray/i.test(productText)) {
        this.productType = 'perfume';
      } else if (/gift set|collection|bundle|luxury|premium/i.test(productText)) {
        this.productType = 'luxury';
      } else if (/accessory|accessories|cufflink|tie|wallet|handbag|purse/i.test(productText)) {
        this.productType = 'accessory';
      }
    }
    
    // Map category names to more standardized types
    if (/watch|wrist|time|smart/i.test(this.productCategory)) {
      this.productType = 'watch';
    } else if (/jewel|ring|necklace|bracelet|earring|diamond|gold|silver/i.test(this.productCategory)) {
      this.productType = 'jewelry';
    } else if (/perfume|fragrance|cologne|parfum|scent/i.test(this.productCategory)) {
      this.productType = 'perfume';
    } else if (/gift|set|bundle|collection/i.test(this.productCategory)) {
      this.productType = 'luxury';
    } else if (/access|wallet|bag|purse|cufflink|tie/i.test(this.productCategory)) {
      this.productType = 'accessory';
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

    // If we don't have any included items, add defaults based on product type
    if (this.includedItems.length === 0) {
      switch (this.productType) {
        case 'jewelry':
          this.includedItems = [
            { icon: 'gift', label: 'Luxury gift box', note: '(Premium packaging)' },
            { icon: 'certificate', label: 'Certificate of authenticity', note: undefined },
            { icon: 'gem', label: 'Care instructions', note: undefined },
            { icon: 'tshirt', label: 'Polishing cloth', note: undefined }
          ];
          break;
        case 'watch':
          this.includedItems = [
            { icon: 'gift', label: 'Watch box', note: '(Premium packaging)' },
            { icon: 'book', label: 'User manual', note: undefined },
            { icon: 'certificate', label: 'Warranty card', note: '(2 years)' },
            { icon: 'tshirt', label: 'Cleaning cloth', note: undefined }
          ];
          break;
        case 'perfume':
          this.includedItems = [
            { icon: 'gift', label: 'Gift box', note: '(Premium packaging)' },
            { icon: 'flask', label: 'Fragrance sample', note: '(2ml)' },
            { icon: 'spray-can', label: 'Travel atomizer', note: undefined }
          ];
          break;
        default:
          // Default luxury items for any other product type
          this.includedItems = [
            { icon: 'gift', label: 'Luxury packaging', note: undefined },
            { icon: 'certificate', label: 'Certificate of authenticity', note: undefined }
          ];
          break;
      }
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
   * Add default core features based on product type if none are specified
   * to ensure we have something to display, focusing on luxury items
   */
  addDefaultCoreFeatures(): void {
    if (!this.product || this.productSpecifications.length > 0) {
      return; // Don't add defaults if we already have specifications
    }

    const defaultFeatures = [];

    // Add category-specific default features depending on the detected product type
    switch (this.productType) {
      case 'watch':
        this.coreFeatures = [
          { icon: 'clock', label: 'Movement', value: 'Automatic' },
          { icon: 'shield', label: 'Case Material', value: 'Stainless Steel' },
          { icon: 'ruler', label: 'Diameter', value: '40mm' },
          { icon: 'water', label: 'Water Resistance', value: '100m' },
          { icon: 'link', label: 'Band Material', value: 'Steel' },
          { icon: 'palette', label: 'Dial Color', value: 'Black' },
        ];
        break;
      case 'jewelry':
        this.coreFeatures = [
          { icon: 'gem', label: 'Material', value: '18k Gold' },
          { icon: 'diamond', label: 'Stone', value: 'Diamond' },
          { icon: 'weight', label: 'Carat Weight', value: '0.5ct' },
          { icon: 'certificate', label: 'Purity', value: '750/1000' },
          { icon: 'award', label: 'Certification', value: 'Included' },
          { icon: 'palette', label: 'Style', value: 'Contemporary' },
        ];
        break;
      case 'perfume':
        this.coreFeatures = [
          { icon: 'spray-can', label: 'Type', value: 'Eau de Parfum' },
          { icon: 'flask', label: 'Size', value: '100ml' },
          { icon: 'leaf', label: 'Top Notes', value: 'Citrus, Spice' },
          { icon: 'heart', label: 'Heart Notes', value: 'Floral' },
          { icon: 'hourglass', label: 'Longevity', value: '8-12 hours' },
          { icon: 'globe', label: 'Origin', value: 'France' },
        ];
        break;
      case 'luxury':
        defaultFeatures.push(
          { name: 'Collection', value: 'Limited Edition' },
          { name: 'Material', value: 'Premium Quality' },
          { name: 'Origin', value: 'Switzerland/France/Italy' },
          { name: 'Exclusivity', value: 'Limited Release' },
          { name: 'Set Contents', value: `Complete collection set` },
          { name: 'Craftsmanship', value: 'Hand-crafted' },
          { name: 'Box/Case', value: 'Elegant presentation box' },
          { name: 'Certificate', value: 'Authenticity guaranteed' }
        );
        break;
      case 'accessory':
        defaultFeatures.push(
          { name: 'Material', value: 'Genuine Leather' },
          { name: 'Color', value: 'Brown/Black/Navy' },
          { name: 'Interior', value: 'Fabric lining' },
          { name: 'Hardware', value: 'Gold-tone' },
          { name: 'Dimensions', value: 'L x W x H' },
          { name: 'Closure', value: 'Zipper/Magnetic' },
          { name: 'Features', value: 'Multiple compartments' },
          { name: 'Origin', value: 'Italian craftsmanship' }
        );
        break;
      default:
        // Default core features for any luxury product
        this.coreFeatures = [
          { icon: 'check', label: 'Brand', value: this.product.brand || 'The Luxar' },
          { icon: 'box', label: 'Model', value: 'Premium Collection' },
          { icon: 'tag', label: 'Warranty', value: '2 Years' },
          { icon: 'shield', label: 'Authenticity', value: 'Guaranteed' },
          { icon: 'dolly', label: 'Shipping', value: 'Free' },
          { icon: 'arrow-rotate-left', label: 'Returns', value: '30 Day' },
        ];
        break;
    }
  }
}
