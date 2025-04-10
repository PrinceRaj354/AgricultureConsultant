import React, { createContext, useState, useEffect, useContext } from 'react';

// Create Weather Context
export const WeatherContext = createContext();

// Custom hook to use the weather context
export const useWeather = () => useContext(WeatherContext);

export const WeatherProvider = ({ children }) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [error, setError] = useState(null);

  // Set fallback weather data
  const setFallbackData = () => {
    // Fallback weather data
    const fallbackWeather = {
      main: { 
        temp: 28, 
        humidity: 65, 
        pressure: 1012,
        feels_like: 30
      },
      weather: [{ 
        icon: '04d', 
        description: 'overcast clouds', 
        main: 'Clouds' 
      }],
      name: 'Default Location',
      sys: { country: 'IN' },
      wind: { speed: 3.5 },
      coord: { lat: 12.9716, lon: 77.5946 }
    };
    
    setWeather(fallbackWeather);
    setLocation('Default Location');
    
    // Set fallback forecast
    setFallbackForecast();
    
    // Clear any previous errors
    setError(null);
    setLoading(false);
  };
  
  // Set fallback forecast data
  const setFallbackForecast = () => {
    const currentDate = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    
    // Fallback forecast data
    const fallbackForecast = [];
    for (let i = 0; i < 5; i++) {
      fallbackForecast.push({
        dt: currentDate + (i * 86400), // Add days (86400 seconds)
        main: { 
          temp: 27 + Math.floor(Math.random() * 5),
          temp_min: 25 + Math.floor(Math.random() * 3),
          temp_max: 30 + Math.floor(Math.random() * 3),
          humidity: 60 + Math.floor(Math.random() * 10)
        },
        weather: [{ 
          main: 'Clouds', 
          description: 'scattered clouds', 
          icon: '03d' 
        }]
      });
    }
    
    setForecast(fallbackForecast);
  };

  // Fetch weather data based on coordinates
  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      setLoading(true);
      setError(null);
      const API_KEY = '11c43cf0e3d7548c39f51012d0e46acb';
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Weather data unavailable');
      }
      
      const data = await response.json();
      console.log('Weather data fetched by coordinates:', data);
      setWeather(data);
      setLocation(data.name);
      
      // Fetch forecast data
      await fetchForecast(lat, lon);
      
      setLoading(false);
    } catch (err) {
      console.error("Weather API error (coords):", err);
      setError("Weather data unavailable. Using default data.");
      setFallbackData();
    }
  };
  
  // Fetch forecast data
  const fetchForecast = async (lat, lon) => {
    try {
      const API_KEY = '11c43cf0e3d7548c39f51012d0e46acb';
      
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      
      if (!forecastResponse.ok) {
        throw new Error('Forecast data unavailable');
      }
      
      const forecastData = await forecastResponse.json();
      console.log('Forecast data fetched:', forecastData);
      
      // Process forecast data to get daily forecasts
      setForecast(forecastData.list);
    } catch (err) {
      console.error("Forecast API error:", err);
      setFallbackForecast();
    }
  };
  
  // Fetch weather data based on city name
  const fetchWeatherByCity = async (cityName) => {
    try {
      setLoading(true);
      setError(null);
      const API_KEY = '11c43cf0e3d7548c39f51012d0e46acb';
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Location not found');
      }
      
      const data = await response.json();
      console.log('Weather data fetched by city:', data);
      setWeather(data);
      setLocation(data.name);
      
      // Use coordinates from weather data to fetch forecast
      if (data.coord) {
        await fetchForecast(data.coord.lat, data.coord.lon);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Weather API error (city):", err);
      setError("Location not found. Using default data.");
      setFallbackData();
    }
  };
  
  // Initialize weather data
  useEffect(() => {
    try {
      // Always set fallback data first so we have something to display while loading
      setFallbackData();
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log(`Getting weather for coords: ${latitude}, ${longitude}`);
          fetchWeatherByCoords(latitude, longitude);
        },
        (err) => {
          console.error("Geolocation error:", err);
          fetchWeatherByCity('Bangalore'); // Fallback if geolocation fails
        },
        { 
          timeout: 10000, 
          enableHighAccuracy: true,
          maximumAge: 0 // Force fresh location
        }
      );
      
      // Refresh weather data every 30 minutes
      const interval = setInterval(() => {
        try {
          if (weather && weather.coord) {
            fetchWeatherByCoords(weather.coord.lat, weather.coord.lon);
          } else {
            fetchWeatherByCity('Bangalore');
          }
        } catch (error) {
          console.error("Weather refresh error:", error);
          setFallbackData();
        }
      }, 30 * 60 * 1000);
      
      return () => clearInterval(interval);
    } catch (error) {
      console.error("Fatal weather error:", error);
      setFallbackData();
    }
  }, []);
  
  return (
    <WeatherContext.Provider 
      value={{ 
        weather, 
        forecast, 
        loading, 
        location, 
        error, 
        fetchWeatherByCity, 
        fetchWeatherByCoords 
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export default WeatherProvider; 