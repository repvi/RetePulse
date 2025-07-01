import React from "react";
import { Link } from "react-router-dom"; // Use if using React Router
import "./css/dashboard.css"; // Adjust path as needed
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
  return (
    <div>
      <header>
        {/* You can add header content here */}
      </header>

      <main>
        <div className="container">
          <h2 style={{ display: "inline-block", marginBottom: 5 }}>Dashboard</h2>
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
              {/* Render device display boxes here, e.g.:
                  <DeviceDisplayBox ... />
              */}
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

// Connect to the backend Socket.IO server
const socket = io('http://localhost:5000');

let ledState = false; // Initial LED state is off

fetch('/load/devices', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        devices: Array.from(deviceArray)
    })
})
.then(response => response.json())
.then(data => {
    // Handle the response data
    if (data.deviceList) {
        data.deviceList.forEach(element => {
            deviceArray.push(element);
        });
        console.log("Device list loaded:", deviceArray);
    }

    deviceArray.forEach(device => {
        const deviceType = getDeviceType(device);
        const current_device = new DeviceDisplay(device.name, device.model, device.last_updated, device.status, deviceType);
        current_device.displayDevice();
    });
    console.log(data);
})
.catch(error => {
    console.error('Error fetching device data:', error);
});

// Set up LED toggle button event handler after DOM loads
window.onload = function() {
    document.getElementById('toggle-button').onclick = toggleLED;
};

/* ------------------- Animation Helpers ------------------- */

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


/* ------------------- Device Display Class ------------------- */

// Handles creation, update, and removal of device cards in the dashboard


function toggleLED() {
    const command = ledState ? 'off' : 'on';
    fetch(`/led/${command}`)
        .then(response => response.text())
        .then(data => {
            ledState = !ledState; // Toggle the state
            updateButton();
        })
        .catch(error => {
            console.error('Error:', error);
    });
}

function updateButton() {
    const button = document.getElementById('toggle-button');
    button.classList.toggle('off'); /* Toggle the button class to change its appearance */
    const current_device = new DeviceDisplay('esp_name', 'esp32', '12-3-2024', 'connected', new DeviceUART());
    current_device.displayDevice();
}

/*
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
*/

// Simulate updating sensor data (replace with actual sensor data update logic)
/*
setInterval(() => {
    const sensorData = Math.random() * 100; // do
    updateSensorData(sensorData);
}, 400); // update each 400 miliseconds

function updateValue() {
    fetch('/get_value')
        .then(response => response.json())
        .then(data => {
            document.getElementById('display').textContent = "Value: " + data.value;
        });
}
*/

socket.on('device_update', (data) => {
    device = getDeviceType(data);

    const current_device = new DeviceDisplay(data.device_name, data.device_model, data.last_updated, data.status, device);
    current_device.displayDevice();
});

// Poll every 2 seconds
/*
setInterval(updateValue, 2000);
*/