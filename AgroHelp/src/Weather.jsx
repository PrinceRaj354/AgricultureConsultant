import React, { useState, useEffect } from 'react';
import '../../css/Weather.css';

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customLocation, setCustomLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [locationMode, setLocationMode] = useState('auto');

  const fetchWeather = (lat, lon, customCityName = null) => {
    setLoading(true);
    setError(null);

    const API_KEY = 'Add Your weather api key';
    let url;

    if (customCityName) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${customCityName}&units=metric&appid=${API_KEY}`;
    } else if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    } else {
      setError('Location data is unavailable.');
      setLoading(false);
      return;
    }

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Weather data not available for this location');
        }
        return response.json();
      })
      .then(data => {
        setWeather(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching weather:', err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (locationMode === 'auto') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeather(position.coords.latitude, position.coords.longitude);
          },
          (err) => {
            console.error('Geolocation error:', err);
            setError('Failed to get your location. Please check your browser settings or enter a city manually.');
            setLoading(false);
          }
        );
      } else {
        setError('Geolocation is not supported by your browser. Please enter a city manually.');
        setLoading(false);
      }
    }

    // Refresh weather data every 30 minutes
    const interval = setInterval(() => {
      if (locationMode === 'auto' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => fetchWeather(position.coords.latitude, position.coords.longitude),
          (err) => console.error('Geolocation error on refresh:', err)
        );
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [locationMode]);

  const handleCustomLocationSubmit = (e) => {
    e.preventDefault();
    if (customLocation.trim()) {
      setLocationMode('custom');
      fetchWeather(null, null, customLocation.trim());
      setShowLocationInput(false);
    }
  };

  const toggleLocationMode = () => {
    if (locationMode === 'auto') {
      setShowLocationInput(!showLocationInput);
      if (!showLocationInput) {
        setCustomLocation('');
      }
    } else {
      setLocationMode('auto');
      setShowLocationInput(false);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => fetchWeather(position.coords.latitude, position.coords.longitude),
          (err) => console.error('Geolocation error on toggle:', err)
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="weather-widget loading">
        <i className="fas fa-spinner fa-spin"></i> Loading weather...
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-widget error">
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="weather-widget">
      <div className="weather-main">
        <div className="weather-icon">
          <img 
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} 
            alt={weather.weather[0].description} 
          />
        </div>
        <div className="weather-temp">
          {Math.round(weather.main.temp)}°C
        </div>
      </div>
      <div className="weather-details">
        <div className="weather-location-container">
          <div className="weather-location">
            <i className="fas fa-map-marker-alt location-icon"></i>
            {weather.name}
            <button 
              className="location-toggle" 
              onClick={toggleLocationMode}
              title={locationMode === 'auto' ? "Enter custom location" : "Use my location"}
            >
              <i className={locationMode === 'auto' ? "fas fa-pencil-alt" : "fas fa-crosshairs"}></i>
            </button>
          </div>
          {showLocationInput && (
            <form className="location-form" onSubmit={handleCustomLocationSubmit}>
              <input 
                type="text" 
                className="location-input"
                value={customLocation} 
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="Enter city name"
              />
              <button type="submit" className="location-button">
                <i className="fas fa-search"></i>
              </button>
            </form>
          )}
        </div>
        <div className="weather-description">
          <i className={`fas ${weather.weather[0].main === 'Rain' ? 'fa-cloud-rain' : 
                           weather.weather[0].main === 'Clouds' ? 'fa-cloud' : 
                           weather.weather[0].main === 'Clear' ? 'fa-sun' : 
                           weather.weather[0].main === 'Snow' ? 'fa-snowflake' : 
                           weather.weather[0].main === 'Thunderstorm' ? 'fa-bolt' : 
                           'fa-cloud'}`}></i>
          {weather.weather[0].description}
        </div>
        <div className="weather-humidity">
          <i className="fas fa-tint"></i>
          Humidity: {weather.main.humidity}%
        </div>
      </div>
    </div>
  );
};

export default Weather;
