/**
 * Utility functions for string manipulation
 */

/**
 * Generate a URL-friendly slug from a string
 * @param text The text to convert to a slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Generate a unique slug by combining product name and other attributes
 * @param productName The name of the product
 * @param uniqueId A unique identifier (like SKU, product code, etc.)
 */
export function generateProductSlug(productName: string, uniqueId: string): string {
  const nameSlug = slugify(productName);
  const idPart = uniqueId.toString().toLowerCase().substring(0, 8);

  return `${nameSlug}-${idPart}`;
}

/**
 * Parse a product slug to extract components
 * @param slug The product slug to parse
 * @returns An object with the extracted name part and id part
 */
export function parseProductSlug(slug: string): { namePart: string; idPart: string } {
  const lastDashIndex = slug.lastIndexOf('-');
  if (lastDashIndex === -1) {
    return { namePart: slug, idPart: '' };
  }

  const namePart = slug.substring(0, lastDashIndex);
  const idPart = slug.substring(lastDashIndex + 1);

  return { namePart, idPart };
}
