# Backend Documentation

This folder contains the Python Flask backend for RetePulse.

## Features
- Flask-based API for device monitoring and OTA updates
- MQTT integration for device communication
- Modular service structure (auth, dashboard, OTA, MQTT)
- Configuration via JSON files

## Usage
- Run with `python run.py` from the backend directory
- All firmware uploads are stored in `app/services/ota/firmware`

## Prototype Status
This backend is currently a prototype for educational and open-source ESP32 monitoring. It is not production-ready.

## See Also
- [Main README](../README.md)
- [OTA Service Documentation](app/services/ota/README.md)
