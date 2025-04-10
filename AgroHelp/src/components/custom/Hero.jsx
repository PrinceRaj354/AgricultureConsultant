Hero.jsx

import React from 'react';
import '../../css/Hero.css';
import { Link } from 'react-router-dom';

// Import images
import CropImage from '../../assets/CROP.PNG';
import FertilizerImage from '../../assets/FERTILIZER.PNG';
import DiseaseImage from '../../assets/DISEASES.PNG';

function Hero() {
  return (
    <div className="hero">
      {/* Hero Title and Description */}
      <div className="heading">
        <h1 className="hero-title">Empowering Farmers for a Greener Future</h1>
        <p className="hero-description">
          Discover sustainable farming practices, get crop recommendations, and learn how to maintain plant health.
        </p>
      </div>

      {/* Hero Buttons Section */}
      <div className="hero-buttons">
        <Link to="/crop-recommendation">
          <div
            className="hero-button"
            style={{
              backgroundImage: `url(${CropImage})`,
            }}
          >
            <div className="button-overlay">
            
              
            </div>
          </div>
        </Link>
        <Link to="/fertilizer-suggestion">
          <div
            className="hero-button"
            style={{
              backgroundImage: `url(${FertilizerImage})`,
            }}
          >
            <div className="button-overlay">
              
              
            </div>
          </div>
        </Link>
        <Link to="/plant-disease-detection">
          <div
            className="hero-button"
            style={{
              backgroundImage: `url(${DiseaseImage})`,
            }}
          >
            <div className="button-overlay">
              
              
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Hero;




