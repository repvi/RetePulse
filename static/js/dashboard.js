const socket = io('http://localhost:5000');

let totalDevices = 0;
let ledState = false; // Initial LED state is off

window.onload = function() {
    document.getElementById('toggle-button').onclick = toggleLED;
};

function animateNewCard(element) {
  gsap.fromTo(element, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3 });
}

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

class DeviceDisplay {
    constructor(name, model, last_updated, status) {
        this.name = name;
        this.model = model;
        this.last_updated = last_updated;
        this.status = status;
    }

    displayDevice() {
        const element = document.getElementById(this.name);
        if (element) { /* element id name exists */ 
            this.removeDevice(); // Remove the existing device display
            //this.#updateDeviceDisplay(element);
        }
        else {
            this.#addDevice();
        }
    }

    #updateSerialNameUI(element) {
        const serial_name = element.querySelector('.device-main-info .device-serial-name');
        serial_name.textContent = this.name;
    }

    #updateModelUI(element) {
        const model = element.querySelector('.device-display-sub-info .device-model');
        model.textContent = this.model;
    }

    #updateLastUpdatedUI(element) {
        const last_updated = element.querySelector('.device-display-sub-info .device-last-updated');
        last_updated.textContent = this.last_updated;
    }

    #updateStatusUI(element) {
        const status = element.querySelector('.device-display-sub-info .device-device-status');
        status.textContent = this.status;
    }

    #updateDeviceDisplay(element) {
        this.#updateSerialNameUI(element);
        this.#updateModelUI(element);
        this.#updateLastUpdatedUI(element);
        this.#updateStatusUI(element);
    }

    #addDevice() {
        totalDevices++;

        const template = document.getElementById("device-display-box-template");
        const container = document.getElementById("device-display-area");

        // Clone just the actual device box element
        const newCard = template.content.querySelector('.device-display-box').cloneNode(true);
        newCard.id = this.name; // Set the id to the device name
        this.#updateDeviceDisplay(newCard);
        container.appendChild(newCard);

        // Animate it after the frame renders
        animateNewCard(newCard);
    }

    removeDevice() {
        const element = document.getElementById(this.name);
        if (element) {
            totalDevices--;
            animateRemoveCard(element);
        }
    }
}

function toggleLED() {
    const command = ledState ? 'off' : 'on';
    fetch(`/led/${command}`)
        .then(response => response.text())
        .then(data => {
            console.log(data);
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
    if (ledState) {
        removeESP32Display();
    } else {
        const current_device = new DeviceDisplay('esp_name', 'esp32', '12-3-2024', 'connected');
        current_device.displayDevice();
    }
}

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

// Simulate updating sensor data (replace with actual sensor data update logic)
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

/*
socket.on('device_update', (data) => {
    const current_device = new DeviceDisplay(data.device_name, data.device_model, data.last_updated, data.status);
    current_device.displayDevice();
});
*/
// Poll every 2 seconds
/*
setInterval(updateValue, 2000);
*/