import React from "react";
import Device from "./deviceDataCircle";

let totalDevices = 0;

let deviceArray = []; // To keep track of devices

export class DeviceSensorBase {
    constructor() {
        if (this.constructor === DeviceSensorBase) {
            throw new Error("Cannot instantiate abstract class DeviceSensorBase");
        }
    }

    addDeviceFeatures(parent) {
        throw new Error("Method 'addDeviceFeatures()' must be implemented.");
    }

    // Animate adding a sensor feature to the right
    animateAddRight(element) {
        gsap.fromTo(element, { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.3 });
    }

    // Animate removing a sensor feature to the right, then remove it
    animateRemoveRight(element) {
        gsap.fromTo(
            element, 
            { opacity: 1, x: 0 },
            { opacity: 0, x: 50, 
                duration: 0.3, 
                onComplete: () => {
                    element.remove();
                } 
            }
        );
    }
}

export class DeviceDefault extends DeviceSensorBase {
    constructor() {
        super();
    }

    addDeviceFeatures(parent) {
        // Implement default device features here
        console.log("Adding default device features");
    }
}

// UART device sensor (example with data handling)
export class DeviceUART extends DeviceSensorBase {
    #data;
    
    constructor() {
        super();
    }

    getData() {
        return this.#data;
    }
    
    setData(data) {
        this.#data = data;
    }

    addDeviceFeatures(parent) {
        const template = document.getElementById("device-uart-template");

        // Clone just the actual device box element
        const newCard = template.content.querySelector('.device-sensor-data').cloneNode(true);
        parent.appendChild(newCard);

        // Animate it after the frame renders
        this.animateAddRight(newCard);
    }

    removeDeviceFeatures(parent) {
        const element = parent.querySelector('.device-sensor-area .device-sensor-data');
        if (element) {
            this.animateRemoveRight(element);
        }
    }
}

export class DeviceDisplay {
    #name;
    #model;
    #last_updated;
    #status;
    #sensor_type = null; // Default to null, can be set later

    constructor(name, model, last_updated, status, sensor_type) {
        this.#name = name;
        this.#model = model;
        this.#last_updated = last_updated;
        this.#status = status;
        this.#sensor_type = sensor_type;
    }
    
    // Display or update the device card
    displayDevice() {
        const element = document.getElementById(this.#name);
        if (element) { /* element id name exists */ 
            this.#updateDeviceDisplay(element);
            //this.#removeDevice(); // Remove the existing device display
        }
        else {
            this.#addDevice();
        }
    }

    #updateSerialNameUI(element) {
        const serial_name = element.querySelector('.device-main-info .device-serial-name');
        serial_name.textContent = this.#name;
    }

    #updateModelUI(element) {
        const model = element.querySelector('.device-display-sub-info .device-model');
        model.textContent = this.#model;
    }

    #updateLastUpdatedUI(element) {
        const last_updated = element.querySelector('.device-display-sub-info .device-last-updated');
        last_updated.textContent = 'Last updated: ' + this.#last_updated;
    }

    #updateStatusUI(element) {
        const status = element.querySelector('.device-display-sub-info .device-device-status');
        status.textContent = this.#status;
    }

    #updateDeviceDisplay(element) {
        this.#updateSerialNameUI(element);
        this.#updateModelUI(element);
        this.#updateLastUpdatedUI(element);
        this.#updateStatusUI(element);
    }

    #getSensorArea(parent) {
        return parent.querySelector(".device-sensor-area");
    }
    
    #addDevice() {
        totalDevices++;

        const template = document.getElementById("device-display-box-template");
        const container = document.getElementById("device-display-area");

        // Clone just the actual device box element
        const newCard = template.content.querySelector('.device-display').cloneNode(true);
        newCard.id = this.#name; // Set the id to the device name
        const sensor_area = this.#getSensorArea(newCard);
        this.#sensor_type.addDeviceFeatures(sensor_area); // Add device features based on sensor type
        
        this.#updateDeviceDisplay(newCard);
        container.appendChild(newCard);

        // Animate it after the frame renders
        animateNewCard(newCard);
    }

    #removeDevice() {
        const element = document.getElementById(this.#name);
        if (element) {
            totalDevices--;
            this.#sensor_type.removeDeviceFeatures(element);
            animateRemoveCard(element);
        }
    }
}

export function getDeviceType(data) {
    switch (data.sensor_type) {
        case 'uart':
            return new DeviceUART();
        default:
            return new DeviceDefault();
    }
}

export function DeviceDisplayBox() {
  return (
    <div className="device-display">
      {/* Device Info Box */}
      <div className="device-display-box">
        <div
          className="device-main-info"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <span className="device-serial-name">{serialName}</span>
        </div>
        <div className="device-display-sub-info">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="device-model"></span>
            <span className="device-device-status"></span>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className="device-last-updated"></span>
          </div>
        </div>
      </div>

      {/* Configuration Box */}
      <div className="device-configuration-box">
        <div className="device-sensor-area"></div>
        <div className="device-control-area"></div>
        {/* You can render children here if you want to pass custom content */}
        {children}
      </div>
    </div>
  );
}