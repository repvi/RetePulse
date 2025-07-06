
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './css/comfirm.css'; // Adjust the path as needed
import styles from './modules/comfirm.module.css'; // Adjust the path as needed
import { getLoginAPI } from '../api/flask/flaskapi'; // Adjust the import path as needed
import backgroundImage from '../assets/login-background.jpg'; // Adjust the path as needed
import useNavigateWithBacktrack, { getPreviousURL } from "../backtrack";

// <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />

export function HasAccess() {

}

function loginfailedMessage() {
  return (
    <div className={'error-Message'}>
      <p>Comfirmation failed</p>
    </div>
  );
}

function ExitButton() {
  const navigateWithBack = useNavigateWithBacktrack();
  const prev = getPreviousURL();

  return (
    <button
      className={styles['exit-button']}
      onClick={() => navigateWithBack(prev)}
    >
      ✕
    </button>
  );
}

export default function ConfirmActionAdminPage() {
    const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [error, setError]       = useState('');
  const navigate                = useNavigateWithBacktrack();
  const [tries,   setTries]       = useState(0);

  const handleChange = e => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async e => {
    e.preventDefault();
    setError('')
    try {
      const { success, message } = await getLoginAPI(formData.username, formData.password);
      if (success) {
        // delete here
        setTries(0);
        const prev_url = getPreviousURL();
        navigate(prev_url);
      } 
      else if (tries < 3) {
        setError(message);
        formData.password = ''; // Clear password field on error
        formData.username = ''; // Clear username field on error
        loginfailedMessage(); // Display login failed message
        setTries(t => t + 1);
      }
      else {
        setTries(0);
        const prev_url = getPreviousURL();
        navigate(prev_url);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unexpected error');
    }
  }
  console.log('Login component rendered');

  return (
    <div
      className={styles['comfirm-page']}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        height: '100vh',
        backgroundSize: 'cover',
        backgroundPosition: 'top left',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{y: -50, opacity: 0}}
        animate={{y: 0, opacity: 1}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className={styles['container']}>
          <ExitButton/>
          <h2>Comfirm</h2>
          <form onSubmit={handleSubmit} className="comfirm-form">
            <input
              type="text"
              name="username"
              placeholder="Username"
              autoComplete="off"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="off"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input type="submit" value="Comfirm" autoComplete='off'/>
          </form>
        </div>
      </motion.div>
    </div>
  );
}