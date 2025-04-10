# AgroHelp - Plant Disease Detection

A web application that uses DETR (Detection Transformer) for plant disease detection and provides weather-based recommendations.

## Features

- Plant disease detection using DETR model
- Real-time weather information
- Disease treatment recommendations
- Weather-based care tips
- Support for multiple plant diseases

## Live

- "https://agricutureconsultant.netlify.app/"

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Install Node.js dependencies:
```bash
cd AgroHelp
npm install
```

3. Add API keys in the following files:
   - `AgroHelp/src/context/WeatherContext.jsx` - Add your OpenWeatherMap API key as `OpenWeatherMap_API`
   - `AgroHelp/src/service/AIModal.jsx` - Add your Gemini API key as `Gemini_API`
   - `AgroHelp/src/Weather.jsx` - Add your OpenWeatherMap API key as `OpenWeatherMap_API`

4. Start the backend server:
```bash
python app.py
```

5. Start the frontend development server:
```bash
cd AgroHelp
npm run dev
```

6. Open your browser and navigate to `http://localhost:5173`

## Model Information

The application uses a DETR (Detection Transformer) model for plant disease detection. The model is located in the `Crop_disease_detr` directory and includes:

- `model.safetensors`: The trained model weights
- `config.json`: Model configuration
- `preprocessor_config.json`: Image preprocessing configuration

## API Endpoints

- `POST /predict`: Upload an image for disease detection
- `GET /uploads/<filename>`: Access uploaded images

## Required API Keys

The application requires the following API keys:
1. **OpenWeatherMap API**: Used for weather data in `WeatherContext.jsx` and `Weather.jsx`
   - Sign up at [OpenWeatherMap](https://openweathermap.org/api)
   
2. **Google Gemini API**: Used for AI features in `AIModal.jsx`
   - Get API key from [Google AI Studio](https://ai.google.dev/)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 
