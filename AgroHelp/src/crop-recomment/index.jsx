import React, { useState, useEffect } from 'react';
import './crop.css';
import { chatSession } from '../service/AIModal.jsx';
import axios from 'axios';
import cropData from '../utils/cropData';
import { fetchUnsplashImage } from '../utils/unsplashAPI';
import UnsplashImage from '../components/UnsplashImage';

function CropRecommendation() {
  const [soilTexture, setSoilTexture] = useState('');
  const [phLevel, setPhLevel] = useState('');
  const [nitrogen, setNitrogen] = useState('');
  const [phosphorus, setPhosphorus] = useState('');
  const [potassium, setPotassium] = useState('');
  const [temperature, setTemperature] = useState('');
  const [rainfall, setRainfall] = useState('');
  const [humidity, setHumidity] = useState('');
  const [windConditions, setWindConditions] = useState('');
  const [waterSource, setWaterSource] = useState('');
  const [irrigationSystem, setIrrigationSystem] = useState(false);
  const [waterUsage, setWaterUsage] = useState('');
  const [farmingTech, setFarmingTech] = useState('');
  const [prevCrops, setPrevCrops] = useState('');
  const [cropPreferences, setCropPreferences] = useState('');
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [cropImages, setCropImages] = useState({});
  const [loadingImages, setLoadingImages] = useState(false);

  // Fetch weather data based on user's location
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setWeatherLoading(true);
        
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            const response = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=1c65709bf4cb6da8a540e2d2b8ba3adf`
            );
            
            setWeather(response.data);
            
            // Auto-fill temperature and humidity fields if they're empty
            if (temperature === '') {
              setTemperature(Math.round(response.data.main.temp));
            }
            
            if (humidity === '') {
              setHumidity(response.data.main.humidity);
            }
            
            setWeatherLoading(false);
          },
          (err) => {
            console.error("Geolocation error:", err);
            setWeatherLoading(false);
          }
        );
      } catch (err) {
        console.error("Weather API error:", err);
        setWeatherLoading(false);
      }
    };
    
    fetchWeather();
  }, [temperature, humidity]);

  // Fetch Unsplash images for crop recommendations
  useEffect(() => {
    const fetchCropImages = async () => {
      if (!recommendations || recommendations.length === 0) return;
      
      setLoadingImages(true);
      const newCropImages = { ...cropImages };
      
      // Only fetch images for crops we don't already have
      const cropsToFetch = recommendations.filter(
        rec => !newCropImages[rec.crop]
      ).map(rec => rec.crop);
      
      if (cropsToFetch.length === 0) {
        setLoadingImages(false);
        return;
      }
      
      try {
        // Fetch images in parallel
        const imagePromises = cropsToFetch.map(crop => 
          fetchUnsplashImage(crop, 1)
            .then(images => {
              if (images.length > 0) {
                newCropImages[crop] = images[0];
              }
              return null;
            })
        );
        
        await Promise.all(imagePromises);
        setCropImages(newCropImages);
      } catch (error) {
        console.error('Error fetching crop images:', error);
      } finally {
        setLoadingImages(false);
      }
    };
    
    fetchCropImages();
  }, [recommendations]);

  // Fetch image for selected crop details
  useEffect(() => {
    const fetchSelectedCropImage = async () => {
      if (!selectedCrop || cropImages[selectedCrop.name]) return;
      
      try {
        const images = await fetchUnsplashImage(selectedCrop.name, 1);
        if (images.length > 0) {
          setCropImages(prev => ({
            ...prev,
            [selectedCrop.name]: images[0]
          }));
        }
      } catch (error) {
        console.error('Error fetching selected crop image:', error);
      }
    };
    
    fetchSelectedCropImage();
  }, [selectedCrop]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const aiPrompt = `Based on the following data provided by the farmer:
    - Soil Texture: ${soilTexture}
    - Soil pH Level: ${phLevel}
    - Nitrogen Level: ${nitrogen} mg/kg
    - Phosphorus Level: ${phosphorus} mg/kg
    - Potassium Level: ${potassium} mg/kg
    - Average Temperature: ${temperature}°C
    - Seasonal Rainfall: ${rainfall} mm
    - Humidity Level: ${humidity}%
    - Wind Conditions: ${windConditions}
    - Water Source: ${waterSource}
    - Irrigation System Available: ${irrigationSystem ? 'Yes' : 'No'}
    - Water Usage Limitations: ${waterUsage}
    - Farming Technology Access: ${farmingTech}
    - Previously Grown Crops: ${prevCrops || 'None specified'}
    - Crop Preferences: ${cropPreferences || 'None specified'}
    - Region/Place: ${region || 'Not specified'}

    Consider sustainability, efficient land use, environmental impact, and crop rotation. Recommend:
    1. Suitable crops for the conditions.
    2. Suitability explanation.
    3. Expected yields.
    4. Tips for optimal growth.
    5. Any environmental or sustainability considerations.`;

    try {
      const result = await chatSession.sendMessage(aiPrompt);
      const data = await result.response.text();
      console.log("JSON Response:", data);
      const parsedData = JSON.parse(data);
      
      // Safely set recommendations
      setRecommendations(parsedData.recommendations || [{ error: "No recommendations found." }]);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations([{ error: "Unable to generate recommendations. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting a crop to see details
  const handleCropSelect = (crop) => {
    const cropName = crop.crop ? crop.crop : crop;
    const cropInfo = Object.entries(cropData).find(
      ([key]) => key.toLowerCase() === cropName.toLowerCase()
    );
    
    if (cropInfo) {
      setSelectedCrop({
        name: cropInfo[0],
        ...cropInfo[1]
      });
    } else {
      setSelectedCrop({
        name: cropName,
        sowingTime: "Information not available",
        harvestingTime: "Information not available",
        description: "Detailed information not available for this crop."
      });
    }
  };

  return (
    <div className="container crop-recommendation-container">
      <h2 className="section-title">Crop Recommendation</h2>
      
      {weather && !weatherLoading && (
        <div className="weather-data-info">
          <p>Current weather at your location:</p>
          <div className="weather-details-small">
            <span>Temperature: {Math.round(weather.main.temp)}°C</span>
            <span>Humidity: {weather.main.humidity}%</span>
            <span>Conditions: {weather.weather[0].description}</span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="crop-form">
        <div className="form-section">
          <h3>Soil Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Soil Texture:</label>
              <select value={soilTexture} onChange={(e) => setSoilTexture(e.target.value)} >
                <option value="">Select...</option>
                <option value="Clay">Clay</option>
                <option value="Loam">Loam</option>
                <option value="Sand">Sand</option>
                <option value="Silt">Silt</option>
                <option value="Clay Loam">Clay Loam</option>
                <option value="Sandy Loam">Sandy Loam</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Soil pH Level:</label>
              <select value={phLevel} onChange={(e) => setPhLevel(e.target.value)} >
                <option value="">Select...</option>
                <option value="Acidic">Acidic (Below 6.5)</option>
                <option value="Neutral">Neutral (6.5-7.5)</option>
                <option value="Alkaline">Alkaline (Above 7.5)</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Nitrogen Level (mg/kg):</label>
              <input type="number" value={nitrogen} onChange={(e) => setNitrogen(e.target.value)} />
            </div>
            
            <div className="form-group">
              <label>Phosphorus Level (mg/kg):</label>
              <input type="number" value={phosphorus} onChange={(e) => setPhosphorus(e.target.value)} />
            </div>
            
            <div className="form-group">
              <label>Potassium Level (mg/kg):</label>
              <input type="number" value={potassium} onChange={(e) => setPotassium(e.target.value)} />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Climate Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Average Temperature (°C):</label>
              <input type="number" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
            </div>
            
            <div className="form-group">
              <label>Seasonal Rainfall (mm):</label>
              <input type="number" value={rainfall} onChange={(e) => setRainfall(e.target.value)} />
            </div>
            
            <div className="form-group">
              <label>Humidity Level (%):</label>
              <input type="number" step="1" value={humidity} onChange={(e) => setHumidity(e.target.value)} />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Wind Conditions:</label>
              <select value={windConditions} onChange={(e) => setWindConditions(e.target.value)} >
                <option value="">Select...</option>
                <option value="Calm">Calm</option>
                <option value="Moderate">Moderate</option>
                <option value="Strong">Strong</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Region/Place:</label>
              <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Farming Practices</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Water Source:</label>
              <select value={waterSource} onChange={(e) => setWaterSource(e.target.value)} >
                <option value="">Select...</option>
                <option value="Well">Well</option>
                <option value="River">River</option>
                <option value="Reservoir">Reservoir</option>
                <option value="Rainwater">Rainwater</option>
                <option value="Canal">Canal</option>
                <option value="None">None</option>
              </select>
            </div>
            
            <div className="form-group checkbox-group">
              <label>Irrigation System Available:</label>
              <input
                type="checkbox"
                checked={irrigationSystem}
                onChange={(e) => setIrrigationSystem(e.target.checked)}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Water Usage Limitations:</label>
              <select value={waterUsage} onChange={(e) => setWaterUsage(e.target.value)} >
                <option value="">Select...</option>
                <option value="None">None</option>
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Farming Technology Access:</label>
              <select value={farmingTech} onChange={(e) => setFarmingTech(e.target.value)} >
                <option value="">Select...</option>
                <option value="Mechanized">Mechanized</option>
                <option value="Automated">Automated</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Preferences</h3>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Previously Grown Crops:</label>
              <input type="text" value={prevCrops} onChange={(e) => setPrevCrops(e.target.value)} />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group full-width">
              <label>Crop Preferences:</label>
              <input type="text" value={cropPreferences} onChange={(e) => setCropPreferences(e.target.value)} placeholder="e.g. rice, wheat, vegetables" />
            </div>
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Generating..." : "Get Recommendations"}
        </button>
      </form>

      {/* Display Recommendations */}
      {recommendations && (
        <div className="recommendations-section">
          <h3>Crop Recommendations</h3>
          {recommendations.error ? (
            <p className="error-message">{recommendations.error}</p>
          ) : (
            <div className="recommendations-grid">
              {recommendations.map((recommendation, index) => (
                <div 
                  key={index} 
                  className="recommendation-card"
                  onClick={() => handleCropSelect(recommendation)}
                >
                  {cropImages[recommendation.crop] && (
                    <div className="crop-image-container">
                      <UnsplashImage 
                        imageData={cropImages[recommendation.crop]} 
                        size="small"
                      />
                    </div>
                  )}
                  <h4>{recommendation.crop}</h4>
                  <p><strong>Suitability:</strong> {recommendation.suitability}</p>
                  <p><strong>Expected Yield:</strong> {recommendation.expectedYield}</p>
                  <div className="card-footer">
                    <button className="view-details-btn">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Display Selected Crop Details */}
      {selectedCrop && (
        <div className="crop-details-modal">
          <div className="crop-details-content">
            <button className="close-btn" onClick={() => setSelectedCrop(null)}>×</button>
            <h3>{selectedCrop.name}</h3>
            
            {cropImages[selectedCrop.name] && (
              <div className="crop-detail-image">
                <UnsplashImage 
                  imageData={cropImages[selectedCrop.name]} 
                  size="regular"
                />
              </div>
            )}
            
            <div className="crop-timing">
              <div className="timing-item">
                <h4>Ideal Sowing Time</h4>
                <p>{selectedCrop.sowingTime}</p>
              </div>
              <div className="timing-item">
                <h4>Ideal Harvesting Time</h4>
                <p>{selectedCrop.harvestingTime}</p>
              </div>
            </div>
            
            <div className="crop-requirements">
              <h4>Growing Requirements</h4>
              {selectedCrop.idealTemperature && (
                <p><strong>Ideal Temperature:</strong> {selectedCrop.idealTemperature}</p>
              )}
              {selectedCrop.waterRequirements && (
                <p><strong>Water Requirements:</strong> {selectedCrop.waterRequirements}</p>
              )}
              {selectedCrop.soilTypes && (
                <p><strong>Suitable Soil Types:</strong> {selectedCrop.soilTypes}</p>
              )}
            </div>
            
            {selectedCrop.description && (
              <div className="crop-description">
                <h4>Description</h4>
                <p>{selectedCrop.description}</p>
              </div>
            )}
            
            {selectedCrop.tipsForOptimalGrowth && (
              <div className="crop-tips">
                <h4>Growing Tips</h4>
                <p>{selectedCrop.tipsForOptimalGrowth}</p>
              </div>
            )}
            
            {selectedCrop.environmentalConsiderations && (
              <div className="environmental-considerations">
                <h4>Environmental Considerations</h4>
                <p>{selectedCrop.environmentalConsiderations}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CropRecommendation;