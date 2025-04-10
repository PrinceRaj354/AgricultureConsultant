import React from 'react'
import './App.css'
import Hero from './components/custom/Hero'
import Header from './components/custom/Header'
import Chatbot from './components/custom/Chatbot'
import AboutContact from './components/custom/AboutContact'
import WeatherPage from './components/custom/WeatherPage'
import PlantDiseaseDetector from './plant-disease-detection'

// Import other components as needed
import CropRecommendation from './crop-recomment'
import FertilizerSuggestion from './fertilizer-suggestion'

function App() {
  return (
    <div className="app-container">
      {/* Header with navbar is always visible */}
      <Header />
      
      {/* Features (Hero section) at the top */}
      <Hero />
      
      {/* Chatbot */}
      <div className="chatbot-section">
        <h2 className="section-title">Agriculture Assistant</h2>
        <p className="section-description">
          Get real-time advice and answers to your farming questions with our AI assistant.
        </p>
        <Chatbot />
      </div>
      
      {/* About and Contact */}
      <AboutContact />
    </div>
  )
}

export default App


// import './App.css';
// import Hero from './components/custom/Hero';

// function App() {
//   return (
//     <>
//       <Hero />
//     </>
//   );
// }

// export default App;
