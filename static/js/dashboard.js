const socket = io('http://localhost:5000');

let totalDevices = 0;
let ledState = false; // Initial LED state is off

window.onload = function() {
    document.getElementById('toggle-button').onclick = toggleLED;
};

class device_info {
    constructor(name, model, last_updated, status) {
        this.name = name;
        this.model = model;
        this.last_updated = last_updated;
        this.status = status;
    }

    addDevice() {
        totalDevices++;

        const template = document.getElementById("device-display-box-template");
        const container = document.getElementById("device-display-area");

        // Clone just the actual device box element
        const newCard = template.content.querySelector('.device-display-box').cloneNode(true);
        newCard.id = this.name;
        // Add to page (still hidden)
        container.appendChild(newCard);

        // Animate it after the frame renders
        animateNewCard(newCard);
    }
}
function animateNewCard(element) {
  gsap.fromTo(element, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.3 });
}

function animateRemoveCard(element) {
    gsap.fromTo(element, { opacity: 1, x: 0 }, { opacity: 1, x: -30, duration: 0.3 });
}

function addESP32Display() {
    totalDevices++;

    const template = document.getElementById("device-display-box-template");
    const container = document.getElementById("device-display-area");

    // Clone just the actual device box element
    const newCard = template.content.querySelector('.device-display-box').cloneNode(true);

    // Add to page (still hidden)
    container.appendChild(newCard);

    // Animate it after the frame renders
    animateNewCard(newCard);
}

function removeESP32Display() {
    const element = document.getElementById('dummy');
    if (element) {
        if (totalDevices > 0) {
            totalDevices--;
            animateRemoveCard(element);
            element.remove();
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
    if (ledState) {
        removeESP32Display();
        button.classList.remove('off');
    } else {
        addESP32Display();
        button.classList.add('off');
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

socket.on('device_update', (data) => {
    const name = document.getElementById(data.device_name);
    if (name) { /* element id name exists */ 
        
    }
    else {
        
    }
});

// Poll every 2 seconds
setInterval(updateValue, 2000);