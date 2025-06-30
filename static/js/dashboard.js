/*
dashboard.js
------------
JavaScript for the MicroUSC-Sentinel dashboard frontend.

Features:
- Real-time device updates via Socket.IO
- Dynamic device card creation, update, and removal with animations (GSAP)
- Device class hierarchy for different sensor types
- LED control via backend API
- (Commented) Sensor data visualization and polling

Dependencies:
- Socket.IO (for real-time updates)
- GSAP (for animations)
*/

// Connect to the backend Socket.IO server
const socket = io('http://localhost:5000');

let totalDevices = 0;
let ledState = false; // Initial LED state is off

let deviceArray = []; // To keep track of devices

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

/* ------------------- Device Sensor Classes ------------------- */

// Abstract base class for device sensor types
class DeviceSensorBase {
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

// Default device sensor (no special features)
class DeviceDefault extends DeviceSensorBase {
    constructor() {
        super();
    }

    addDeviceFeatures(parent) {
        // Implement default device features here
        console.log("Adding default device features");
    }
}

// UART device sensor (example with data handling)
class DeviceUART extends DeviceSensorBase {
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

/* ------------------- Device Display Class ------------------- */

// Handles creation, update, and removal of device cards in the dashboard
class DeviceDisplay {
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

function getDeviceType(data) {
    switch (data.sensor_type) {
        case 'uart':
            return new DeviceUART();
        default:
            return new DeviceDefault();
    }
}

socket.on('device_update', (data) => {
    device = getDeviceType(data);

    const current_device = new DeviceDisplay(data.device_name, data.device_model, data.last_updated, data.status, device);
    current_device.displayDevice();
});

// Poll every 2 seconds
/*
setInterval(updateValue, 2000);
*/