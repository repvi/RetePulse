import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import './css/login.css'; // Adjust the path as needed
import styles from './modules/login.module.css'; // Adjust the path as needed
import { getLoginAPI } from '../api/flask/flaskapi'; // Adjust the import path as needed
// <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [error, setError]       = useState('')
  const navigate                = useNavigate()


  const handleChange = e => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async e => {
    e.preventDefault();
    setError('')
    try {
      const { success, message } = await getLoginAPI(formData.username, formData.password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError(message);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unexpected error');
    }
  }

  return (
    <div className={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
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
