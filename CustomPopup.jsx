// src/CustomPopup.jsx
import React from "react";

const CustomPopup = ({ position, onCloseClick, job }) => {
  const popupStyle = {
    position: "absolute",
    left: position.x,
    top: position.y,
    transform: "translate(-50%, -100%)",
    backgroundColor: "white",
    padding: "10px",
    borderRadius: "5px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
    zIndex: 100,
  };

  const triangleStyle = {
    position: "absolute",
    bottom: "-10px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "0",
    height: "0",
    borderLeft: "10px solid transparent",
    borderRight: "10px solid transparent",
    borderTop: "10px solid white",
  };

  return (
    <div style={popupStyle}>
      <div>
        <h4>{job.jobId}</h4>
        <p>{job.address}</p>
      </div>
      <div style={triangleStyle}></div>
      <button onClick={onCloseClick} style={{ marginTop: "5px" }}>
        Close
      </button>
    </div>
  );
};

export default CustomPopup;
