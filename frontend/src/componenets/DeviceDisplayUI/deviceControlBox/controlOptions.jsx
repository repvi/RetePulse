import React, { useState } from "react";
import styles from "./controlOptions.module.css"; // Adjust the path as needed

function GPIOConfigOptions({ onConfigComplete, onReset }) {
  const [pinNumber, setPinNumber] = useState('');
  const [direction, setDirection] = useState('');

  // Reset function to clear all fields
  const resetConfig = () => {
    setPinNumber('');
    setDirection('');
  };

  // Expose reset function to parent
  React.useImperativeHandle(onReset, () => ({
    reset: resetConfig
  }), []);

  // Check if config is complete and notify parent
  React.useEffect(() => {
    const isComplete = pinNumber !== '' && direction !== '';
    onConfigComplete(isComplete);
  }, [pinNumber, direction, onConfigComplete]);

  return (
    <div className={styles["gpio-config-options"]}>
      <div className={styles["gpio-config-field"]}>
        <label htmlFor="gpio-pin">Pin Number:</label>
        <input
          type="number"
          id="gpio-pin"
          name="gpio-pin"
          min="0"
          max="39"
          placeholder="0-38"
          value={pinNumber}
          onChange={(e) => setPinNumber(e.target.value)}
        />
      </div>
      
      <div className={styles["gpio-config-field"]}>
        <label htmlFor="gpio-direction">Direction:</label>
        <select 
          id="gpio-direction" 
          name="gpio-direction"
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
        >
          <option value="" disabled hidden>-- Select Direction --</option>
          <option value="input">Input</option>
          <option value="output">Output</option>
        </select>
      </div>
    </div>
  );
}

function GPIOSetStateOptions({ onStateComplete, onReset }) {
  const [isOn, setIsOn] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(true);
  
  // Reset function to clear state
  const resetState = () => {
    setIsOn(false);
    setHasInteracted(true);
  };

  // Expose reset function to parent
  React.useImperativeHandle(onReset, () => ({
    reset: resetState
  }), []);
  
  const toggleState = () => {
    setIsOn(!isOn);
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  // Notify parent when state is complete (user has interacted with the button)
  React.useEffect(() => {
    onStateComplete(hasInteracted);
  }, [hasInteracted, onStateComplete]);

  return (
    <div className={styles["gpio-set-state-options"]}>
      <span>GPIO Set State Options</span>
      <div className={styles["gpio-state-buttons"]}>
        <button 
          type="button" 
          className={styles["gpio-state-button"]}
          value={isOn ? "on" : "off"}
          onClick={toggleState}
        >
          {isOn ? "On" : "Off"}
        </button>
      </div>
    </div>
  );
}

function GPIOControlOptions({ onGPIOComplete, onReset }) {
  const [gpioOption, setGpioOption] = useState('');
  const [configComplete, setConfigComplete] = useState(false);
  const [stateComplete, setStateComplete] = useState(false);
  const configResetRef = React.useRef();
  const stateResetRef = React.useRef();
  
  // Reset function to clear all GPIO options
  const resetGPIOOptions = () => {
    setGpioOption('');
    setConfigComplete(false);
    setStateComplete(false);
    // Reset child components if they exist
    if (configResetRef.current) {
      configResetRef.current.reset();
    }
    if (stateResetRef.current) {
      stateResetRef.current.reset();
    }
  };

  // Expose reset function to parent
  React.useImperativeHandle(onReset, () => ({
    reset: resetGPIOOptions
  }), []);
  
  const handleGpioOptionChange = (e) => {
    setGpioOption(e.target.value);
    // Reset completion states when changing options
    setConfigComplete(false);
    setStateComplete(false);
  };

  // Check if current GPIO option is complete
  const isGPIOComplete = () => {
    if (gpioOption === 'configure') return configComplete;
    if (gpioOption === 'state') return stateComplete;
    return false;
  };

  // Notify parent when GPIO completion status changes
  React.useEffect(() => {
    onGPIOComplete(isGPIOComplete());
  }, [gpioOption, configComplete, stateComplete, onGPIOComplete]);

  return (
    <div className={styles["gpio-control-options"]}>
      <div className={styles["gpio-option-field"]}>
        <label htmlFor="gpio-option">GPIO Option:</label>
        <select 
          id="gpio-option" 
          name="gpio-option"
          value={gpioOption}
          onChange={handleGpioOptionChange}
        >
          <option value="">-- Select Option --</option>
          <option value="configure">Configure</option>
          <option value="state">State</option>
        </select>
      </div>

      {gpioOption === 'configure' && (
        <GPIOConfigOptions 
          onConfigComplete={setConfigComplete} 
          onReset={configResetRef}
        />
      )}
      {gpioOption === 'state' && (
        <GPIOSetStateOptions 
          onStateComplete={setStateComplete} 
          onReset={stateResetRef}
        />
      )}
    </div>
  );
}

export function controlDeviceOptions({name}) {
  const [formData, setFormData] = useState({ device_control: '' });
  const [error, setError] = useState('');
  const [gpioComplete, setGpioComplete] = useState(false);
  const gpioResetRef = React.useRef();
  
  const handleDeviceControlChange = e => {
    setFormData(f => ({ ...f, device_control: e.target.value }));
    // Reset GPIO completion when changing main control
    setGpioComplete(false);
  }

  const handleSubmit =  async (e) => {
    e.preventDefault();
    setError('')
    try {
      // api to send a message to the device through mqtt in the backend
      
      // Reset all form values after successful submission
      setFormData({ device_control: '' });
      setGpioComplete(false);
      
      // Reset GPIO options if they exist
      if (gpioResetRef.current) {
        gpioResetRef.current.reset();
      }
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unexpected error');
    }
  };

  // Determine if submit button should be shown
  const shouldShowSubmitButton = () => {
    if (formData.device_control === 'restart') return true;
    if (formData.device_control === 'gpio' && gpioComplete) return true;
    return false;
  };

  return (
    <div className={styles["device-control-box"]}>
      <form onSubmit={handleSubmit}>
        <label className={styles["device-control-label"]}>
          <select
            id="device_control"
            name="device_control"
            placeholder="Not provided"
            value={formData.device_control}
            onChange={handleDeviceControlChange}
          >
            {formData.device_control === '' && (
              <option value="" disabled hidden>
                Select Control
              </option>
            )}
            <option value=""></option>
            <option value="gpio">GPIO</option>
            <option value="restart">Restart</option>
          </select>
        </label>
        
        {formData.device_control === 'gpio' && (
          <GPIOControlOptions 
            onGPIOComplete={setGpioComplete} 
            onReset={gpioResetRef}
          />
        )}
        
        {shouldShowSubmitButton() && (
          <button type="submit" className={styles["device-control-button"]}>
            Send
          </button>
        )}
      </form>
    </div>
  );
}