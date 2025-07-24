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
  
  // Function to get status class based on status text
  const getStatusClass = (status) => {
    if (!status) return '';
    const statusLower = status.toLowerCase();

    if (statusLower.includes('disconnected')) return 'status-disconnected';
    if (statusLower.includes('reconnecting')) return 'status-reconnnecting';
    if (statusLower.includes('connected')) return 'status-connected';
    if (statusLower.includes('warning')) return 'status-warning';
    if (statusLower.includes('error') || statusLower.includes('failed')) return 'status-error';
    if (statusLower.includes('resetting') || statusLower.includes('reset')) return 'status-resetting';
    if (statusLower.includes('updating') || statusLower.includes('update')) return 'status-updating';
    if (statusLower.includes('offline') || statusLower.includes('disconnected')) return 'status-offline';
    if (statusLower.includes('idle') || statusLower.includes('standby')) return 'status-idle';
    
    return 'status-default';
  };
  
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
          <span className={`${styles['device-status']} ${styles[getStatusClass(status)]}`}>{status}</span>
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
          className={styles['control-toggle']}
        >
          <div 
            onClick={handleToggleControls}
            className={styles['control-toggle-header']}
          >
            <div className={styles['control-toggle-text']}>Device Controls</div>
            <div 
              className={`${styles['control-toggle-arrow']} ${showControls ? styles['expanded'] : styles['collapsed']}`}
            >
              ▼
            </div>
          </div>
          
          {showControls && (
            <div className={styles['device-control-area']}>{controlOption}</div>
          )}
        </div>
        
        {/* Device sensor area comes after controls */}
        <div className={styles['device-sensor-area']}>{children}</div>
      </div>
    </div>
  );
}