import React from 'react';
import '../../../css/PlacesToVisit.css';
function PlacesToVisit({ trip }) {
  return (
    <div>
      <h2>Places To Visit</h2>
      <div>
        {trip?.itinerarySuggestions?.length > 0 ? (
          trip.itinerarySuggestions.map((item, index) => (
            <div key={index}>
              <h3>{item.day}</h3>
              <ul>
                {item.plan?.map((place, placeIndex) => (
                  <li key={placeIndex}>
                    <p><strong>Name:</strong> {place.name || 'N/A'}</p>
                    <p><strong>Best Time:</strong> {place.bestTimeToVisit || 'Anytime'}</p>
                    <p><strong>Description:</strong> {place.description || 'No description available'}</p>
                    <p><strong>Estimated Travel Time:</strong> {place.estimatedTravelTime || 'N/A'}</p>
                    <p><strong>Ticket Pricing:</strong> {place.ticketPricing || 'N/A'}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p>No places to visit available.</p>
        )}
      </div>
    </div>
  );
}


export default PlacesToVisit;





// import React from 'react';
// import '../../../css/PlacesToVisit.css';

// function PlacesToVisit({ trip }) {
//   return (
//     <div className="places-to-visit">
//       <h2>Places To Visit</h2>
      
//       {/* Check if there are itinerary suggestions */}
//       {trip?.itinerarySuggestions?.length > 0 ? (
//         <div>
//           {trip.itinerarySuggestions.map((item, index) => (
//             <div key={index} className="itinerary-day">
//               <h3>{item.day}</h3>
              
//               {/* List the places for each day */}
//               <ul>
//                 {item.plan?.map((place, placeIndex) => (
//                   <li key={placeIndex} className="place-item">
//                     <p><strong>Name:</strong> {place.name || 'N/A'}</p>
//                     <p><strong>Best Time:</strong> {place.bestTimeToVisit || 'Anytime'}</p>
//                     <p><strong>Description:</strong> {place.description || 'No description available'}</p>
//                     <p><strong>Estimated Travel Time:</strong> {place.estimatedTravelTime || 'N/A'}</p>
//                     <p><strong>Ticket Pricing:</strong> {place.ticketPricing || 'N/A'}</p>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p>No places to visit available.</p>
//       )}
//     </div>
//   );
// }

// export default PlacesToVisit;
