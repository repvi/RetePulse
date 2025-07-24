import React, { useEffect, useState } from "react";
import { FLASK_URL, SOCKETIO_URL } from "./config";
import { io } from 'socket.io-client';
import { prettyDOM } from "@testing-library/dom";

export const token_key = 'access_token';
export const user_id = 'user_id';

export const id_type = Object.freeze({
  admin: 1,
  viewer: 2,
});

function getFullFLaskURL(route) {
    return `${FLASK_URL}${route}`;
}

// let ledState = false; // Initial LED state is off

export async function getLoginAPI(username, password) {
    console.log(FLASK_URL);
    const url = getFullFLaskURL('/auth/login');
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
            localStorage.setItem(user_id, data.id);
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
    const url = getFullFLaskURL('/auth/register');
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
    const url = getFullFLaskURL('/load/devices');
    try {
        console.log('Fetching registered devices from:', url);
        const res = await fetch(url, {
            method: 'POST',
            cache: "no-store",  // Prevent cached responses
            headers: {'Content-Type': 'application/json'},
            // body: JSON.stringify({devices: deviceArray})
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

export function useSocketIOConnect(setDevices) {
  useEffect(() => {
    // create the socket with reconnection enabled
    const socket = io(SOCKETIO_URL, {
      reconnection: true,                // default is true
      reconnectionAttempts: Infinity,    // keep trying
      reconnectionDelay: 1000,           // initial delay
      transports: ["websocket"]          // use WebSocket only
    });

    socket.on("connect", () => {
      console.log("Socket connected: ", socket.id);
    });

    socket.on("device_update", data => {
        // if the server ever sends strings, parse them; otherwise data is already an object
        const payload = typeof data === "string" ? JSON.parse(data) : data;
        const updatedDevice = {
            name:         payload.device_name,  // map device_name → name
            model:        payload.device_model, // map device_model → model
            status:       payload.status,
            sensor_type:  payload.sensor_type,
            last_updated: payload.last_updated
        };
        console.log("Received device update:", updatedDevice);
        console.log("device name:", updatedDevice.name);
    
        setDevices(devs => {
            devs.forEach((d, i) => {
                console.log(`devs[${i}].name =`, d.name);
            });         // match on the same field your server emits (here: device_name)

            const idx = devs.findIndex(d => d.name === updatedDevice.name);

            if (idx > -1) {
                // update that one entry (no duplicate)
                const next = [...devs];
                next[idx] = { ...next[idx], ...updatedDevice };
                return next;
            }

            return [...devs, updatedDevice];
        });
    });

    socket.on("device_delete_update", data => {
        const payload = typeof data === "string" ? JSON.parse(data) : data; 
        console.log("Here 1");

        if (payload.name) {
            console.log("Here 2");

            setDevices(devs => devs.filter(d => d.name !== payload.name));
        }
    });

    socket.on('device_status_update', data => {
        const payload = typeof data === "string" ? JSON.parse(data) : data;
        console.log("Device status update received:", payload);

        if (payload.name && payload.status) {
            setDevices(devs => {
                return devs.map(d => {
                    if (d.name === payload.name) {
                        return { ...d, status: payload.status };
                    }
                    return d;
                });
            });
        }
    })

    socket.on("disconnect", reason => {
      console.warn("Socket disconnected:", reason);
    });

    // clean up on unmount
    return () => {
      socket.off("device_update");
      socket.disconnect();
    };
  }, [setDevices]);  // run once
}

export async function removeDeviceFromDB(name) {
    const url = `${FLASK_URL}/db/delete`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name})
        })

        const data = await res.json();

        return { success: true, message: 'Login successful' };
    } catch (error) {
        console.error("Error in removeDeviceFromDB: ", error);
    }
}

export async function controlDeviceAPI(name, command, additionalData = {}) {
    const url = `${FLASK_URL}/device/control`;
    try {
        const payload = {
            name,
            command,
            ...additionalData
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        // Backend returns 204 No Content, so no JSON to parse
        return { success: true, message: 'Control command sent successfully' };
    } catch (error) {
        console.error("Error in controlDeviceAPI:", error);
        return { success: false, message: error.message || 'Failed to send control command' };
    }
}

export async function sendUpdateFile(file, model) {
    // Use relative URL for proxy compatibility
    const url = getFullFLaskURL('/ota/upload');
    const formData = new FormData();
    formData.append('file', file); // file is from <input type="file" />
    formData.append('model_string', model); // any extra data

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return { success: true, message: 'File uploaded successfully' };
    } catch (error) {
        console.error('Error uploading file:', error);
        return { success: false, message: error.message || 'Failed to upload file' };
    }
}