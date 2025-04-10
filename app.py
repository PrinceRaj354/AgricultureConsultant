from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import torch
from transformers import MobileNetV2ImageProcessor, MobileNetV2ForImageClassification
from PIL import Image
import os
import json
import traceback

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for React app running at http://localhost:3000
CORS(app)

# Ensure uploads folder exists
if not os.path.exists('uploads'):
    os.makedirs('uploads')

# Load the MobileNet V2 model and processor
try:
    processor = MobileNetV2ImageProcessor.from_pretrained("mobilenet_v2_1.0_224-plant-disease-identification")
    model = MobileNetV2ForImageClassification.from_pretrained("mobilenet_v2_1.0_224-plant-disease-identification")
    model.eval()
    print("MobileNet V2 model loaded successfully")
except Exception as e:
    print(f"Error loading MobileNet V2 model: {str(e)}")
    print(traceback.format_exc())

# Load class labels from config
try:
    with open("mobilenet_v2_1.0_224-plant-disease-identification/config.json", "r") as f:
        config = json.load(f)
        id2label = config["id2label"]
        label2id = config["label2id"]
    print(f"Loaded {len(id2label)} class labels")
except Exception as e:
    print(f"Error loading class labels: {str(e)}")
    print(traceback.format_exc())
    # Provide fallback labels
    id2label = {str(i): f"Plant_Disease_{i}" for i in range(38)}
    label2id = {f"Plant_Disease_{i}": i for i in range(38)}

# Image preprocessing function
def preprocess_image(image_path):
    try:
        image = Image.open(image_path).convert("RGB")
        # Print image details for debugging
        print(f"Image size: {image.size}, mode: {image.mode}")
        
        # Process image according to MobileNet V2 requirements
        inputs = processor(images=image, return_tensors="pt")
        print(f"Processed inputs shape: {inputs['pixel_values'].shape}")
        return inputs
    except Exception as e:
        print(f"Error preprocessing image: {str(e)}")
        print(traceback.format_exc())
        raise

# API endpoint for prediction
@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file uploaded'}), 400

    image_file = request.files['image']
    
    if not image_file.content_type.startswith('image/'):
        return jsonify({'error': 'Invalid file type. Please upload an image.'}), 400

    # Save the uploaded image
    image_path = os.path.join('uploads', image_file.filename)
    image_file.save(image_path)
    print(f"Saved uploaded image to {image_path}")

    try:
        # Preprocess the image
        inputs = preprocess_image(image_path)

        # Predict the class
        with torch.no_grad():
            outputs = model(**inputs)
            
        # Get probabilities
        probs = torch.nn.functional.softmax(outputs.logits, dim=-1)[0]
        
        # Get top predictions
        top_k = 3
        top_probs, top_indices = torch.topk(probs, top_k)
        
        # Format predictions
        predictions = []
        for prob, idx in zip(top_probs, top_indices):
            class_name = id2label[str(idx.item())]
            confidence = prob.item()
            predictions.append({
                'class': class_name,
                'probability': confidence
            })

        # Return prediction with image URL
        return jsonify({
            'predicted_class': predictions[0]['class'],
            'probability': predictions[0]['probability'],
            'top_predictions': predictions,
            'image_url': f'http://localhost:5000/uploads/{image_file.filename}'
        })

    except Exception as e:
        error_msg = f"Error during prediction: {str(e)}"
        print(error_msg)
        print(traceback.format_exc())
        return jsonify({'error': error_msg}), 500

# Route to serve uploaded images
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)

if __name__ == '__main__':
    app.run(debug=True)