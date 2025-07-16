import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion';
import './css/login.css'; // Adjust the path as needed
import styles from './modules/login.module.css'; // Adjust the path as needed
import { getLoginAPI } from '../api/flask/flaskapi'; // Adjust the import path as needed
import backgroundImage from '../assets/login-background.jpg'; // Adjust the path as needed
import { user_id } from '../api/flask/flaskapi'; // Adjust the import path as needed
import NavigateWithBackTrack from "../backtrack"; // Import backtrack functionality if needed
import useNavigateWithBacktrack from '../backtrack';
import bgVideo from '../assets/login-background.mp4'; // Adjust the path as needed
// <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />

function loginfailedMessage() {
  return (
    <div className={styles.errorMessage}>
      <p>Login failed</p>
    </div>
  );
}

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [error, setError] = useState('');
  const nav = useNavigateWithBacktrack();

  const handleChange = e => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async e => {
    e.preventDefault();
    setError('')
    try {
      const { success, message } = await getLoginAPI(formData.username, formData.password);
      if (success) {
        nav('/dashboard'); // Use backtrack navigation
      } else {
        setError(message);
        formData.password = ''; // Clear password field on error
        formData.username = ''; // Clear username field on error
        loginfailedMessage(); // Display login failed message
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unexpected error');
    }
  }

  return (
    <div
      className={'login-page'}
      style={{
        position: 'relative', 
        background: 'none',
        overflow: 'hidden',
        // backgroundImage: `url(${backgroundImage})`,
        height: '100vh',
        backgroundSize: 'cover',
        backgroundPosition: 'top left',
        // backgroundRepeat: 'no-repeat',
        backgroundColor: 'transparent',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <video autoPlay loop muted className={styles["background-video"]}>
        <source src={bgVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <motion.div
        initial={{y: -50, opacity: 0}}
        animate={{y: 0, opacity: 1}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className={styles.container}>
          <h2>LOGIN</h2>
          <form onSubmit={handleSubmit} className="login-form">
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
            <input type="submit" value="login" autoComplete='off'/>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
