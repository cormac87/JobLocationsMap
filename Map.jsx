import React, { useState, useEffect, useCallback } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
  StandaloneSearchBox,
} from "@react-google-maps/api";
import { db } from "./firebase"; // Firebase setup
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};
const center = {
  lat: 52.0629,
  lng: 0.133,
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

const JobMap = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "", // Replace with your API key
    libraries,
  });

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchBox, setSearchBox] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [showProjectInput, setShowProjectInput] = useState(false);
  const [projectNumber, setProjectNumber] = useState("");
  const [map, setMap] = useState(null); // State for storing the map reference

  const jobsCollectionRef = collection(db, "jobs");

  // Fetch jobs from Firebase
  const fetchJobs = async () => {
    const data = await getDocs(jobsCollectionRef);
    setJobs(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Handle the search box input
  const handleSearch = () => {
    const places = searchBox.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const newLocation = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setSearchLocation(newLocation);
      setAddress(place.formatted_address); // Store the address
      setShowProjectInput(true);

      // Update the map center and zoom in on the searched location
      if (map) {
        map.panTo(newLocation);
        map.setZoom(15); // Set a closer zoom level for a detailed view
      }
    } else {
      alert("Please search for a location first.");
    }
  };

  // Show the project number input when "Add Job" is clicked
  const handleAddJobClick = () => {
    if (searchLocation) {
      setShowProjectInput(true);
    } else {
      alert("Please search for a location first.");
    }
  };

  // Save the job to Firebase
  const saveJobToFirebase = async () => {
    if (projectNumber) {
      await addDoc(jobsCollectionRef, {
        lat: searchLocation.lat,
        lng: searchLocation.lng,
        projectNumber: projectNumber,
      });
      fetchJobs(); // Refresh job list after adding
      setShowProjectInput(false); // Hide the input
      setProjectNumber(""); // Clear the project number input
      setSearchLocation(null); // Clear the search location
      setAddress(""); // Clear the address
    } else {
      alert("Please enter a project number.");
    }
  };

  // Delete the job from Firebase
  const deleteJob = async (id) => {
    await deleteDoc(doc(db, "jobs", id));
    fetchJobs(); // Refresh the job list
    setSelectedJob(null); // Close the InfoWindow
  };

  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading Maps";

  return (
    <div>
      {/* Search Box and Add Job Button */}
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}>
        <StandaloneSearchBox onLoad={(ref) => setSearchBox(ref)}>
          <input
            type="text"
            placeholder="Search for a location"
            style={{
              boxSizing: `border-box`,
              border: `1px solid transparent`,
              width: `240px`,
              height: `32px`,
              marginTop: `27px`,
              padding: `0 12px`,
              borderRadius: `3px`,
              boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
              fontSize: `14px`,
              outline: `none`,
              textOverflow: `ellipses`,
            }}
          />
        </StandaloneSearchBox>
        <button onClick={handleSearch}>Search</button>

        {/* Project Number Input */}
        {showProjectInput && (
          <div>
            <input
              type="text"
              placeholder="Enter project number"
              value={projectNumber}
              onChange={(e) => setProjectNumber(e.target.value)}
              style={{
                marginTop: "10px",
                padding: "5px",
                fontSize: "14px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
            <button onClick={saveJobToFirebase}>Save Job</button>
          </div>
        )}
      </div>

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={8}
        center={center}
        options={options}
        onLoad={(map) => setMap(map)} // Store map reference on load
      >
        {/* Blue marker for the searched location */}
        {searchLocation && (
          <Marker
            position={searchLocation}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
        )}

        {/* Job markers from Firebase */}
        {jobs.map((job) => (
          <Marker
            key={job.id}
            position={{ lat: job.lat, lng: job.lng }}
            onClick={() => setSelectedJob(job)}
          />
        ))}

        {/* InfoWindow for selected job */}
        {selectedJob && (
          <InfoWindow
            position={{ lat: selectedJob.lat, lng: selectedJob.lng }}
            onCloseClick={() => setSelectedJob(null)}
          >
            <div>
              <p style={{ color: 'black' }}>
                Project Number: {selectedJob.projectNumber}
              </p>
              <button
                onClick={() => deleteJob(selectedJob.id)}
                style={{
                  marginTop: "10px",
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  cursor: "pointer",
                  borderRadius: "5px",
                }}
              >
                Delete
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default JobMap;
