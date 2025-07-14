import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'
import styles from "./deviceLoad.module.css"; // Adjust the path as needed
import { DeviceUART } from "./deviceDataCircle/dataCircle";
import useNavigateWithBacktrack from "../../backtrack";
import { user_id, id_type, removeDeviceFromDB } from "../../api/flask/flaskapi"; // Adjust the import path as needed

function loadDeviceBlank() {
    return <div className="device-sensor-data"></div>;
}

export function getDeviceType(data = String) {
    switch (data.sensor_type) {
      case 'uart':
        return <DeviceUART progress={65} />
      default:
        return loadDeviceBlank();
    }
}

function FrontText({ device, onFlip = () => {} }) {
  const { name, model, last_updated, status } = device;
  return (
    <div 
      className={styles['device-display-info']}
      onClick={onFlip}
      role="button"
      style={{cursor: "pointer"}}
    >
      <div
        className={styles['device-main-info']}
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <span className={styles['device-serial-name']}>{name}</span>
      </div>
      <div className={styles['device-display-sub-info']}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className={styles['device-model']}>{model}</span>
          <span className={styles['device-status']}>{status}</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <span className={styles['device-last-updated']}>{"Last updated: " + last_updated}</span>
        </div>
      </div>
    </div>
  );
}

export function BackText({name, onCancel = () => {} }) {
  const nav = useNavigateWithBacktrack();

  return (
    <div className="device-back-space">
      <div className={styles['device-back']}>
        <span className={styles['device-back-text']}>
          Delete Device?
        </span>
        <div className={styles['device-options']}>
          <button 
            className={styles['device-delete-button']}
            onClick={() => {
              console.log("Delete action triggered");
              removeDeviceFromDB(name);
            }}
          >
            Delete
          </button>
          <button 
            className={styles['device-cancel-button']}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeviceDisplayBox({device = {}}) {
  const { name, model, last_updated, status, sensor_type } = device;
  const children = getDeviceType({sensor_type});
  const [flipped, setFlipped] = useState(false);        // added

  const isAdmin = localStorage.getItem(user_id) == id_type.admin; // Check if the user is an admin

  return (
    <div className={styles['device-display']} id={name}>
      <div className={styles['device-display-box']}>
      {
        isAdmin && flipped ? 
        <BackText 
          name={name}
          onCancel={() => setFlipped(false)}
        />
        : <FrontText device={device} onFlip={() => setFlipped(f => !f)} />
      }
      </div>

      <div className={styles['device-configuration-box']}>
        <div className={styles['device-sensor-area']}>{children}</div>{/* Can possibly improve here */}
        <div className={styles['device-control-area']}></div>
        {/* You can render children here if you want to pass custom content */}
      </div>
    </div>
  );
}