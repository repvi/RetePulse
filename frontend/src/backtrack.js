import React           from "react";
import { keyframes }   from "framer-motion";
import { useCallback }  from 'react';
import { useNavigate } from 'react-router-dom';

const key = 'backtrackURL';
const k = 'trueBacktrack';

export default function useNavigateWithBacktrack() {
  const navigate = useNavigate();
  return useCallback((url) => {
    const currentURL = localStorage.getItem(key);
    localStorage.setItem(k, currentURL || '/'); // Store the current URL before navigating
    localStorage.setItem(key, url);
    navigate(url);
  }, [navigate]);
}

export function getPreviousURL() {
  return localStorage.getItem(k) || '/';
}

export function failedURL() {
  const url = localStorage.getItem(k);
  localStorage.setItem(key, url || '/'); // Store the previous URL before redirecting
}