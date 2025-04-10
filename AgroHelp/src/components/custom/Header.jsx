import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../css/Header.css'; // Assuming you use a CSS file for styling
import { useWeather } from '../../context/WeatherContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  // Get weather data from context
  const { weather, loading } = useWeather();

  // Get temperature to display at top
  const getTemperature = () => {
    if (loading || !weather) return '--';
    return Math.round(weather.main.temp);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="top-bar">
        <div className="temperature-display">
          <i className="fas fa-temperature-high"></i> {getTemperature()}°C
        </div>
        <div className="logo">
          <Link to="/">AgroHelp</Link>
        </div>
        <div id="google_element"></div>
      </div>
      <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
        <button className="menu-toggle" onClick={toggleMenu}>
          <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
        <ul className="nav-list">
          <li className="nav-item">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              <i className="fas fa-home"></i> Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/weather" className={location.pathname === '/weather' ? 'active' : ''}>
              <i className="fas fa-cloud-sun-rain"></i> Weather
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/disease-detection" className={location.pathname === '/disease-detection' ? 'active' : ''}>
              <i className="fas fa-biohazard"></i> Disease Detection
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/crop-recommendation" className={location.pathname === '/crop-recommendation' ? 'active' : ''}>
              <i className="fas fa-seedling"></i> Crop Recommendation
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/fertilizer-suggestion" className={location.pathname === '/fertilizer-suggestion' ? 'active' : ''}>
              <i className="fas fa-flask"></i> Fertilizer Suggestion
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/chatbot" className={location.pathname === '/chatbot' ? 'active' : ''}>
              <i className="fas fa-robot"></i> AI Assistant
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;