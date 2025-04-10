// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCtpbYh7BiRBNx2Z9iUJVAS1UPpSStGthI",
  authDomain: "travel-planner-f2191.firebaseapp.com",
  projectId: "travel-planner-f2191",
  storageBucket: "travel-planner-f2191.firebasestorage.app",
  messagingSenderId: "186504588436",
  appId: "1:186504588436:web:f968fc5ed3962037fa9881",
  measurementId: "G-J7DBJRTP0H"
};


export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);





// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getFirestore, collection } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyCtpbYh7BiRBNx2Z9iUJVAS1UPpSStGthI",
//   authDomain: "travel-planner-f2191.firebaseapp.com",
//   projectId: "travel-planner-f2191",
//   storageBucket: "travel-planner-f2191.firebasestorage.app",
//   messagingSenderId: "186504588436",
//   appId: "1:186504588436:web:f968fc5ed3962037fa9881",
//   measurementId: "G-J7DBJRTP0H"
// };

// // Initialize Firebase and Firestore
// export const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);

// // Example collections for agricultural data
// export const cropRecommendationsRef = collection(db, "cropRecommendations");
// export const fertilizerSuggestionsRef = collection(db, "fertilizerSuggestions");
