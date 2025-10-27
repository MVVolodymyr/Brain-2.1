// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// 1. ІМПОРТ ДЛЯ АУТЕНТИФІКАЦІЇ
import { withAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';

// 2. ГОЛОВНИЙ КОМПОНЕНТ (ОТРИМУЄ ПРОПСИ signOut та user ВІД withAuthenticator)
function App({ signOut, user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [error, setError] = useState('');

  // API Configuration
  const API_ENDPOINT = 'https://6v0qdpjqq3.execute-api.us-east-1.amazonaws.com/Staging/events';

  // Get authentication headers
  const getAuthHeaders = () => {
    const idToken = localStorage.getItem('idToken');
    if (!idToken) {
      throw new Error("Автентифікаційний токен не знайдено.");
    }
    return { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    };
  };

  // Load events from API
  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const headers = getAuthHeaders();
      console.log('Fetching events from:', API_ENDPOINT);
      console.log('Headers:', { ...headers, 'Authorization': 'Bearer [TOKEN]' });
      
      const response = await fetch(API_ENDPOINT, {
        method: 'GET',
        headers: headers,
      });

      console.log('Response status:', response.status);
      console.log('Response OK:', response.ok);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('idToken');
          signOut();
          return;
        }
        throw new Error(`Помилка отримання даних: ${response.status} ${response.statusText}`);
      }

      let eventsData = await response.json();
      
      // Parse if string
      if (typeof eventsData === 'string') {
        try { eventsData = JSON.parse(eventsData); } catch (e) { eventsData = []; }
      }
      if (!Array.isArray(eventsData)) { eventsData = []; }
      
      // Sort by creation date (newest first)
      eventsData.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      setEvents(eventsData);

    } catch (error) {
      console.error("Помилка завантаження івентів:", error);
      setError(`Помилка завантаження: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [signOut]);

  // Create new event
  const createEvent = async (e) => {
    e.preventDefault();
    if (!newEventName.trim()) {
      setError("Будь ласка, введіть назву події.");
      return;
    }

    try {
      const headers = getAuthHeaders();
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ name: newEventName.trim() }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('idToken');
          signOut();
          return;
        }
        throw new Error(`Помилка сервера: ${response.status} ${response.statusText}`);
      }
      
      setNewEventName('');
      loadEvents(); // Reload events
      setError('');

    } catch (error) {
      console.error("Помилка створення івенту:", error);
      setError(`Помилка створення івенту: ${error.message}`);
    }
  };

  // Delete event
  const deleteEvent = async (id, name) => {
    if (!window.confirm(`Ви впевнені, що хочете видалити подію "${name}" (ID: ${id})? Це також видалить файли в S3.`)) {
      return;
    }
    
    try {
      const headers = getAuthHeaders();
      const url = `${API_ENDPOINT}/${id}`;
      const response = await fetch(url, { 
        method: 'DELETE',
        headers: headers
      });

      if (!response.ok) { 
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('idToken');
          signOut();
          return;
        }
        throw new Error(`Помилка сервера: ${response.status} ${response.statusText}`); 
      }
      
      alert(`Подію "${name}" успішно видалено.`);
      loadEvents(); // Reload events

    } catch (error) {
      console.error("Помилка видалення івенту:", error);
      alert(`Не вдалося видалити подію: ${error.message}.`);
    }
  };

  // Open game with event data
  const openGame = (event) => {
    // Store event data in sessionStorage
    sessionStorage.setItem('selectedEvent', JSON.stringify({
      id: event.id,
      name: event.name,
      link_to_csv: event.link_to_csv,
      link_to_json: event.link_to_json,
      created_date: event.created_date,
      last_update: event.last_update
    }));
    
    // Navigate to game page with event ID in URL
    window.location.href = `/Brain-2.1/game/${event.id}`;
  };

  // Format date
  const formatDate = (dateString) => {
    const formatOptions = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleString('uk-UA', formatOptions);
  };

  // Load events on component mount
  useEffect(() => {
    if (user) {
      console.log('User object:', user);
      
      // Get the ID token using fetchAuthSession
      fetchAuthSession()
        .then((session) => {
          console.log('Auth session:', session);
          
          // Get the ID token from the session
          const idToken = session.tokens?.idToken?.toString();
          console.log('ID Token found:', idToken ? 'Yes' : 'No');
          
          if (idToken) {
            localStorage.setItem('idToken', idToken);
            console.log('Token stored in localStorage');
            
            // Load events after token is stored
            loadEvents();
          } else {
            console.error('No ID token found in session', session);
            setError('Не вдалося отримати токен автентифікації. Спробуйте вийти та увійти знову.');
          }
        })
        .catch(error => {
          console.error('Error getting auth session:', error);
          setError('Помилка автентифікації: ' + error.message);
        });
    }
  }, [user, loadEvents]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="navigation">
          <h1>Brain 2.0 - Event Management</h1>
          <div className="nav-links">
            <a href="/Brain-2.1/game/" className="nav-link">🎮 Game</a>
            <button onClick={signOut} className="nav-link logout-btn">🚪 Logout</button>
          </div>
        </div>
        
        {/* Create Event Form */}
        <form onSubmit={createEvent} className="create-event-form">
          <input 
            type="text" 
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
            placeholder="Введіть назву нової події" 
            required 
            className="event-name-input"
          />
          <button type="submit" className="add-btn">+</button>
        </form>
      </header>

      <main className="App-main">
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading">Завантаження...</div>
        ) : (
          <div className="events-container">
            <div className="events-header">
              <div className="header-cell">Event name</div>
              <div className="header-cell">Created</div>
              <div className="header-cell">Last modified</div>
              <div className="header-cell">Дії</div>
            </div>
            
            {events.length === 0 ? (
              <div className="no-events">Жодної події не знайдено.</div>
            ) : (
              events.map(event => (
                <div key={event.id} className="event-row">
                  <div className="event-cell event-name" onClick={() => openGame(event)}>
                    {event.name || 'N/A'}
                  </div>
                  <div className="event-cell">{formatDate(event.created_date)}</div>
                  <div className="event-cell">
                    {event.last_update ? formatDate(event.last_update) : formatDate(event.created_date)}
                  </div>
                  <div className="event-cell">
                    <button 
                      className="delete-btn" 
                      onClick={() => deleteEvent(event.id, event.name)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// 3. ЕКСПОРТ (Обгортаємо App компонентом withAuthenticator)
// Це забезпечує відображення форм входу/реєстрації, якщо користувач не увійшов.
export default withAuthenticator(App);