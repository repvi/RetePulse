import React, { useState } from 'react';
import './css/register.css'; // Adjust the path as needed

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    user_role: '2' // Default to "Viewer"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Replace with your API endpoint or handle logic here
    console.log('Submitting form:', formData);
  };

  return (
    <div className="container">
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
          onChange={handleChange}
        >
          <option value="2">Viewer</option>
          <option value="1">Moderator</option>
        </select>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
