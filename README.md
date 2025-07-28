# RetePulse

RetePulse is an educational prototype for ESP32 device monitoring and OTA firmware updates. The project is open source and intended for learning and future development.

## Features
- Vite-based React frontend (`frontend/`)
- Python Flask backend (`backend/`)
- MQTT integration for device communication
- OTA firmware upload and management
- Modular, extensible codebase

# How to use the frontend and backend
 * cd backend, use the command venv\Scripts\activate, or create and then activate virtual environment for python code
 * open another terminal, use the command cd frontend. Then run the command npm run dev. 
   
# Login
In order to login. please use the following:
* username -> admin
* password -> password
## Folder Structure
```
fm_project/
├── README.md                # Main project documentation
├── main_config.json         # Main configuration file
├── backend/                 # Python Flask backend
│   ├── README.md            # Backend documentation
│   ├── DockerFIle           # Docker setup for backend
│   ├── requirements.txt     # Python dependencies
│   ├── run.py               # Backend entry point
│   ├── start_server.py      # Server startup script
│   ├── app/                 # Main Flask app
│   │   ├── README.md        # App documentation
│   │   ├── __init__.py      # App package init
│   │   ├── app.py           # Main Flask app logic
│   │   ├── app_instance.py  # App and DB instance
│   │   ├── config.py        # App config
│   │   ├── extensions.py    # Flask extensions
│   │   ├── routes/          # Auth and dashboard routes
│   │   ├── models/          # Database models
│   │   ├── services/        # Modular services
│   │   │   ├── ota/         # OTA update service
│   │   │   │   ├── README.md
│   │   │   │   ├── __init__.py
│   │   │   │   ├── ota.py
│   │   │   │   ├── ota_config.json
│   │   │   │   ├── firmware/      # Firmware upload folder
│   │   │   ├── mqtt/        # MQTT service
│   │   │   │   ├── __init__.py
│   │   │   │   ├── mqtt_service.py
│   │   │   │   ├── mqtt_config.json
│   │   │   │   ├── config.py
│   │   ├── utils/           # Utility functions
│   │   ├── config_module/   # Config helpers
│   │   ├── instance/        # Database instance
│   │   │   └── users.db
├── config/                  # Public config files
│   └── public_config.json
├── frontend/                # Vite React frontend
│   ├── README.md            # Frontend documentation
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.js/mjs   # Vite config
│   ├── index.html           # Main HTML
│   ├── public/              # Static assets
│   ├── src/                 # React source code
│   │   ├── App.jsx, App.css
│   │   ├── api/flask/       # API calls to backend
│   │   ├── routes/          # React routes (dashboard, login, upload, etc.)
│   │   ├── componenets/     # UI components
│   │   ├── assets/          # Frontend assets
│   │   ├── auth/            # Auth logic
│   │   ├── backtrack.js     # Utility
│   │   ├── config.js        # Frontend config
│   │   ├── index.jsx/css    # Entry point
│   │   ├── reportWebVitals.js
│   │   ├── setupTests.js
```

## Usage
- Backend: See `backend/README.md` for setup and running instructions
- Frontend: See `frontend/README.md` for setup and running instructions

## .env Files
All `.env` files in this project are public and for educational purposes only.

## Prototype Status
This project is currently a prototype. It is not production-ready, but has potential to become open source software for ESP32 monitoring.

## Educational Purpose
This project is designed for learning and experimentation. It demonstrates:
- Full-stack development with React and Flask
- Device monitoring and OTA update workflows
- Modular code organization
- Open source best practices

## License
MIT revpi 2025

# Other Software
What to have your esp32s connect to the softw3are? Check out [RetePulse Connect](https://github.com/repvi/RetePulse-Connect)
