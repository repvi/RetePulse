import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { getRegisterAPI } from '../api/flask/flaskapi'; // Adjust the import path as needed
import styles from './modules/register.module.css'; // Adjust the path as needed

export default function Register() {
  const [formData, setFormData] = useState({username: '', password: '', user_role: '2' /* Default to "Viewer" */});
  const [error, setError]       = useState('');
  const navigate                = useNavigate();

   const handleChange = e => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value, user_role: f.user_role }))
  }

  const handleRoleChange = e => {
    setFormData(f => ({ ...f, user_role: e.target.value }));
  }

  const handleSubmit =  async (e) => {
    e.preventDefault();
    setError('')
    try {
      const { success, message } = await getRegisterAPI(formData.username, formData.password, formData.user_role);
      if (success) {
        navigate('/dashboard');
      } else {
        setError(message);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unexpected error');
    }
  };

  return (
    <div className={styles.container}>
      <h2>Register</h2>
      <h3>Add user</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          autoComplete="new-username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <label htmlFor="user_role">Choose role:</label>
        <select
          id="user_role"
          name="user_role"
          value={formData.user_role}
          onChange={handleRoleChange}
        >
          <option value="2">Viewer</option>
          <option value="1">Moderator</option>
        </select>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
