import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 1. Імпортуємо Amplify
import { Amplify } from 'aws-amplify';

// 2. ІМПОРТУЄМО ПОВНУ ЗГЕНЕРОВАНУ КОНФІГУРАЦІЮ
// Цей файл містить всі необхідні секції, включаючи 'oauth'.
import awsconfig from './aws-exports'; 

// 3. Передаємо повний об'єкт конфігурації в Amplify
Amplify.configure(awsconfig); 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);