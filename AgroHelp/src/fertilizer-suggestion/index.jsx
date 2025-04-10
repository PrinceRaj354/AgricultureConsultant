import React, { useState, useEffect } from 'react';
import './fertilizer.css';
import { chatSession } from '../service/AIModal.jsx';
import cropData from '../utils/cropData';
import { useWeather } from '../context/WeatherContext';
import { fetchUnsplashImage } from '../utils/unsplashAPI';
import UnsplashImage from '../components/UnsplashImage';

function FertilizerRecommendation() {
  const [cropType, setCropType] = useState('');
  const [growthStage, setGrowthStage] = useState('');
  const [soilTexture, setSoilTexture] = useState('');
  const [phLevel, setPhLevel] = useState('');
  const [nitrogen, setNitrogen] = useState('');
  const [phosphorus, setPhosphorus] = useState('');
  const [potassium, setPotassium] = useState('');
  const [moisture, setMoisture] = useState('');
  const [organicMatter, setOrganicMatter] = useState('');
  const [region, setRegion] = useState('');
  const [purpose, setPurpose] = useState('');
  const [fertilizerPreference, setFertilizerPreference] = useState('');
  const [budget, setBudget] = useState('');
  const [prevFertilizers, setPrevFertilizers] = useState([]);
  const [fertilizerFeedback, setFertilizerFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [selectedCropInfo, setSelectedCropInfo] = useState(null);
  const [error, setError] = useState(null);
  const [cropImage, setCropImage] = useState(null);
  const [fertilizerImages, setFertilizerImages] = useState({});
  const [loadingImages, setLoadingImages] = useState(false);
  
  // Use shared weather context
  const { weather } = useWeather();

  // Update crop info when crop type changes
  useEffect(() => {
    const updateCropInfo = async () => {
      if (cropType) {
        // Find crop info in the crop data
        const cropInfo = Object.entries(cropData).find(
          ([key]) => key.toLowerCase() === cropType.toLowerCase()
        );
        
        if (cropInfo) {
          setSelectedCropInfo({
            name: cropInfo[0],
            ...cropInfo[1]
          });
          
          // Fetch image for the crop
          try {
            setLoadingImages(true);
            const images = await fetchUnsplashImage(cropType, 1);
            if (images.length > 0) {
              setCropImage(images[0]);
            }
          } catch (error) {
            console.error('Error fetching crop image:', error);
          } finally {
            setLoadingImages(false);
          }
        } else {
          setSelectedCropInfo(null);
          setCropImage(null);
        }
      } else {
        setSelectedCropInfo(null);
        setCropImage(null);
      }
    };
    
    updateCropInfo();
  }, [cropType]);

  // Fetch fertilizer images when recommendations are available
  useEffect(() => {
    const fetchFertilizerImages = async () => {
      if (!recommendations || !recommendations.fertilizers || recommendations.fertilizers.length === 0) {
        return;
      }
      
      setLoadingImages(true);
      const newFertilizerImages = { ...fertilizerImages };
      
      // Only fetch images for fertilizers we don't already have
      const fertilizersToFetch = recommendations.fertilizers.filter(
        fert => !newFertilizerImages[fert] && typeof fert === 'string' && fert.trim() !== ''
      );
      
      if (fertilizersToFetch.length === 0) {
        setLoadingImages(false);
        return;
      }
      
      try {
        // Fetch images in parallel with 'fertilizer' keyword added
        const imagePromises = fertilizersToFetch.map(fertilizer => 
          fetchUnsplashImage(`${fertilizer} fertilizer`, 1)
            .then(images => {
              if (images.length > 0) {
                newFertilizerImages[fertilizer] = images[0];
              }
              return null;
            })
        );
        
        await Promise.all(imagePromises);
        setFertilizerImages(newFertilizerImages);
      } catch (error) {
        console.error('Error fetching fertilizer images:', error);
      } finally {
        setLoadingImages(false);
      }
    };
    
    fetchFertilizerImages();
  }, [recommendations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRecommendations(null); // Reset recommendations for a new submission
    setError(null); // Clear previous errors

    const aiPrompt = `Based on the farmer's input:
      - Crop Type: ${cropType || 'Not specified'}
      - Growth Stage: ${growthStage}
      - Soil Texture: ${soilTexture}
      - Soil pH Level: ${phLevel}
      - Nitrogen Content: ${nitrogen} mg/kg
      - Phosphorus Content: ${phosphorus} mg/kg
      - Potassium Content: ${potassium} mg/kg
      - Soil Moisture Level: ${moisture}%
      - Organic Matter Content: ${organicMatter}%
      - Region/Place: ${region || 'Not specified'}
      - Purpose of Fertilizer Use: ${purpose}
      - Fertilizer Preference: ${fertilizerPreference}
      - Budget for Fertilizer: ${budget || 'No budget specified'}
      - Previously Used Fertilizers: ${prevFertilizers.join(', ') || 'None specified'}
      - Fertilizer Performance Feedback: ${fertilizerFeedback || 'No feedback provided'}
  
      Focus on sustainable farming practices and provide:
      1. Recommended fertilizers.
      2. Application methods and amounts.
      3. Environmental benefits and precautions.
      4. Expected crop improvements.
      5. Tips for sustainable use.
      
      keep json keys with name : Recommended_Fertilizers, Application_Methods_and_Amounts, Environmental_Benefits, Precautions, Expected_Crop_Improvements, Tips_for_Sustainable_Use`;

    try {
      const result = await chatSession.sendMessage(aiPrompt);
      const data = await result.response.text();
      
      // Parse the AI response
      try {
        const parsedData = JSON.parse(data);
        console.log(parsedData);
        setRecommendations({
          fertilizers: parsedData['Recommended_Fertilizers'] || [],
          applicationMethods: parsedData['Application_Methods_and_Amounts'] || {},
          environmentalBenefits: parsedData['Environmental_Benefits'] || [],
          precautions: parsedData['Precautions'] || [],
          cropImprovements: parsedData['Expected_Crop_Improvements'] || [],
          sustainableTips: parsedData['Tips_for_Sustainable_Use'] || [],
        });
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        // Fallback for non-JSON responses
        setRecommendations({ 
          error: 'The system returned an invalid response format.',
          rawResponse: data 
        });
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Unable to generate recommendations. Please try again later.');
      // Set default recommendations to avoid blank screen
      setRecommendations({
        fertilizers: ['Unable to fetch fertilizer recommendations.'],
        applicationMethods: { 'General': 'Please try again later.' },
        environmentalBenefits: ['Data unavailable.'],
        precautions: ['Data unavailable.'],
        cropImprovements: ['Data unavailable.'],
        sustainableTips: ['Data unavailable.'],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCropSuggestion = () => {
    // Show a list of common crops for selection
    const commonCrops = Object.keys(cropData).slice(0, 10);
    return (
      <div className="crop-suggestions">
        <p>Select from common crops:</p>
        <div className="suggestion-tags">
          {commonCrops.map((crop, index) => (
            <span 
              key={index} 
              className="crop-tag" 
              onClick={() => setCropType(crop)}
            >
              {crop}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container fertilizer-container">
      <h2 className="section-title">Fertilizer Recommendation</h2>
      
      {weather && (
        <div className="weather-data-info">
          <p>Current weather at your location:</p>
          <div className="weather-details-small">
            <span>Temperature: {Math.round(weather.main.temp)}°C</span>
            <span>Humidity: {weather.main.humidity}%</span>
            <span>Conditions: {weather.weather[0].description}</span>
          </div>
        </div>
      )}
      
      {/* Display error message if any */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="fertilizer-form">
        {/* Crop Details Section */}
        <div className="form-section">
          <h3>Crop Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Crop Type:</label>
              <input 
                type="text" 
                value={cropType} 
                onChange={(e) => setCropType(e.target.value)}
                placeholder="e.g. Rice, Wheat, Tomato" 
              />
              {!cropType && handleCropSuggestion()}
            </div>
            
            <div className="form-group">
              <label>Growth Stage:</label>
              <select value={growthStage} onChange={(e) => setGrowthStage(e.target.value)}>
                <option value="">Select...</option>
                <option value="Germination">Germination</option>
                <option value="Vegetative">Vegetative</option>
                <option value="Flowering">Flowering</option>
                <option value="Fruiting">Fruiting</option>
                <option value="Harvesting">Harvesting</option>
              </select>
            </div>
          </div>
          
          {selectedCropInfo && (
            <div className="selected-crop-info">
              <div className="crop-info-header">
                <h4>About {selectedCropInfo.name}</h4>
                {cropImage && (
                  <div className="crop-thumbnail">
                    <UnsplashImage 
                      imageData={cropImage} 
                      size="thumb"
                      className="circular"
                    />
                  </div>
                )}
              </div>
              <div className="crop-info-grid">
                <div className="info-item">
                  <strong>Sowing Time:</strong> 
                  <span>{selectedCropInfo.sowingTime}</span>
                </div>
                <div className="info-item">
                  <strong>Harvesting Time:</strong> 
                  <span>{selectedCropInfo.harvestingTime}</span>
                </div>
                <div className="info-item">
                  <strong>Ideal Temperature:</strong> 
                  <span>{selectedCropInfo.idealTemperature}</span>
                </div>
                <div className="info-item">
                  <strong>Water Requirements:</strong> 
                  <span>{selectedCropInfo.waterRequirements}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Soil and Environment Section */}
        <div className="form-section">
          <h3>Soil Characteristics</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Soil Texture:</label>
              <select value={soilTexture} onChange={(e) => setSoilTexture(e.target.value)}>
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
              <select value={phLevel} onChange={(e) => setPhLevel(e.target.value)}>
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
          
          <div className="form-row">
            <div className="form-group">
              <label>Soil Moisture Level (%):</label>
              <input type="number" value={moisture} onChange={(e) => setMoisture(e.target.value)} />
            </div>
            
            <div className="form-group">
              <label>Organic Matter Content (%):</label>
              <input type="number" value={organicMatter} onChange={(e) => setOrganicMatter(e.target.value)} />
            </div>
            
            <div className="form-group">
              <label>Region/Location:</label>
              <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. North India, Karnataka" />
            </div>
          </div>
        </div>
        
        {/* Fertilizer Requirements */}
        <div className="form-section">
          <h3>Fertilizer Preferences</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Purpose of Fertilizer Use:</label>
              <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                <option value="">Select...</option>
                <option value="Yield Improvement">Yield Improvement</option>
                <option value="Soil Health">Soil Health Improvement</option>
                <option value="Deficiency Correction">Nutrient Deficiency Correction</option>
                <option value="Organic Production">Organic Production</option>
                <option value="General Maintenance">General Maintenance</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Fertilizer Preference:</label>
              <select value={fertilizerPreference} onChange={(e) => setFertilizerPreference(e.target.value)}>
                <option value="">Select...</option>
                <option value="Chemical">Chemical/Synthetic</option>
                <option value="Organic">Organic/Natural</option>
                <option value="Mixed">Balanced Approach</option>
                <option value="No Preference">No Preference</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Budget for Fertilizer (Optional):</label>
              <input type="text" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. Limited, Medium, High" />
            </div>
          </div>
        </div>
        
        {/* Previous Experience */}
        <div className="form-section">
          <h3>Previous Experience (Optional)</h3>
          <div className="form-group">
            <label>Previously Used Fertilizers:</label>
            <input 
              type="text" 
              value={prevFertilizers.join(', ')} 
              onChange={(e) => setPrevFertilizers(e.target.value.split(',').map(item => item.trim()))} 
              placeholder="e.g. Urea, DAP, Compost" 
            />
          </div>
          
          <div className="form-group">
            <label>Feedback on Previous Fertilizers:</label>
            <textarea 
              value={fertilizerFeedback} 
              onChange={(e) => setFertilizerFeedback(e.target.value)}
              placeholder="Describe your experience with previous fertilizers"
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <div className="form-submit">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Generating Recommendations...' : 'Get Fertilizer Recommendations'}
            {loading && <i className="fas fa-spinner fa-spin"></i>}
          </button>
        </div>
      </form>
      
      {/* Results Section */}
      {recommendations && !loading && (
        <div className="recommendations-section">
          <h2>Your Fertilizer Recommendations</h2>
          
          {recommendations.error ? (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              <p>{recommendations.error}</p>
            </div>
          ) : (
            <>
              <div className="recommendation-card">
                <h3>Recommended Fertilizers</h3>
                <div className="fertilizer-grid">
                  {Array.isArray(recommendations.fertilizers) ? 
                    recommendations.fertilizers.map((fertilizer, index) => (
                      <div className="fertilizer-item" key={index}>
                        {fertilizerImages[fertilizer] && (
                          <div className="fertilizer-image">
                            <UnsplashImage 
                              imageData={fertilizerImages[fertilizer]} 
                              size="small"
                            />
                          </div>
                        )}
                        <div className="fertilizer-name">{fertilizer}</div>
                      </div>
                    )) : (
                      <div className="fertilizer-item">
                        <div className="fertilizer-name">No specific fertilizer recommendations available.</div>
                      </div>
                    )
                  }
                </div>
              </div>
              
              <div className="recommendation-card">
                <h3>Application Methods</h3>
                {Object.keys(recommendations.applicationMethods).length > 0 ? (
                  <div className="application-methods">
                    {Object.entries(recommendations.applicationMethods).map(([key, value], index) => (
                      <div className="method-item" key={index}>
                        <h4>{key}</h4>
                        <p>{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No application methods specified.</p>
                )}
              </div>
              
              <div className="recommendation-row">
                <div className="recommendation-card">
                  <h3>Environmental Benefits</h3>
                  <ul>
                    {Array.isArray(recommendations.environmentalBenefits) && recommendations.environmentalBenefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="recommendation-card">
                  <h3>Precautions</h3>
                  <ul className="precautions-list">
                    {Array.isArray(recommendations.precautions) && recommendations.precautions.map((precaution, index) => (
                      <li key={index}>{precaution}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="recommendation-row">
                <div className="recommendation-card">
                  <h3>Expected Crop Improvements</h3>
                  <ul>
                    {Array.isArray(recommendations.cropImprovements) && recommendations.cropImprovements.map((improvement, index) => (
                      <li key={index}>{improvement}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="recommendation-card">
                  <h3>Sustainable Use Tips</h3>
                  <ul>
                    {Array.isArray(recommendations.sustainableTips) && recommendations.sustainableTips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default FertilizerRecommendation;
