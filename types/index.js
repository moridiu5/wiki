// Type definitions as JSDoc comments for better IDE support

/**
 * @typedef {Object} PageMetadata
 * @property {string} image - URL or path to the page image
 * @property {Array<{key: string, value: string}>} fields - Metadata fields
 */

/**
 * @typedef {Object} Page
 * @property {string} id - Unique page identifier
 * @property {string} title - Page title
 * @property {string} content - Markdown content
 * @property {PageMetadata} metadata - Page metadata
 */

/**
 * @typedef {Object} Section
 * @property {string} id - Unique section identifier
 * @property {string} title - Section title
 * @property {Page[]} pages - Pages in this section
 */

export {};
