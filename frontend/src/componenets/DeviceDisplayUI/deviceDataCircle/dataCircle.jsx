import React from "react";
import styles from "./dataCircle.module.css";

export function changeProgress(progress) {
  const angle = `${Math.min(Math.max(progress, 0), 100) * 3.6}deg`;
  return angle;
}

export function DeviceUART({ progress = 0 }) {
  const angle = changeProgress(progress);
  return (
    <div className={styles['device-sensor-area']}>
      <div className={styles['circle-container']}>
        <div
          className={styles.circle}
          style={{ "--progress-angle": angle }}
        >
          <div className={styles['circle-glass']} />
          {/* Progress number hidden */}
        </div>
      </div>
      <div className={styles['uart-label']}>UART</div>
    </div>
  );
}