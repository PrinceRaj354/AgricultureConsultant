/**
 * Utility functions for fetching images from Unsplash API
 */

const UNSPLASH_ACCESS_KEY = 'SX3_F-rZnChWLt5efGlaxBwYjb2ZzPKSGi_oS6MSAWg';

/**
 * Fetches an image from Unsplash based on a keyword
 * @param {string} keyword - The search keyword (e.g., crop name, fertilizer type)
 * @param {number} count - Number of images to return (default: 1)
 * @returns {Promise<Array>} - Array of image URLs and related data
 */
export const fetchUnsplashImage = async (keyword, count = 1) => {
  try {
    // Add 'agriculture' to the search query for more relevant results
    const searchQuery = `${keyword} agriculture`;
    
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=${count}&client_id=${UNSPLASH_ACCESS_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      console.warn(`No images found for keyword: ${keyword}`);
      return [];
    }
    
    return data.results.map(image => ({
      id: image.id,
      url: image.urls.regular,
      smallUrl: image.urls.small,
      thumbUrl: image.urls.thumb,
      altDescription: image.alt_description || keyword,
      photographer: {
        name: image.user.name,
        link: image.user.links.html
      },
      unsplashLink: image.links.html
    }));
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    return [];
  }
};

/**
 * Returns Unsplash attribution component data
 * @param {Object} imageData - The image data returned from fetchUnsplashImage
 * @returns {Object} - Attribution data for displaying credits
 */
export const getUnsplashAttribution = (imageData) => {
  if (!imageData) return null;
  
  return {
    photographerName: imageData.photographer.name,
    photographerLink: imageData.photographer.link,
    unsplashLink: imageData.unsplashLink
  };
}; 