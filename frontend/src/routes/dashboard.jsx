import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom"; // Use if using React Router
import styles from "./css/dashboard.css"; // Adjust path as needed
import { getRegisteredDevicesAPI } from "../api/flask/flaskapi"; // Import the API function
import { DeviceDisplayBox } from '../componenets/DeviceDisplayUI/deviceLoad';
//import styles from "./css/dashboard.module.css"; // Adjust path as needed
/*
<template id = device-control-template>
        <div class="device-control-box">
            <div class="device-control-button">
                <button class="toggle-button off" id="toggle-button">LED</button>
            </div>
        </div>
    </template>
*/

export default function Dashboard() {
  const [devices, setDevices] = useState([]); // State to hold registered devices

  useEffect(() => {
    getRegisteredDevicesAPI().then(setDevices)
  }, []); // Empty array ensures it runs only once
  return (
    <div>
      <main>
        <div className={styles.container}>
          <h2 id="dashboard-title">Dashboard</h2>
          <div className="inner-main-card">
            <h3 style={{ textAlign: "left" }}>Registered Devices</h3>
            <div
              id="device-display-area"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              {
                devices.map(device => (
                  <DeviceDisplayBox
                    key={device.name}
                    name={device.name}
                    model={device.model}
                    last_updated={device.last_updated}
                    status={device.status}
                    sensor_type={device.sensor_type}
                  />
                ))
              }
            </div>
            <button className="toggle-button off" id="toggle-button">
              LED
            </button>
          </div>
        </div>

        <div className="bottom-container">
          <div className="upload" style={{ margin: 10, textAlign: "center" }}>
            {/* Use <a href="/upload"> if not using React Router */}
            <Link to="/upload">Upload Firmware</Link>
          </div>
          <div className="logout" style={{ margin: 10, textAlign: "center" }}>
            <a href="/logout" style={{ textAlign: "center" }}>
              Logout
            </a>
          </div>
        </div>
      </main>
    </div>
    /* 
    <footer>
        <div class="footer-content" style="text-align: center;">
            <p>&copy; 2024 Revint. All rights reserved.</p>
        </div>
    </footer>
    */
  );
}

/*

// Set up LED toggle button event handler after DOM loads
window.onload = function() {
    document.getElementById('toggle-button').onclick = toggleLED;
};

// Animate the appearance of a new device card
function animateNewCard(element) {
  gsap.fromTo(element, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3 });
}

// Animate the removal of a device card, then remove it from the DOM
function animateRemoveCard(element) {
    gsap.fromTo(
        element, 
        { opacity: 1, x: 0 },
        { opacity: 0, x: -20, 
            duration: 0.3, 
            onComplete: () => {
                element.remove();
            } 
        }
    );
}



// Handles creation, update, and removal of device cards in the dashboard

function updateButton() {
    const button = document.getElementById('toggle-button');
    button.classList.toggle('off');
    const current_device = new DeviceDisplay('esp_name', 'esp32', '12-3-2024', 'connected', new DeviceUART());
    current_device.displayDevice();
}


function updateSensorData(sensorData) {
    const progress = document.getElementById('progress');
    const circle = document.querySelector('.circle');
    const maxData = 100;  // Assuming max value for sensor data
    const percentage = Math.min((sensorData / maxData) * 100, 100);

    // Update the progress text
    progress.textContent = `${percentage.toFixed(0)}%`;

    // Update the circle background based on the percentage
    circle.style.backgroundImage = `conic-gradient(
      #9000ff ${percentage * 3.6}deg,
        rgba(0, 0, 0, 0.5) ${percentage * 3.6}deg 360deg
    )`;
}


// Simulate updating sensor data (replace with actual sensor data update logic)

setInterval(() => {
    const sensorData = Math.random() * 100; // do
    updateSensorData(sensorData);
}, 400); // update each 400 miliseconds

// Poll every 2 seconds

setInterval(updateValue, 2000);
*/