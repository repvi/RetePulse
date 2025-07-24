# OTA Service Documentation

This folder contains the OTA (Over-The-Air) update service for RetePulse.

## Features
- Firmware upload endpoint (`/ota/upload`)
- Stores firmware files in `firmware/` subfolder
- Validates file extensions and size
- Triggers MQTT update notifications

## Usage
- Upload firmware via frontend or API
- All uploaded files are saved in this folder

## Prototype Status
This OTA service is currently a prototype for educational and open-source ESP32 monitoring. It is not production-ready.

## See Also
- [Backend README](../../../../README.md)
