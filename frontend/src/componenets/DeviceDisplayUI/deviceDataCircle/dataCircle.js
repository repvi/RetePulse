import React from "react";
import "./dataCircle.css";

export function DeviceUART({ progress = 0 }) {
  return (
    <div className="device-sensor-data">
      <div className="circle-container">
        <div className="circle">
          <div className="progress" id="progress">
            {progress}%
          </div>
        </div>
      </div>
    </div>
  );
}