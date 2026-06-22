import React from 'react';

const Logo = ({ className = '', style = {} }) => (
  <svg 
    className={className}
    style={{ ...style }}
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    aria-label="GitHub Analyzer Logo"
  >
    <defs>
      <linearGradient id="logoBgGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2563EB" />
        <stop offset="1" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#logoBgGrad)" />
    <path d="M11 22L5 16L11 10" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 22L27 16L21 10" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 18L14 11L18 15L24 8" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 8H24V14" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default Logo;
