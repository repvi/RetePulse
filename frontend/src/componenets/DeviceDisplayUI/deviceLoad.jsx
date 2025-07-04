import React from "react";
import styles from "./deviceLoad.module.css"; // Adjust the path as needed
import DeviceUART from "./deviceDataCircle/dataCircle";

function loadUART() {
    return (
        <div className={styles['device-sensor-data']}>
            <div className={styles['circle-container']}>
                <div className={styles['circle']}>
                    <div className={styles['progress']} id="progress">0%</div>
                </div>
            </div>
        </div>
    );
}

function loadDeviceBlank() {
    return <div className="device-sensor-data"></div>;
}

export function getDeviceType(data) {
    switch (data.sensor_type) {
        case 'uart':
            return <DeviceUART />;
        default:
            return loadDeviceBlank();
    }
}

export function DeviceDisplayBox({name, model, last_updated, status, sensor_type}) {
  const children = getDeviceType(sensor_type);

  return (
    <div className={styles['device-display']}>
      {/* Device Info Box */}
      <div className={styles['device-display-box']}>
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

      {/* Configuration Box */}
      <div className={styles['device-configuration-box']}>
        <div className={styles['device-sensor-area']}>{children}</div>{/* Can possibly improve here */}
        <div className={styles['device-control-area']}></div>
        {/* You can render children here if you want to pass custom content */}
      </div>
    </div>
  );
}