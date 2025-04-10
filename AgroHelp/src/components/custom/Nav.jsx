import React from 'react';
import { Link } from 'react-router-dom';
import '../../css/Nav.css';

const Nav = () => {
  return (
    <nav className="main-nav">
      <ul className="nav-links">
        <li className="nav-item">
          <Link to="/crop-recommendation" className="nav-link">
            <i className="fas fa-seedling"></i>
            <span>Crop Recommendation</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/fertilizer-suggestion" className="nav-link">
            <i className="fas fa-flask"></i>
            <span>Fertilizer Suggestion</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/chatbot" className="nav-link">
            <i className="fas fa-robot"></i>
            <span>Chatbot</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/weather" className="nav-link">
            <i className="fas fa-cloud-sun"></i>
            <span>Weather</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/disease-detection" className="nav-link">
            <i className="fas fa-leaf"></i>
            <span>Disease Detection</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Nav; 