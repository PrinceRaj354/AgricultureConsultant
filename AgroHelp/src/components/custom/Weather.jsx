import React, { useState } from 'react';
import '../../css/Weather.css';
import { useWeather } from '../../context/WeatherContext';

const Weather = () => {
  const [customLocation, setCustomLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  
  // Use shared weather data from context
  const { weather, loading, fetchWeatherByCity } = useWeather();

  // Handle custom location submission
  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (customLocation.trim()) {
      console.log('Searching for location:', customLocation.trim());
      fetchWeatherByCity(customLocation.trim());
      setShowLocationInput(false);
    }
  };
  
  // Toggle location input
  const toggleLocationInput = () => {
    setShowLocationInput(!showLocationInput);
    // Clear the input when hiding it
    if (showLocationInput) {
      setCustomLocation('');
    }
  };
  
  if (loading || !weather) {
    return (
      <div className="weather-widget-small loading">
        <i className="fas fa-spinner fa-spin"></i>
      </div>
    );
  }
  
  return (
    <div className="weather-widget-small">
      <div className="weather-icon-small">
        <img 
          src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`} 
          alt={weather.weather[0].description} 
        />
      </div>
      <div className="weather-info-small">
        <div className="weather-temp-small">
          {Math.round(weather.main.temp)}°C
        </div>
        <div className="weather-location-small">
          {weather.name}
          <button 
            className="location-toggle-small" 
            onClick={toggleLocationInput}
            title="Change location"
          >
            <i className="fas fa-pencil-alt"></i>
          </button>
        </div>
      </div>
      
      {showLocationInput && (
        <div className="location-input-container">
          <form onSubmit={handleLocationSubmit} className="location-form-small">
            <input
              type="text"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="Enter city"
              className="location-input-small"
              autoFocus
            />
            <button type="submit" className="location-button-small">
              <i className="fas fa-search"></i>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Weather; 