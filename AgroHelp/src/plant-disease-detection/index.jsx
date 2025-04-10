import React, { useState, useEffect } from "react";
import axios from "axios";
import './PlantDiseaseDetector.css'; // Import the CSS file

const PlantDiseaseDetector = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [tips, setTips] = useState([]);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = () => {
    setWeatherLoading(true);
    const API_KEY = '11c43cf0e3d7548c39f51012d0e46acb';
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`Plant Disease: Getting weather for coords: ${latitude}, ${longitude}`);
        
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`)
          .then(response => {
            if (!response.ok) throw new Error('Weather data not available');
            return response.json();
          })
          .then(data => {
            console.log('Weather data fetched successfully:', data);
            setWeather(data);
            setWeatherLoading(false);
          })
          .catch(err => {
            console.error('Error fetching weather by coordinates:', err);
            fetchWeatherByCity('Bangalore');
          });
      },
      (err) => {
        console.error('Geolocation error:', err);
        fetchWeatherByCity('Bangalore');
      },
      { 
        timeout: 10000, 
        enableHighAccuracy: true,
        maximumAge: 0
      }
    );
  };
  
  const fetchWeatherByCity = (cityName) => {
    const API_KEY = '11c43cf0e3d7548c39f51012d0e46acb';
    
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`)
      .then(response => {
        if (!response.ok) throw new Error('City not found');
        return response.json();
      })
      .then(data => {
        setWeather(data);
        setWeatherLoading(false);
      })
      .catch(err => {
        console.error('Error fetching weather by city:', err);
        setWeather({
          main: { temp: 32, humidity: 36 },
          wind: { speed: 3.5 },
          weather: [{ main: 'Clouds', description: 'overcast clouds' }]
        });
        setWeatherLoading(false);
      });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPrediction(null);
      setError(null);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setPrediction(null);
        setError(null);
      } else {
        setError('Please upload an image file.');
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image to analyze.');
      return;
    }
    
    if (selectedFile.size > 8 * 1024 * 1024) {
      setError('Image file is too large (maximum 8MB). Please use a smaller image.');
      return;
    }
    
    const img = new Image();
    img.src = previewUrl;
    
    img.onload = async () => {
      setIsLoading(true);
      setPrediction(null);
      setError(null);
      
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to 224x224 (MobileNet V2 requirement)
        canvas.width = 224;
        canvas.height = 224;
        
        // Fill with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 224, 224);
        
        // Calculate dimensions to maintain aspect ratio
        const scale = Math.min(224 / img.width, 224 / img.height);
        const width = img.width * scale;
        const height = img.height * scale;
        const x = (224 - width) / 2;
        const y = (224 - height) / 2;
        
        // Draw centered image
        ctx.drawImage(img, x, y, width, height);
        
        console.log(`Resized image to 224x224 (original: ${img.width}x${img.height})`);
        
        canvas.toBlob(async (blob) => {
          const optimizedFile = new File([blob], selectedFile.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          
          const formData = new FormData();
          formData.append('image', optimizedFile);
          
          try {
            console.log("Sending image to backend for analysis...");
            const response = await axios.post('http://localhost:5000/predict', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            
            const result = response.data;
            console.log("MobileNet V2 model response:", result);
            
            if (result && result.predicted_class) {
              const diseaseInfo = getDiseaseInfo(result.predicted_class);
              
              const detectedDisease = {
                name: diseaseInfo.name,
                confidence: result.probability,
                description: diseaseInfo.description,
                severity: diseaseInfo.severity,
                treatment: generateTreatment(result.predicted_class),
                topPredictions: result.top_predictions || []
              };
              
              setPrediction(detectedDisease);
              
              if (weather) {
                const weatherBasedTips = generateTips(detectedDisease, weather);
                setTips(weatherBasedTips);
              }
            } else if (result && result.error) {
              console.error("Backend error:", result.error);
              setError(`Analysis error: ${result.error}`);
              
              if (result.top_predictions && result.top_predictions.length > 0) {
                const topDiseaseInfo = getDiseaseInfo(result.top_predictions[0].class);
                
                const lowConfidencePrediction = {
                  name: topDiseaseInfo.name + " (Low Confidence)",
                  confidence: result.top_predictions[0].probability,
                  description: topDiseaseInfo.description,
                  severity: "Unknown - Low Confidence",
                  treatment: "Due to low confidence in the diagnosis, please consult with an agricultural expert before taking action.",
                  topPredictions: result.top_predictions,
                  isLowConfidence: true
                };
                
                setPrediction(lowConfidencePrediction);
              }
            } else {
              setError('Could not identify the plant disease. Please try a clearer image with good lighting.');
            }
          } catch (error) {
            console.error("Error during API call:", error);
            if (error.response) {
              console.error("Error response:", error.response.data);
              setError(`Server error: ${error.response.data.error || 'Unknown error'}`);
            } else if (error.request) {
              console.error("No response received:", error.request);
              setError('No response from server. Please check if the backend is running.');
            } else {
              console.error("Error setting up request:", error.message);
              setError(`Request error: ${error.message}`);
            }
          }
        }, 'image/jpeg', 0.95); // Higher quality JPEG
      } catch (error) {
        console.error('Error during image processing:', error);
        setError(`Image processing error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    img.onerror = () => {
      setError('Invalid image file. Please upload a valid image in JPG, PNG, or WebP format.');
      setIsLoading(false);
    };
  };

  // Generate treatment recommendations based on disease
  const generateTreatment = (diseaseName) => {
    // Extract the disease part
    const parts = diseaseName.split('___');
    const crop = parts[0].replace(/_/g, ' ');
    let disease = parts[1] ? parts[1].replace(/_/g, ' ') : '';
    
    // For healthy plants
    if (disease === 'healthy') {
      return `Your ${crop.toLowerCase()} appears healthy. Continue with regular maintenance, watering, and fertilization as needed.`;
    }
    
    // Treatment recommendations for different diseases
    const treatments = {
      'Apple scab': 'Apply fungicides like captan or myclobutanil. Prune infected branches. Remove fallen leaves. Ensure good air circulation.',
      'Black rot': 'Remove infected fruit and cankers. Apply fungicides (copper-based or captan). Prune affected branches during dormant season.',
      'Cedar apple rust': 'Apply fungicides in early spring. Separate apple trees from cedar trees if possible. Remove galls from cedar trees.',
      'Cercospora leaf spot': 'Apply fungicides. Rotate crops. Remove and destroy infected plant debris. Avoid overhead irrigation.',
      'Powdery mildew': 'Apply sulfur-based fungicides. Increase air circulation around plants. Avoid overhead watering. Remove and destroy infected parts.',
      'Bacterial spot': 'Apply copper-based bactericides. Prune during dry weather. Avoid overhead irrigation. Practice crop rotation.',
      'Early blight': 'Apply fungicides (chlorothalonil or copper-based). Remove and destroy infected leaves. Mulch around plants. Ensure proper spacing.',
      'Late blight': 'Apply fungicides preventatively (chlorothalonil or copper-based). Remove infected plants immediately. Avoid overhead irrigation.',
      'Leaf Mold': 'Improve air circulation. Reduce humidity. Apply fungicides. Remove and destroy infected leaves.',
      'Leaf blight': 'Apply fungicides. Remove infected leaves. Ensure proper spacing for air circulation. Avoid overhead watering.',
      'Septoria leaf spot': 'Apply fungicides. Remove infected leaves. Practice crop rotation. Mulch around plants to prevent soil splash.',
      'Target Spot': 'Apply fungicides. Remove infected leaves. Improve air circulation. Avoid overhead irrigation.',
      'Yellow Leaf Curl Virus': 'Control whiteflies (disease vectors). Remove and destroy infected plants. Use reflective mulches. Plant resistant varieties.'
    };
    
    // Find the matching treatment
    for (const [key, value] of Object.entries(treatments)) {
      if (disease.includes(key)) {
        return value;
      }
    }
    
    // Default treatment if no specific one is found
    return `For this condition affecting ${crop.toLowerCase()}, consult with a local agricultural extension office for specific treatment recommendations.`;
  };

  const generateTips = (disease, weatherData) => {
    const tips = [];
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const weatherCondition = weatherData.weather[0].main.toLowerCase();
    
    // General tips based on disease
    if (disease.name === 'Tomato Late Blight') {
      tips.push('Keep tomato foliage dry to reduce disease spread');
      tips.push('Ensure proper plant spacing for air circulation');
    } else if (disease.name === 'Apple Black Rot') {
      tips.push('Remove nearby wild or abandoned apple trees that may harbor disease');
      tips.push('Thin fruit clusters to prevent disease spread between touching fruits');
    } else if (disease.name === 'Corn Common Rust') {
      tips.push('Consider preventative fungicide applications');
      tips.push('Scout fields regularly for early symptoms');
    }
    
    // Weather specific tips
    if (temp > 25) {
      tips.push('High temperatures detected. Increase watering frequency but avoid wetting foliage');
    } else if (temp < 10) {
      tips.push('Cool temperatures may slow disease progression but protect plants from frost');
    }
    
    if (humidity > 70) {
      tips.push('High humidity conditions favor fungal diseases. Improve air circulation around plants');
    }
    
    if (weatherCondition.includes('rain')) {
      tips.push('Rainy conditions increase disease spread. Apply protective fungicides before rain when possible');
    } else if (weatherCondition.includes('clear') || weatherCondition.includes('sun')) {
      tips.push('Sunny conditions help dry foliage. Take advantage to apply treatments');
    }
    
    return tips;
  };

  const getDiseaseInfo = (diseaseName) => {
    // Extract crop and disease names
    const parts = diseaseName.split('___');
    const crop = parts[0].replace(/_/g, ' ');
    let disease = parts[1] ? parts[1].replace(/_/g, ' ') : '';
    
    // For healthy plants
    if (disease === 'healthy') {
      return {
        name: `Healthy ${crop}`,
        description: `Your ${crop.toLowerCase()} appears to be healthy. Continue with regular care and maintenance.`,
        severity: "None"
      };
    }
    
    // For diseased plants
    const diseaseInfo = {
      'Apple scab': {
        description: 'A fungal disease that causes dark, scabby lesions on leaves and fruit. It can lead to defoliation and reduced fruit quality.',
        severity: 'Moderate to Severe'
      },
      'Black rot': {
        description: 'A fungal disease affecting grapes, causing black circular lesions on leaves and mummification of fruit.',
        severity: 'Severe'
      },
      'Cedar apple rust': {
        description: 'A fungal disease that requires both cedar and apple trees to complete its life cycle. It causes orange spots on leaves and fruit.',
        severity: 'Moderate'
      },
      'Early blight': {
        description: 'A fungal disease causing dark, concentric rings on lower leaves, which eventually yellow and drop. Can affect fruit quality and yield.',
        severity: 'Moderate to Severe'
      },
      'Late blight': {
        description: 'A highly destructive fungal disease that causes dark lesions on leaves and stems, and can lead to rapid plant death under favorable conditions.',
        severity: 'Very Severe'
      },
      'Leaf blight': {
        description: 'A fungal disease causing irregular dark spots that enlarge to form extensive dead areas on leaves.',
        severity: 'Moderate'
      },
      'Powdery mildew': {
        description: 'A fungal disease causing white, powdery patches on leaves, stems, and sometimes fruit. Can reduce photosynthesis and yield.',
        severity: 'Mild to Moderate'
      },
      'Bacterial spot': {
        description: 'A bacterial disease causing small, dark, water-soaked spots on leaves and fruit, which may enlarge and cause tissue collapse.',
        severity: 'Moderate to Severe'
      }
    };
    
    // Find the matching disease
    for (const [key, value] of Object.entries(diseaseInfo)) {
      if (disease.includes(key)) {
        return {
          name: `${crop} - ${key}`,
          description: value.description,
          severity: value.severity
        };
      }
    }
    
    // Default return for unrecognized diseases
    return {
      name: diseaseName.replace(/_/g, ' '),
      description: `This appears to be a condition affecting ${crop.toLowerCase()}. The specific symptoms should be monitored closely.`,
      severity: "Unknown"
    };
  };

  return (
    <div className="disease-detector-container">
      <h2 className="section-title">Plant Disease Detection</h2>
      
      {!weatherLoading && weather && (
        <div className="weather-data-info">
          <h3><i className="fas fa-cloud-sun"></i> Current Weather Conditions</h3>
          <p>
            <i className="fas fa-thermometer-half"></i> Temperature: {Math.round(weather.main.temp)}°C
            &nbsp;&nbsp;|&nbsp;&nbsp;
            <i className="fas fa-tint"></i> Humidity: {weather.main.humidity}%
            &nbsp;&nbsp;|&nbsp;&nbsp;
            <i className="fas fa-wind"></i> Wind: {Math.round(weather.wind.speed)} m/s
          </p>
          <p className="weather-note">
            <i className="fas fa-info-circle"></i> Weather conditions can impact plant diseases and treatment effectiveness
          </p>
        </div>
      )}
      
      <div className="detection-content">
        <div className="upload-section">
          <div className="image-guidelines">
            <h3><i className="fas fa-info-circle"></i> For Best Results:</h3>
            <ul>
              <li>Use clear, well-lit images of affected plant parts</li>
              <li>Focus on the affected area (leaf, stem, fruit)</li>
              <li>Use images with minimal background objects</li>
              <li>Capture multiple angles if possible</li>
            </ul>
          </div>
          
          <div 
            className={`upload-area ${previewUrl ? 'has-image' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Selected plant" className="preview-image" />
            ) : (
              <div className="upload-prompt">
                <i className="fas fa-leaf fa-3x"></i>
                <p>Drag & drop an image here or click to select</p>
                <p className="upload-note">Upload a clear image of the affected plant part</p>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="file-input"
              id="plant-image-upload"
            />
          </div>
          
          <div className="action-buttons">
            <label htmlFor="plant-image-upload" className="upload-button">
              <i className="fas fa-upload"></i> Select Image
            </label>
            <button 
              onClick={handleSubmit} 
              disabled={!selectedFile || isLoading}
              className="analyze-button"
            >
              {isLoading ? (
                <><i className="fas fa-spinner fa-spin"></i> Analyzing...</>
              ) : (
                <><i className="fas fa-search"></i> Analyze Plant</>
              )}
            </button>
          </div>
          
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}
        </div>
        
        <div className="results-section">
          {isLoading ? (
            <div className="loading-overlay">
              <div className="loading-spinner">
                <i className="fas fa-spinner fa-spin fa-3x"></i>
                <p>Analyzing your plant image...</p>
              </div>
            </div>
          ) : prediction ? (
            <div className="prediction-results">
              <h3 className="results-heading">
                <i className="fas fa-diagnoses"></i> Detection Results
                {prediction.isLowConfidence && (
                  <span className="low-confidence-badge">
                    <i className="fas fa-exclamation-triangle"></i> Low Confidence
                  </span>
                )}
              </h3>
              
              <div className="disease-info">
                <div className="disease-name">
                  <span className="label">Detected Disease:</span>
                  <span className="value">{prediction.name}</span>
                  <span className="confidence">
                    {Math.round(prediction.confidence * 100)}% confidence
                  </span>
                </div>
                
                <div className="disease-details">
                  <div className="detail-item">
                    <span className="label"><i className="fas fa-info-circle"></i> Description:</span>
                    <span className="value">{prediction.description}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="label"><i className="fas fa-exclamation-triangle"></i> Severity:</span>
                    <span className={`value severity-${prediction.severity.toLowerCase().replace(/\s+/g, '-')}`}>
                      {prediction.severity}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="label"><i className="fas fa-medkit"></i> Treatment:</span>
                    <span className="value">{prediction.treatment}</span>
                  </div>
                </div>
              </div>
              
              {prediction.topPredictions && prediction.topPredictions.length > 1 && (
                <div className="alternative-predictions">
                  <h4><i className="fas fa-list"></i> Alternative Possibilities</h4>
                  <ul>
                    {prediction.topPredictions.slice(1, 4).map((pred, index) => (
                      <li key={index}>
                        <span className="alt-disease">{pred.class.replace(/___/g, ' - ').replace(/_/g, ' ')}</span>
                        <span className="alt-confidence">{Math.round(pred.probability * 100)}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {tips.length > 0 && (
                <div className="weather-tips">
                  <h4><i className="fas fa-lightbulb"></i> Weather-Based Recommendations</h4>
                  <ul>
                    {tips.map((tip, index) => (
                      <li key={index}><i className="fas fa-check-circle"></i> {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="no-prediction">
              <i className="fas fa-leaf fa-3x"></i>
              <p>Upload and analyze a plant image to detect diseases</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantDiseaseDetector;
