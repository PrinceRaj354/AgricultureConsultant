import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { RouterProvider, createBrowserRouter, Outlet } from 'react-router-dom';
import { LanguageProvider } from './languages/LanguageContext';
import CropRecommendation from './crop-recomment/index.jsx';
import FertilizerRecommendation from './fertilizer-suggestion/index.jsx';
import PlantDiseaseDetector from './plant-disease-detection/index.jsx';
import Viewtrip from './view-trip/[tripId]/index.jsx';
import Layout from './components/custom/Layout.jsx';
import WeatherPage from './components/custom/WeatherPage.jsx';
import Chatbot from './components/custom/Chatbot.jsx';
import WeatherProvider from './context/WeatherContext.jsx';
// Import FontAwesome
import '@fortawesome/fontawesome-free/css/all.min.css';

// Function to load Google Translate script
const loadGoogleTranslateScript = () => {
  const script = document.createElement('script');
  script.src = 'https://translate.google.com/translate_a/element.js?cb=loadgoogleTranslate';
  script.async = true;
  document.body.appendChild(script);
  
  window.loadgoogleTranslate = function () {
    new window.google.translate.TranslateElement(
      {
        pageLanguage: 'en', // Default language
        includedLanguages: 'kn,en,hi,ta,te,ml,fr,es,de,ru,zh-CN,ja,ar', // More languages added
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
      },
      'google_element'
    );
    
    // Close the translate dropdown after selection
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          // Check if the added node is the Google Translate dropdown
          if (document.querySelector('.goog-te-menu-frame')) {
            const dropdown = document.querySelector('.goog-te-menu-frame');
            
            // Add position styles
            if (dropdown) {
              dropdown.style.position = 'fixed';
              dropdown.style.top = '60px'; // Adjusted for smaller navbar
              dropdown.style.right = '10px';
              dropdown.style.zIndex = '1050';
              dropdown.style.maxHeight = '400px';
              dropdown.style.overflowY = 'auto';
              
              // Create a transparent overlay to detect clicks outside
              const overlay = document.createElement('div');
              overlay.id = 'translate-overlay';
              overlay.style.position = 'fixed';
              overlay.style.top = '0';
              overlay.style.left = '0';
              overlay.style.width = '100%';
              overlay.style.height = '100%';
              overlay.style.zIndex = '1040';
              document.body.appendChild(overlay);
              
              // Close dropdown when clicking outside
              overlay.addEventListener('click', () => {
                dropdown.style.visibility = 'hidden';
                overlay.remove();
              });
            }
          }
        }
      });
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Additional event listener for dropdown items
    document.addEventListener('click', (event) => {
      // Check if a language option was clicked
      if (event.target.closest('.goog-te-menu2-item')) {
        setTimeout(() => {
          const dropdown = document.querySelector('.goog-te-menu-frame');
          const overlay = document.getElementById('translate-overlay');
          
          if (dropdown) dropdown.style.visibility = 'hidden';
          if (overlay) overlay.remove();
        }, 100);
      }
    }, true);
  };
};

// Create a root layout
const Root = () => {
  return <Outlet />;
};

// Define routes with Layout
const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        path: '/',
        element: <App />
      },
      {
        path: '/crop-recommendation',
        element: <Layout><CropRecommendation /></Layout>
      },
      {
        path: '/fertilizer-suggestion',
        element: <Layout><FertilizerRecommendation /></Layout>
      },
      {
        path: '/disease-detection',
        element: <Layout><PlantDiseaseDetector /></Layout>
      },
      {
        path: '/plant-disease-detection',
        element: <Layout><PlantDiseaseDetector /></Layout>
      },
      {
        path: '/weather',
        element: <Layout><WeatherPage /></Layout>
      },
      {
        path: '/chatbot',
        element: <Layout>
          <div className="page-container">
            <h2 className="section-title">Agriculture Assistant</h2>
            <p className="section-description">
              Get real-time advice and answers to your farming questions with our AI assistant.
            </p>
            <Chatbot />
          </div>
        </Layout>
      },
      {
        path: '/view-trip/:tripId',
        element: <Layout><Viewtrip /></Layout>
      }
    ]
  }
]);

const MainApp = () => {
  useEffect(() => {
    loadGoogleTranslateScript();
  }, []); // Runs once when the component mounts

  return (
    <StrictMode>
      <LanguageProvider>
        <WeatherProvider>
          <RouterProvider router={router} />
        </WeatherProvider>
      </LanguageProvider>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')).render(<MainApp />);
