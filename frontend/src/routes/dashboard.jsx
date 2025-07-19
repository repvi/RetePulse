import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from "react-router-dom"; // Use if using React Router
import "./css/dashboard.css"; // Adjust path as needed
import styles from "./modules/dashboard.module.css"; // Adjust path as needed
import { getRegisteredDevicesAPI, useSocketIOConnect } from "../api/flask/flaskapi"; // Import the API function
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

const DeviceDisplayItem = memo(
  function DeviceDisplayItem({ device, index }) {
    return (
      <motion.div
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
      >
        <DeviceDisplayBox device={device} />
      </motion.div>
    );
  },
  // only re‐render if the device object *identity* changes
  (prev, next) => prev.device === next.device
);

function DeviceDisplayArea({ devices }) {
  return (
    <div
      id="device-display-area"
      style={{ display: "flex", flexDirection: "column" }}
    >
      {devices.map((device, i) => (
        <DeviceDisplayItem
          key={device.id}    // stable unique key
          device={device}
          index={i}
        />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [devices, setDevices] = useState([]); // State to hold registered devices

  useEffect(() => {
    getRegisteredDevicesAPI().then(setDevices);
  }, []); // Empty array ensures it runs only once

  useSocketIOConnect(setDevices);
  
  return (
    <div className={"dashboard-page"}>
      <main>
        <div className={styles['container']}>
          <h2 id="dashboard-title">Dashboard</h2>
          <div className={styles['inner-main-card']}>
            <h3 style={{ textAlign: "left" }}>Registered Devices</h3>
              
            <DeviceDisplayArea devices={devices} />
          </div>
        </div>

        <div className={styles['bottom-container']}>
          <div className={styles['upload']} style={{ margin: 10, textAlign: "center" }}>
            {/* Use <a href="/upload"> if not using React Router */}
            <Link to="/upload">Upload Firmware</Link>
          </div>
          <div className={styles['logout']} style={{ margin: 10, textAlign: "center" }}>
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