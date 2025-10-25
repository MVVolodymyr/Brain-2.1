// src/App.js
import React from 'react';
import './App.css'; // Припустимо, цей файл існує для базових стилів

// 1. ІМПОРТ ДЛЯ АУТЕНТИФІКАЦІЇ
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css'; // Стилі для форм Amplify

// 2. ГОЛОВНИЙ КОМПОНЕНТ (ОТРИМУЄ ПРОПСИ signOut та user ВІД withAuthenticator)
function App({ signOut, user }) {
  // Redirect to events.html after successful login
  React.useEffect(() => {
    if (user) {
      // Store the authentication token for the events page
      const idToken = user.signInUserSession?.idToken?.jwtToken;
      if (idToken) {
        localStorage.setItem('idToken', idToken);
      }
      // Redirect to events page
      window.location.href = '/events.html';
    }
  }, [user]);

  return (
    <div className="App">
      <header className="App-header">
        
        {/* ======================================================= */}
        {/* ЗАХИЩЕНИЙ КОНТЕНТ (ВИДНО ЛИШЕ ПІСЛЯ ВХОДУ)  */}
        {/* ======================================================= */}
        <h1>Перенаправлення...</h1>
        <p>Ви успішно авторизувалися через AWS Cognito.</p>
        <p>Перенаправляємо на сторінку подій...</p>
        
        {/* Кнопка ВИХОДУ, використовує функцію, передану Amplify */}
        <button 
          onClick={signOut} 
          style={{ 
            marginTop: '20px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Вийти з системи
        </button>
        {/* ======================================================= */}
        
      </header>
    </div>
  );
}

// 3. ЕКСПОРТ (Обгортаємо App компонентом withAuthenticator)
// Це забезпечує відображення форм входу/реєстрації, якщо користувач не увійшов.
export default withAuthenticator(App);