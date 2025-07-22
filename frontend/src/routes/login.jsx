import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion';
import styles from './modules/login.module.css'; // Adjust the path as needed
import { getLoginAPI } from '../api/flask/flaskapi'; // Adjust the import path as needed
import { user_id } from '../api/flask/flaskapi'; // Adjust the import path as needed
import NavigateWithBackTrack from "../backtrack"; // Import backtrack functionality if needed
import useNavigateWithBacktrack from '../backtrack';
// <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />

function LoginError({ error }) {
  if (!error) return null;
  return (
    <motion.div 
      className={styles.errorMessage}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p>{error}</p>
    </motion.div>
  );
}

function LoginBackgroundVideo({ handleVideoLoad }) {
  return (
    <video 
      autoPlay 
      loop 
      muted 
      className={styles["background-video"]}
      onLoadedData={handleVideoLoad}
      onCanPlay={handleVideoLoad}
    >
      <source src="/assets/login-background.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}

function LoginForm({ formData, handleChange, handleSubmit, error }) {
  return (
    <div className={styles.container}>
      <h2 className={styles['login-title']}>LOGIN</h2>
      <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
        <input
          type="text"
          name="login_user"
          placeholder="Username"
          autoComplete="off"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="login_pass"
          placeholder="Password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input type="submit" value="login" autoComplete='off'/>
      </form>
      <LoginError error={error} />
    </div>
  );
}

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
  const [isLoading, setIsLoading] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const nav = useNavigateWithBacktrack();

  const handleChange = e => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  // Handle video loading
  const handleVideoLoad = () => {
    setVideoLoaded(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500); // Small delay for smooth transition
  };

  // Fallback in case video doesn't load
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!videoLoaded) {
        setIsLoading(false);
      }
    }, 3000); // Maximum 3 seconds loading time

    return () => clearTimeout(timer);
  }, [videoLoaded]);

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
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      zIndex: isLoading ? 9999 : -1
    }}>
      {/* Loading Screen */}
      {isLoading && (
        <div className={styles["loading-screen"]}>
          <motion.div 
            className={styles["loading-content"]}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className={styles["spinner"]}></div>
            <h2 className={styles["loading-text"]}>Loading</h2>
          </motion.div>
        </div>
      )}

      {/* Main Login Page */}
      {!isLoading && (
        <motion.div
          className={styles['login-page']}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <LoginBackgroundVideo handleVideoLoad={handleVideoLoad} />
          <motion.div
            initial={{y: -50, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          >
            <LoginForm 
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              error={error}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
