

import React from 'react';
import '../../../css/Hotels.css';
function Hotels({ tripData }) {
  return (
    <div>
      <h2>🏨 Hotel Recommendations</h2>
      <div>
        {tripData?.hotelOptions?.length > 0 ? (
          tripData.hotelOptions.map((hotel, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <ul>
                <li><strong>Hotel Name:</strong> {hotel.hotelName}</li>
                <li><strong>Address:</strong> {hotel.address}</li>
                <li><strong>Price per Night:</strong> {hotel.pricePerNight}</li>
                <li><strong>Rating:</strong> {hotel.rating}</li>
                <li><strong>Description:</strong> {hotel.description}</li>
              </ul>
            </div>
          ))
        ) : (
          <p>No hotel options available.</p>
        )}
      </div>
    </div>
  );
}


export default Hotels;


// import React from 'react';
// import '../../../css/Hotels.css'; // You may want to create a new CSS file specific for crop recommendations

// function CropRecommendation({ cropData }) {
//   return (
//     <div>
//       <h2>🌾 Crop Recommendations</h2>
//       <div>
//         {cropData?.cropOptions?.length > 0 ? (
//           cropData.cropOptions.map((crop, index) => (
//             <div key={index} style={{ marginBottom: '20px' }}>
//               <ul>
//                 <li><strong>Crop Name:</strong> {crop.cropName}</li>
//                 <li><strong>Optimal Soil Type:</strong> {crop.soilType}</li>
//                 <li><strong>Recommended pH Level:</strong> {crop.recommendedPh}</li>
//                 <li><strong>Temperature Range:</strong> {crop.temperatureRange}</li>
//                 <li><strong>Rainfall Requirements:</strong> {crop.rainfall}</li>
//                 <li><strong>Benefits:</strong> {crop.benefits}</li>
//               </ul>
//             </div>
//           ))
//         ) : (
//           <p>No crop recommendations available based on the provided data.</p>
//         )}
//       </div>
//     </div>
//   );
// }

// export default CropRecommendation;
