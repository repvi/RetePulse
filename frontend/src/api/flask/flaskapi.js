import React, { useEffect, useState } from "react";
import config from "./config";
// Connect to the backend Socket.IO server
//const socket = io('http://localhost:5000');

const token_key = 'access_token';
let ledState = false; // Initial LED state is off

export async function getLoginAPI(username, password) {
    const url = `${config.API_URL}/auth/login`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        })

     const data = await res.json();
        if (res.ok && data.access_token) {
            // Store the token in localStorage or a cookie
            localStorage.setItem(token_key, data.access_token);
            return { success: true, message: 'Login successful' };
        }
        else {
            return { success: false, message: data.message || 'Login failed' };
        }
    } catch (error) {
        console.error('Error in getLoginAPI:', error);
    }
}

export async function getLogoutAPI() {
    
}

export async function getRegisterAPI(username, password, user_role) {
    const url = `${config.API_URL}/auth/register`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password, user_role})
        })

     const data = await res.json();
        if (res.ok && data.access_token) {
            // Store the token in localStorage or a cookie
            localStorage.setItem(token_key, data.access_token);
            return { success: true, message: 'Registration successful' };
        }
        else {
            return { success: false, message: data.message || 'Registration failed' };
        }
    } catch (error) {
        console.error('Error in getRegisterAPI:', error);
    }
}
/*
function getRegisteredDevicesAPI() {
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
}

function toggleLedAPI() {
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

function updateValue() {
    fetch('/get_value')
        .then(response => response.json())
        .then(data => {
            document.getElementById('display').textContent = "Value: " + data.value;
        });
}

socket.on('device_update', (data) => {
    device = getDeviceType(data);

    const current_device = new DeviceDisplay(data.device_name, data.device_model, data.last_updated, data.status, device);
    current_device.displayDevice();
});
*/