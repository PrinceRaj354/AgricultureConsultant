import axios from 'axios';

export const predictImage = async (formData) => {
  try {
    // Ensure this URL matches your Flask backend endpoint
    const response = await axios.post('http://127.0.0.1:5000/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // This will return the JSON response from Flask
  } catch (error) {
    console.error('Error making prediction:', error);
    throw error;
  }
};
