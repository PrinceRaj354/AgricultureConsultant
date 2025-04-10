import React from 'react';
import '../../../css/InfoSection.css'; // Import the CSS file

function InfoSection({ tripData }) {
  if (!tripData) {
    return <div>Loading...</div>; // Display loading message while data is not available
  }

  return (
    <div className="info-section">
      <img src={tripData.imageURL || '/placeholder.jpg'} alt="Trip" />

      <div className="info-header">
        <h2>{tripData.destination}</h2>
      </div>

      <div className="info-details">
        <div className="info-detail">
          <h3>{tripData.numberOfDays} days</h3>
        </div>
        <div className="info-detail">
          <h3>{tripData.budget} budget</h3>
        </div>
        <div className="info-detail">
          <h3>{tripData.travelCompanion} travelers</h3>
        </div>
      </div>

      <button className="info-button">Share</button>
    </div>
  );
}

export default InfoSection;




// import React from 'react';
// import '../../../css/InfoSection.css'; // Import the CSS file for styling

// function CropInfoSection({ cropData }) {
//   if (!cropData) {
//     return <div>Loading...</div>; // Display loading message while data is not available
//   }

//   return (
//     <div className="info-section">
//       <img src={cropData.imageURL || '/placeholder.jpg'} alt="Crop" />

//       <div className="info-header">
//         <h2>{cropData.cropName}</h2>
//       </div>

//       <div className="info-details">
//         <div className="info-detail">
//           <h3>Optimal Soil Type: {cropData.soilType}</h3>
//         </div>
//         <div className="info-detail">
//           <h3>Recommended pH Level: {cropData.recommendedPh}</h3>
//         </div>
//         <div className="info-detail">
//           <h3>Temperature Range: {cropData.temperatureRange}</h3>
//         </div>
//         <div className="info-detail">
//           <h3>Rainfall Requirement: {cropData.rainfall}</h3>
//         </div>
//         <div className="info-detail">
//           <h3>Benefits: {cropData.benefits}</h3>
//         </div>
//       </div>

//       <button className="info-button">Share</button>
//     </div>
//   );
// }

// export default CropInfoSection;
