import React, { useEffect, useState } from "react";
import config from "./config";
import * as load_device from "../../componenets/DeviceDisplayUI/deviceLoad"
import { data } from "react-router-dom";
// Connect to the backend Socket.IO server
//const socket = io('http://localhost:5000');

let deviceArray = [];

const token_key = 'access_token';
// let ledState = false; // Initial LED state is off

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

/**
 * Fetch the list of registered devices.
 * @returns {Promise<Array<Object>>} Resolves to an array of device objects.
 */
export async function getRegisteredDevicesAPI() {
    const url = `${config.API_URL}/load/devices`;
    try {
        console.log('Fetching registered devices from:', url);
        const res = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({devices: deviceArray})
        })

        console.log('Response status:', res.status);

        let devices = await res.json();
        if (res.ok && devices.deviceArray) {
            console.log('Devices fetched successfully:', devices.deviceArray);
            return devices.deviceArray;
        } else {
            console.error('Failed to fetch devices:', devices.message || 'Unknown error');
            console.warn('No device array found');
            return [];
        }
    } catch (error) {
        console.error('Error in getRegisteredDevicesAPI:', error);
        return [];
    }
}
/*
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
            document.getaeById('display').textContent = "Value: " + data.value;
        });
}

socket.on('device_update', (data) => {
    device = getDeviceType(data);

    const current_device = new DeviceDisplay(data.device_name, data.device_model, data.last_updated, data.status, device);
    current_device.displayDevice();
});
*/