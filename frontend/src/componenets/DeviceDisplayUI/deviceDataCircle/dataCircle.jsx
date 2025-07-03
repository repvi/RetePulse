import React from "react";
import styles from "./dataCircle.css";

export default function DeviceUART({ progress = 0 }) {
  return (
    <div className={styles.deviceSensorData}>
      <div className={styles.circleContainer}>
        <div className={styles.circle}>
          <div className={styles.progress} id="progress">
            {progress}%
          </div>
        </div>
      </div>
    </div>
  );
}