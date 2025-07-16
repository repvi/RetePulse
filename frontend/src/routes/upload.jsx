import React, { useState } from 'react';
import './css/upload.css'; // Adjust the path as needed

export default function UploadFirmware() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    // Replace this URL with your API endpoint
    fetch('/upload', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          alert('Upload successful!');
        } else {
          alert('Upload failed.');
        }
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
        alert('Upload failed.');
      });
  };

  return (
    <div className="container">
      <h2>Upload Firmware</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="file"
          name="file"
          onChange={handleFileChange}
          required
        />
        <input type="submit" value="Upload" />
      </form>
    </div>
  );
}
