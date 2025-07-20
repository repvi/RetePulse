import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './css/upload.css'; // Adjust the path as needed
import styles from './modules/upload.module.css';

export default function UploadFirmware() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadStatus(''); // Clear previous status
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) return;

    setIsUploading(true);
    setUploadStatus('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadStatus('success');
        setFile(null);
        // Reset file input
        e.target.reset();
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div 
      className={styles['upload-page']}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className={styles['background-overlay']}></div>
      
      <motion.div 
        className={styles['upload-container']}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className={styles['upload-title']}>
            <span className={styles['upload-icon']}>📤</span>
            Upload Firmware
            <span className={styles['upload-icon']}>📤</span>
          </h2>
        </motion.div>

        <motion.div 
          className={styles['upload-card']}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className={styles['file-input-container']}>
              <label htmlFor="file-input" className={styles['file-input-label']}>
                <span className={styles['file-icon']}>📁</span>
                {file ? file.name : 'Choose firmware file...'}
                <span className={styles['browse-text']}>Browse</span>
              </label>
              <input
                id="file-input"
                type="file"
                name="file"
                onChange={handleFileChange}
                required
                className={styles['file-input-hidden']}
                accept=".bin,.hex,.elf"
              />
            </div>

            <motion.button
              type="submit"
              className={styles['upload-button']}
              disabled={!file || isUploading}
              whileHover={{ scale: file && !isUploading ? 1.02 : 1 }}
              whileTap={{ scale: file && !isUploading ? 0.98 : 1 }}
            >
              {isUploading ? (
                <>
                  <div className={styles['upload-spinner']}></div>
                  Uploading...
                </>
              ) : (
                <>
                  <span className={styles['button-icon']}>🚀</span>
                  Upload Firmware
                </>
              )}
            </motion.button>
          </form>

          {/* Status Messages */}
          {uploadStatus === 'success' && (
            <motion.div 
              className={styles['success-message']}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className={styles['status-icon']}>✅</span>
              Upload successful!
            </motion.div>
          )}

          {uploadStatus === 'error' && (
            <motion.div 
              className={styles['error-message']}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className={styles['status-icon']}>❌</span>
              Upload failed. Please try again.
            </motion.div>
          )}
        </motion.div>

        <motion.div 
          className={styles['back-button-container']}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link to="/dashboard" className={styles['back-button']}>
            <span className={styles['back-icon']}>←</span>
            Back to Dashboard
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
