import React from 'react';
import Map from "./Map"; // Import your Map component
import{ useState, useEffect, useCallback } from "react";


function App() {
  const [password, setPassword] = useState("");
const [authenticated, setAuthenticated] = useState(false);
  const appStyles = {
    display: "flex",
    justifyContent: "center", // Center horizontally
    alignItems: "center", // Center vertically
    height: "1vh", // Full viewport height
    width: "100vw", // Full viewport width
    margin: 0,
  };
  const handleChange = (p) => {
    if(p == "yyyyyyyyyy"){
      setAuthenticated(true);
    }
  }
  return (
    <div>
      {!authenticated && <input type="text" onChange={(e) => handleChange(e.target.value)} />}
    {authenticated && (
    <div style={appStyles} className="App">
    <Map />
  </div>
    )}

    </div>

  );
}

export default App;