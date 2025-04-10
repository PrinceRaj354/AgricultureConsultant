import React, { useState } from 'react';
import './fertilizer.css';
import { chatSession } from '../service/AIModal.jsx';

function FertilizerRecommendation() {
  const [cropType, setCropType] = useState('');
  const [growthStage, setGrowthStage] = useState('');
  const [soilTexture, setSoilTexture] = useState('');
  const [phLevel, setPhLevel] = useState('');
  const [nitrogen, setNitrogen] = useState('');
  const [phosphorus, setPhosphorus] = useState('');
  const [potassium, setPotassium] = useState('');
  const [moisture, setMoisture] = useState('');
  const [organicMatter, setOrganicMatter] = useState('');
  const [region, setRegion] = useState('');
  const [purpose, setPurpose] = useState('');
  const [fertilizerPreference, setFertilizerPreference] = useState('');
  const [budget, setBudget] = useState('');
  const [prevFertilizers, setPrevFertilizers] = useState([]);
  const [fertilizerFeedback, setFertilizerFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRecommendations(null); // Reset recommendations for a new submission

    const aiPrompt = `Based on the farmer's input:
      - Crop Type: ${cropType || 'Not specified'}
      - Growth Stage: ${growthStage}
      - Soil Texture: ${soilTexture}
      - Soil pH Level: ${phLevel}
      - Nitrogen Content: ${nitrogen} mg/kg
      - Phosphorus Content: ${phosphorus} mg/kg
      - Potassium Content: ${potassium} mg/kg
      - Soil Moisture Level: ${moisture}%
      - Organic Matter Content: ${organicMatter}%
      - Region/Place: ${region || 'Not specified'}
      - Purpose of Fertilizer Use: ${purpose}
      - Fertilizer Preference: ${fertilizerPreference}
      - Budget for Fertilizer: ${budget || 'No budget specified'}
      - Previously Used Fertilizers: ${prevFertilizers.join(', ') || 'None specified'}
      - Fertilizer Performance Feedback: ${fertilizerFeedback || 'No feedback provided'}
  
      Focus on sustainable farming practices and provide:
      1. Recommended fertilizers.
      2. Application methods and amounts.
      3. Environmental benefits and precautions.
      4. Expected crop improvements.
      5. Tips for sustainable use.
      
      keep json keys with name : Recommended_Fertilizers, Application_Methods_and_Amounts, Environmental_Benefits, Precautions, Expected_Crop_Improvements, Tips_for_Sustainable_Use`;

    try {
      const result = await chatSession.sendMessage(aiPrompt);
      const data = await result.response.text();

      // Parse the AI response directly into recommendations
      const parsedData = JSON.parse(data);
      console.log(parsedData);
      setRecommendations({
        fertilizers: parsedData['Recommended_Fertilizers'] || [],
        applicationMethods: parsedData['Application_Methods_and_Amounts'] || {},
        environmentalBenefits: parsedData['Environmental_Benefits'] || [],
        precautions: parsedData['Precautions'] || [],
        cropImprovements: parsedData['Expected_Crop_Improvements'] || [],
        sustainableTips: parsedData['Tips_for_Sustainable_Use'] || [],
      });
      console.log(recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations({ error: 'Unable to generate recommendations. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h10>Fertilizer Recommendation Form</h10>
      <form onSubmit={handleSubmit}>
        {/* Crop Details */}
        <label>Crop Type:</label>
        <input type="text" value={cropType} onChange={(e) => setCropType(e.target.value)} />

        <label>Growth Stage:</label>
        <select value={growthStage} onChange={(e) => setGrowthStage(e.target.value)}>
          <option value="">Select...</option>
          <option value="Germination">Germination</option>
          <option value="Vegetative">Vegetative</option>
          <option value="Flowering">Flowering</option>
          <option value="Fruiting">Fruiting</option>
          <option value="Harvesting">Harvesting</option>
        </select>

        {/* Soil and Environment Inputs */}
        <label>Soil Texture:</label>
        <select value={soilTexture} onChange={(e) => setSoilTexture(e.target.value)}>
          <option value="">Select...</option>
          <option value="Clay">Clay</option>
          <option value="Loam">Loam</option>
          <option value="Sand">Sand</option>
        </select>

        <label>Soil pH Level:</label>
        <select value={phLevel} onChange={(e) => setPhLevel(e.target.value)}>
          <option value="">Select...</option>
          <option value="Acidic">Acidic</option>
          <option value="Neutral">Neutral</option>
          <option value="Alkaline">Alkaline</option>
        </select>

        <label>Nitrogen (mg/kg):</label>
        <input type="number" value={nitrogen} onChange={(e) => setNitrogen(e.target.value)} />

        <label>Phosphorus (mg/kg):</label>
        <input type="number" value={phosphorus} onChange={(e) => setPhosphorus(e.target.value)} />

        <label>Potassium (mg/kg):</label>
        <input type="number" value={potassium} onChange={(e) => setPotassium(e.target.value)} />

        <label>Soil Moisture (%):</label>
        <input type="number" value={moisture} onChange={(e) => setMoisture(e.target.value)} />

        <label>Organic Matter (%):</label>
        <input type="number" value={organicMatter} onChange={(e) => setOrganicMatter(e.target.value)} />

        <label>Region/Place:</label>
        <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} />

        {/* Fertilizer Preferences */}
        <label>Purpose of Fertilizer Use:</label>
        <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
          <option value="">Select...</option>
          <option value="Increase Yield">Increase Yield</option>
          <option value="Boost Growth">Boost Growth</option>
          <option value="Correct Nutrient Deficiency">Correct Nutrient Deficiency</option>
          <option value="Improve Soil Health">Improve Soil Health</option>
        </select>

        <label>Fertilizer Preference:</label>
        <select value={fertilizerPreference} onChange={(e) => setFertilizerPreference(e.target.value)}>
          <option value="">Select...</option>
          <option value="Organic">Organic</option>
          <option value="Inorganic">Inorganic</option>
          <option value="Biofertilizer">Biofertilizer</option>
          <option value="No Preference">No Preference</option>
        </select>

        <label>Budget (in local currency):</label>
        <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />

        <label>Previously Used Fertilizers:</label>
        <input
          type="text"
          value={prevFertilizers}
          onChange={(e) => setPrevFertilizers(e.target.value.split(',').map(f => f.trim()))}
        />

        <label>Fertilizer Performance Feedback:</label>
        <textarea
          value={fertilizerFeedback}
          onChange={(e) => setFertilizerFeedback(e.target.value)}
        ></textarea>

        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Get Recommendations'}
        </button>
      </form>

      {/* Display Recommendations */}
      {recommendations && (
        <div className="recommendations">
          <h3>Recommendations</h3>
          {recommendations.error ? (
            <p style={{ color: 'red' }}>{recommendations.error}</p>
          ) : (
            <>
              <h4>Fertilizer Recommendations</h4>
              <ul>
                {recommendations.fertilizers.map((fertilizer, index) => (
                  <li key={index}>{fertilizer}</li>
                ))}
              </ul>

              <h4>Application Methods and Amounts</h4>
              <ul>
                {Object.entries(recommendations.applicationMethods).map(([fertilizer,details], index) => (
                  <li key={index}><b>{fertilizer}</b>- {details}</li>
                ))}
              </ul>

              <h4>Environmental Benefits</h4>
              <ul>
                {recommendations.environmentalBenefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>

              <h4>Crop Improvements</h4>
              <ul>
                {recommendations.cropImprovements.map((improvement, index) => (
                  <li key={index}>{improvement}</li>
                ))}
              </ul>

              <h4>Sustainable Tips</h4>
              <ul>
                {recommendations.sustainableTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default FertilizerRecommendation;
