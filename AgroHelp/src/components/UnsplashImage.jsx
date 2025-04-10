import React from 'react';
import PropTypes from 'prop-types';
import './UnsplashImage.css';

/**
 * A reusable component for displaying Unsplash images with proper attribution
 */
const UnsplashImage = ({ imageData, className, style, size = 'regular' }) => {
  if (!imageData) {
    return null;
  }

  // Select appropriate size URL based on the size prop
  const getImageUrl = () => {
    switch (size) {
      case 'small':
        return imageData.smallUrl;
      case 'thumb':
        return imageData.thumbUrl;
      case 'regular':
      default:
        return imageData.url;
    }
  };

  return (
    <div className={`unsplash-image-container ${className || ''}`} style={style}>
      <img 
        src={getImageUrl()} 
        alt={imageData.altDescription} 
        className="unsplash-image"
      />
      <div className="unsplash-attribution">
        <span>Photo by </span>
        <a 
          href={imageData.photographer.link} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          {imageData.photographer.name}
        </a>
        <span> on </span>
        <a 
          href={imageData.unsplashLink} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Unsplash
        </a>
      </div>
    </div>
  );
};

UnsplashImage.propTypes = {
  imageData: PropTypes.shape({
    id: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    smallUrl: PropTypes.string.isRequired,
    thumbUrl: PropTypes.string.isRequired,
    altDescription: PropTypes.string.isRequired,
    photographer: PropTypes.shape({
      name: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired
    }).isRequired,
    unsplashLink: PropTypes.string.isRequired
  }),
  className: PropTypes.string,
  style: PropTypes.object,
  size: PropTypes.oneOf(['regular', 'small', 'thumb'])
};

export default UnsplashImage; 