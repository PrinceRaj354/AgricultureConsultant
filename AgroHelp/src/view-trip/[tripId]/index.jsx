import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import InfoSection from './components/InfoSection';
import Hotels from './components/Hotels';
import PlacesToVisit from './components/PlacesToVisit';
import '../../css/ViewTrip.css';
import Footer from './components/Footer';
import axios from 'axios';

function ViewTrip() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tripId) {
      fetchTripData();
    }
  }, [tripId]);

  const fetchTripData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://your-api-endpoint.com/trips/${tripId}`);
      setTrip(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching trip data:", error);
      toast.error('Failed to fetch trip details.');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading trip details...</div>;
  }

  return (
    <div className="viewtrip-container">
      <div className="info-section">
        <InfoSection tripData={trip} />
      </div>
      <div className="hotels-section">
        <Hotels tripData={trip?.tripData} />
      </div>
      <div className="places-to-visit-section">
        <PlacesToVisit trip={trip?.tripData} />
      </div>
      <div className="footer">
        <Footer />
      </div>
    </div>
  );
}

export default ViewTrip;





// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { toast } from 'sonner';
// import InfoSection from './components/InfoSection';
// import Hotels from './components/Hotels';
// import PlacesToVisit from './components/PlacesToVisit';
// import '../../css/ViewTrip.css';
// import Footer from './components/Footer';
// import axios from 'axios';

// function ViewTrip() {
//   const { tripId } = useParams(); // Get tripId from the URL params
//   const [trip, setTrip] = useState(null); // Initialize trip as null
//   const [loading, setLoading] = useState(true); // Set loading to true initially

//   useEffect(() => {
//     if (tripId) {
//       fetchTripData();
//     }
//   }, [tripId]); // Trigger fetch when tripId changes

//   const fetchTripData = async () => {
//     try {
//       const response = await axios.get(`https://your-api-endpoint.com/trips/${tripId}`);
//       setTrip(response.data); // Set the received data as trip
//       setLoading(false); // Stop loading when data is fetched
//     } catch (error) {
//       console.error("Error fetching trip data:", error);
//       toast.error('Failed to fetch trip details.'); // Display error message
//       setLoading(false); // Stop loading on error
//     }
//   };

//   if (loading) {
//     return <div className="loading">Loading trip details...</div>; // Show loading message while fetching
//   }

//   return (
//     <div className="viewtrip-container">
//       <div className="info-section">
//         <InfoSection tripData={trip} /> {/* Pass trip directly to InfoSection */}
//       </div>
//       <div className="hotels-section">
//         <Hotels tripData={trip?.hotelOptions} /> {/* Pass the hotel options if they exist */}
//       </div>
//       <div className="places-to-visit-section">
//         <PlacesToVisit trip={trip?.itinerarySuggestions} /> {/* Pass the itinerary suggestions if they exist */}
//       </div>
//       <div className="footer">
//         <Footer />
//       </div>
//     </div>
//   );
// }

// export default ViewTrip;
