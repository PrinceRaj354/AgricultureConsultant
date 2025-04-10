import React from 'react';
import '../../css/WeatherPage.css';
import { useWeather } from '../../context/WeatherContext';

const WeatherPage = () => {
  // Use the shared weather context
  const { weather, forecast, loading, error } = useWeather();

  // Function to format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Function to group forecast by day
  const groupForecastByDay = (forecastList) => {
    if (!forecastList || !Array.isArray(forecastList) || forecastList.length === 0) return [];
    
    const groupedForecast = {};
    
    forecastList.forEach(item => {
      if (!item || !item.dt || !item.weather || !item.main) return;
      
      const date = formatDate(item.dt);
      
      if (!groupedForecast[date]) {
        groupedForecast[date] = {
          date,
          icon: item.weather[0]?.icon || '03d',
          description: item.weather[0]?.description || 'forecast',
          temp_min: item.main.temp_min || (item.main.temp - 2),
          temp_max: item.main.temp_max || (item.main.temp + 2)
        };
      } else {
        // Update min/max temps if needed
        if (item.main.temp_min && item.main.temp_min < groupedForecast[date].temp_min) {
          groupedForecast[date].temp_min = item.main.temp_min;
        }
        if (item.main.temp_max && item.main.temp_max > groupedForecast[date].temp_max) {
          groupedForecast[date].temp_max = item.main.temp_max;
        }
      }
    });
    
    return Object.values(groupedForecast).slice(0, 5); // Limit to 5 days
  };

  if (loading) {
    return (
      <div className="weather-page">
        <div className="weather-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="weather-page">
        <div className="weather-error">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="weather-page">
        <div className="weather-error">
          <i className="fas fa-exclamation-circle"></i>
          <p>Weather data unavailable. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Group forecast data by day
  const dailyForecast = groupForecastByDay(forecast);

  return (
    <div className="weather-page">
      {/* Display error message if any */}
      {error && (
        <div className="weather-notification">
          <i className="fas fa-info-circle"></i>
          <p>{error}</p>
        </div>
      )}
      
      {/* Weather data was successfully loaded */}
      <div className="current-weather">
        <h2>{weather.name}, {weather.sys?.country || 'Unknown'}</h2>
        
        <div className="weather-main">
          <div className="weather-icon">
            <img 
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`} 
              alt={weather.weather[0].description} 
            />
          </div>
          
          <div className="weather-info">
            <div className="temperature">
              {Math.round(weather.main.temp)}°C
            </div>
            <div className="description">
              {weather.weather[0].description}
            </div>
          </div>
        </div>
        
        <div className="weather-details">
          <div className="detail">
            <span className="label">Feels Like</span>
            <span className="value">{Math.round(weather.main.feels_like)}°C</span>
          </div>
          <div className="detail">
            <span className="label">Humidity</span>
            <span className="value">{weather.main.humidity}%</span>
          </div>
          <div className="detail">
            <span className="label">Wind</span>
            <span className="value">{Math.round(weather.wind.speed * 3.6)} km/h</span>
          </div>
          <div className="detail">
            <span className="label">Pressure</span>
            <span className="value">{weather.main.pressure} hPa</span>
          </div>
        </div>
      </div>
      
      {/* Display forecast if available */}
      {dailyForecast.length > 0 && (
        <div className="forecast">
          <h3>5-Day Forecast</h3>
          <div className="forecast-items">
            {dailyForecast.map((day, index) => (
              <div className="forecast-item" key={index}>
                <div className="forecast-date">{day.date}</div>
                <div className="forecast-icon">
                  <img 
                    src={`https://openweathermap.org/img/wn/${day.icon}.png`} 
                    alt={day.description} 
                  />
                </div>
                <div className="forecast-temp">
                  <span className="max">{Math.round(day.temp_max)}°</span>
                  <span className="min">{Math.round(day.temp_min)}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Farming tips based on weather */}
      <div className="farming-tips">
        <h3>Weather-based Farming Tips</h3>
        <div className="tips-container">
          {weather.main.temp > 30 ? (
            <div className="tip">
              <i className="fas fa-thermometer-full"></i>
              <div>
                <h4>High Temperature Alert</h4>
                <p>Increase irrigation frequency. Consider adding shade for sensitive crops.</p>
              </div>
            </div>
          ) : weather.main.temp < 15 ? (
            <div className="tip">
              <i className="fas fa-thermometer-empty"></i>
              <div>
                <h4>Cool Temperature</h4>
                <p>Monitor frost-sensitive crops. Consider delaying planting of warm-season crops.</p>
              </div>
            </div>
          ) : (
            <div className="tip">
              <i className="fas fa-thermometer-half"></i>
              <div>
                <h4>Optimal Growing Conditions</h4>
                <p>Ideal temperatures for many crops. Good time for planting and fertilizing.</p>
              </div>
            </div>
          )}

          {weather.main.humidity > 80 ? (
            <div className="tip">
              <i className="fas fa-tint"></i>
              <div>
                <h4>High Humidity Alert</h4>
                <p>Monitor crops for fungal diseases. Avoid overhead irrigation.</p>
              </div>
            </div>
          ) : weather.main.humidity < 30 ? (
            <div className="tip">
              <i className="fas fa-sun"></i>
              <div>
                <h4>Low Humidity Alert</h4>
                <p>Increase irrigation. Consider mulching to preserve soil moisture.</p>
              </div>
            </div>
          ) : null}

          {weather.wind.speed > 8 ? (
            <div className="tip">
              <i className="fas fa-wind"></i>
              <div>
                <h4>High Wind Alert</h4>
                <p>Delay spraying operations. Secure structures and provide wind breaks.</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default WeatherPage; 