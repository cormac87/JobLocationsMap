import { db } from './firebase.js'; // Firebase setup
import { collection, addDoc } from 'firebase/firestore';
import axios from 'axios';
import {jobData} from './jobData.js'; // Import job data

const GOOGLE_MAPS_API_KEY = ''; // Replace with your Google Maps API Key

// Function to get lat/lng from Google Geocoding API
const getLatLng = async (address, postcode) => {
  const fullAddress = `${address}, ${postcode}`;
  const geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GOOGLE_MAPS_API_KEY}`;
  
  try {
    const response = await axios.get(geocodeURL);
    const data = response.data;
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    } else {
      console.error(`Geocoding API error for ${fullAddress}: ${data.status}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching geocode for ${fullAddress}:`, error);
    return null;
  }
};

// Function to upload jobs to Firestore
const uploadJobsToFirestore = async () => {
  const jobsCollectionRef = collection(db, 'jobs');
  
  for (const job of jobData) {
    const latLng = await getLatLng(job.address, job.postcode);
    
    if (latLng) {
      try {
        await addDoc(jobsCollectionRef, {
          lat: latLng.lat,
          lng: latLng.lng,
          projectNumber: job.jobId, // Store jobId as projectNumber
        });
        console.log(`Job ${job.jobId} uploaded successfully`);
      } catch (error) {
        console.error(`Error uploading job ${job.jobId}:`, error);
      }
    } else {
      console.error(`Skipping job ${job.jobId} due to missing lat/lng`);
    }
  }
};

// Run the function to upload jobs
uploadJobsToFirestore();
