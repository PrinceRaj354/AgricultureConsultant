import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [translatedContent, setTranslatedContent] = useState({});

  const apiKey = 'YOUR_GOOGLE_CLOUD_API_KEY'; // Replace with your actual API key.

  const translateText = async (text, targetLanguage) => {
    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
          q: text,
          target: targetLanguage,
        }
      );
      return response.data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Error translating text:', error);
      return text; // Fallback to original text in case of an error
    }
  };

  const changeLanguage = async (newLanguage) => {
    setLanguage(newLanguage);

    const contentToTranslate = {
      headerTitle: 'Sustainable Farming Advisor',
      heroTitle: 'Empowering Farmers for a Greener Future',
      heroDescription:
        'Discover sustainable farming practices, get crop recommendations, and learn how to maintain plant health.',
      cropButton: 'Get Crop Recommendations',
      fertilizerButton: 'Get Fertilizer Suggestion',
      diseaseButton: 'Detect Plant Diseases',
    };

    const translatedTexts = {};
    for (const key in contentToTranslate) {
      translatedTexts[key] = await translateText(contentToTranslate[key], newLanguage);
    }

    setTranslatedContent(translatedTexts);
  };

  return (
    <LanguageContext.Provider value={{ language, translatedContent, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;