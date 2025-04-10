# AgroHelp - Plant Disease Detection

A web application that uses DETR (Detection Transformer) for plant disease detection and provides weather-based recommendations.

## Features

- Plant disease detection using DETR model
- Real-time weather information
- Disease treatment recommendations
- Weather-based care tips
- Support for multiple plant diseases

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

3. Start the backend server:
```bash
python app.py
```

4. Start the frontend development server:
```bash
cd AgroHelp
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Model Information

The application uses a DETR (Detection Transformer) model for plant disease detection. The model is located in the `Crop_disease_detr` directory and includes:

- `model.safetensors`: The trained model weights
- `config.json`: Model configuration
- `preprocessor_config.json`: Image preprocessing configuration

## API Endpoints

- `POST /predict`: Upload an image for disease detection
- `GET /uploads/<filename>`: Access uploaded images

## Environment Variables

Create a `.env` file in the root directory with:

```
OPENWEATHER_API_KEY=your_api_key_here
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 
