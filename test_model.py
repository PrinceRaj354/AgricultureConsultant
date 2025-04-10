import torch
from transformers import DetrImageProcessor, DetrForObjectDetection
from PIL import Image
import os
import json
import traceback

def test_model():
    print("Testing DETR model...")
    
    # Check if model directory exists
    if not os.path.exists("Crop_disease_detr"):
        print("ERROR: Crop_disease_detr directory not found!")
        return False
    
    # Check if model files exist
    required_files = ["model.safetensors", "config.json", "preprocessor_config.json"]
    for file in required_files:
        if not os.path.exists(os.path.join("Crop_disease_detr", file)):
            print(f"ERROR: {file} not found in Crop_disease_detr directory!")
            return False
    
    # Load model and processor
    try:
        print("Loading DETR model and processor...")
        processor = DetrImageProcessor.from_pretrained("Crop_disease_detr")
        model = DetrForObjectDetection.from_pretrained("Crop_disease_detr")
        model.eval()
        print("Model loaded successfully!")
    except Exception as e:
        print(f"ERROR loading model: {str(e)}")
        print(traceback.format_exc())
        return False
    
    # Load class labels
    try:
        print("Loading class labels...")
        with open("Crop_disease_detr/config.json", "r") as f:
            config = json.load(f)
            id2label = config["id2label"]
            label2id = config["label2id"]
        print(f"Loaded {len(id2label)} class labels")
    except Exception as e:
        print(f"ERROR loading class labels: {str(e)}")
        print(traceback.format_exc())
        return False
    
    # Check if uploads directory exists
    if not os.path.exists("uploads"):
        os.makedirs("uploads")
        print("Created uploads directory")
    
    # Check if there are any test images in uploads
    test_images = [f for f in os.listdir("uploads") if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
    
    if not test_images:
        print("No test images found in uploads directory. Please add some images to test.")
        return True
    
    # Test with the first image
    test_image = os.path.join("uploads", test_images[0])
    print(f"Testing with image: {test_image}")
    
    try:
        # Load and preprocess image
        image = Image.open(test_image).convert("RGB")
        print(f"Image size: {image.size}, mode: {image.mode}")
        
        inputs = processor(images=image, return_tensors="pt")
        print(f"Processed inputs shape: {inputs['pixel_values'].shape}")
        
        # Run inference
        with torch.no_grad():
            outputs = model(**inputs)
        
        # Post-process predictions
        probas = outputs.logits.softmax(-1)[0, :, :]
        
        # Get top predictions
        top_k = 3
        top_probs, top_indices = torch.topk(probas.max(dim=1)[0], top_k)
        
        # Format predictions
        predictions = []
        for prob, idx in zip(top_probs, top_indices):
            class_id = probas[idx].argmax().item()
            class_name = id2label.get(str(class_id), f"Plant_Disease_{class_id}")
            confidence = prob.item()
            predictions.append({
                'class': class_name,
                'probability': confidence
            })
        
        print("Model test successful!")
        print("Top predictions:")
        for i, pred in enumerate(predictions):
            print(f"{i+1}. {pred['class']}: {pred['probability']:.4f}")
        
        return True
    
    except Exception as e:
        print(f"ERROR during model inference: {str(e)}")
        print(traceback.format_exc())
        return False

if __name__ == "__main__":
    success = test_model()
    if success:
        print("Model test completed successfully!")
    else:
        print("Model test failed!") 