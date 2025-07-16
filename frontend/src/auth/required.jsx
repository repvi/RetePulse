import React from 'react';
import { Navigate } from 'react-router-dom';
import { user_id, id_type } from '../api/flask/flaskapi'; // Adjust the import path as needed
import { getPreviousURL, failedURL } from '../backtrack'; // Adjust the import path as needed

export function RequireAdmin({children}) {
    const id = localStorage.getItem(user_id);
    if (id === id_type.admin) {
        failedURL(); // Store the current URL before redirecting
        const prev_url = getPreviousURL();
        console.log('Admin access denied, redirecting to:', prev_url);
        return <Navigate to={prev_url} />;
    }
    console.log('Admin access granted');
    return children;
}