import React, { useState } from "react";
import styles from "./deviceLoad.module.css"; // Adjust the path as needed
import { DeviceUART } from "./deviceDataCircle/dataCircle";

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
      tabIndex={0}
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
          <span className={styles['device-device-status']}>{status}</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <span className={styles['device-last-updated']}>{"Last updated: " + last_updated}</span>
        </div>
      </div>
    </div>
  );
}

export function BackText({ onCancel = () => {} }) {  
  return (
    <div className="device-back-space">
      <div className={styles['device-back']}>
        <span className={styles['device-back-text']}>
          Delete Device?
        </span>
        <div className={styles['device-options']}>
          <button 
            className={styles['device-delete-button']}
            onClick={goToDeletePage}
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

function goToDeletePage() {
  // This function can be used to navigate to a delete confirmation page
  // or perform the delete action directly.
  console.log("Delete action triggered");
}

export function DeviceDisplayBox({device = {}}) {
  const { name, model, last_updated, status, sensor_type } = device;
  const children = getDeviceType({sensor_type});
  const [flipped, setFlipped] = useState(false);        // added
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className={styles['device-display']}>
      <div className={styles['device-display-box']}>
      {
        flipped ? 
        <BackText 
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