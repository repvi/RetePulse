import React, { useState } from 'react';
import './css/login.css'; // Adjust the path as needed
import styles from './modules/login.module.css'; // Adjust the path as needed
// <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can handle login logic here (e.g., API call)
    console.log('Logging in with:', formData);
  };

  return (
    <div className={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
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
        <input type="submit" value="Login" autoComplete='off'/>
      </form>
    </div>
  );
}
