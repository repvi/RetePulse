import React, { useState } from "react";
import styles from "./deviceLoad.module.css"; // Adjust the path as needed
import useNavigateWithBacktrack from "../../backtrack";
import { user_id, id_type, removeDeviceFromDB } from "../../api/flask/flaskapi"; // Adjust the import path as needed
import { DeviceUART } from "../DeviceDisplayUI/deviceDataCircle/dataCircle";
import { ControlDeviceOptions } from "./deviceControlBox/controlOptions";

function loadDeviceBlank() {
    return <div className="device-sensor-data"></div>;
}

function getDeviceType(data = String) {
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
    >
      <div className={styles['device-main-info']}>
        <span className={styles['device-serial-name']}>{name}</span>
      </div>
      <div className={styles['device-display-sub-info']}>
        <div className={styles['device-display-sub-info-row']}>
          <span className={styles['device-model']}>{model}</span>
          <span className={styles['device-status']}>{status}</span>
        </div>
        <div className={styles['device-last-updated-container']}>
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
  const [showControls, setShowControls] = useState(false); // added for control visibility
  const [controlKey, setControlKey] = useState(0); // added for resetting controls

  const handleToggleControls = () => {
    if (showControls) {
      // When hiding controls, reset them by changing the key
      setControlKey(prev => prev + 1);
    }
    setShowControls(!showControls);
  };

  const controlOption = <ControlDeviceOptions name={name} key={controlKey} />;

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
        {/* Toggle arrow for control area */}
        <div 
          onClick={handleToggleControls}
          className={styles['control-toggle']}
        >
          <span className={styles['control-toggle-text']}>Device Controls</span>
          <span 
            className={`${styles['control-toggle-arrow']} ${showControls ? styles['expanded'] : styles['collapsed']}`}
          >
            ▼
          </span>
        </div>
        
        {showControls && (
          <div className={styles['device-control-area']}>{controlOption}</div>
        )}
        <div className={styles['device-sensor-area']}>{children}</div>{/* Can possibly improve here */}
        {/* You can render children here if you want to pass custom content */}
      </div>
    </div>
  );
}