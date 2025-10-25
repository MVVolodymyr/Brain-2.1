// =================================================================
// script.js - ОНОВЛЕНА ВЕРСІЯ З GET, POST, DELETE та АВТЕНТИФІКАЦІЄЮ
// =================================================================

// *** КОНФІГУРАЦІЯ ТА ID ЕЛЕМЕНТІВ ***
const API_ENDPOINT = 'https://6v0qdpjqq3.execute-api.us-east-1.amazonaws.com/Staging/events'; 

const EVENT_LIST_CONTAINER = document.getElementById('event-list-container');
const CREATE_EVENT_FORM = document.getElementById('create-event-form');
const EVENT_NAME_INPUT = document.getElementById('event-name-input');


// -----------------------------------------------------------------
// 0. ДОПОМІЖНА ФУНКЦІЯ: ОТРИМАННЯ ЗАГОЛОВКІВ З АВТЕНТИФІКАЦІЄЮ
// -----------------------------------------------------------------
function getAuthHeaders() {
    const idToken = localStorage.getItem('idToken');
    if (!idToken) {
        // Якщо токену немає, логіка DOMContentLoaded перенаправить користувача
        // Ми все одно викидаємо помилку, щоб зупинити запит fetch
        throw new Error("Автентифікаційний токен не знайдено."); 
    }
    
    return { 
        'Content-Type': 'application/json',
        'Authorization': idToken // <-- ОСНОВНА ЗМІНА: Додаємо токен Cognito
    };
}


// -----------------------------------------------------------------
// 1. ФУНКЦІЯ: ОТРИМАННЯ ТА ВІДОБРАЖЕННЯ ДАНИХ (GET)
// -----------------------------------------------------------------
async function loadEvents() {
    console.log("Завантаження даних...");
    
    if (!EVENT_LIST_CONTAINER) {
        console.error("Контейнер списку подій не знайдено (ID: event-list-container).");
        return;
    }

    const headerRow = EVENT_LIST_CONTAINER.querySelector('.header-row') ? EVENT_LIST_CONTAINER.querySelector('.header-row').outerHTML : '';
    
    // Встановлюємо індикатор завантаження
    EVENT_LIST_CONTAINER.innerHTML = headerRow + '<div id="loading-indicator" class="table-row data-row"><div class="cell event-name-col" style="grid-column: 1 / span 4;">Завантаження...</div></div>';

    try {
        const headers = getAuthHeaders(); // <-- ВИКОРИСТОВУЄМО АВТОРИЗАЦІЮ
        
        const response = await fetch(API_ENDPOINT, {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            // При 401/403 (Unauthorized/Forbidden) очистимо токен і перезавантажимо
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('idToken');
                window.location.href = '/Brain-2.1/'; // Перенаправлення на логін
                return;
            }
            throw new Error(`Помилка отримання даних: ${response.status} ${response.statusText}`);
        }

        let events = await response.json();
        
        // Перевірка та парсинг (якщо відповідь приходить рядком, хоча має бути об'єктом)
        if (typeof events === 'string') {
            try { events = JSON.parse(events); } catch (e) { events = []; }
        }
        if (!Array.isArray(events)) { events = []; }
        
        // СОРТУВАННЯ: Найновіші перші
        events.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

        // Очищення контейнера та додавання заголовка
        EVENT_LIST_CONTAINER.innerHTML = headerRow; 

        if (events.length === 0) {
            EVENT_LIST_CONTAINER.innerHTML += '<div class="table-row data-row"><div class="cell event-name-col" style="grid-column: 1 / span 4;">Жодної події не знайдено.</div></div>';
            return;
        }

        events.forEach(event => {
            // Форматування дати
            const formatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
            const createdDate = new Date(event.created_date).toLocaleString('uk-UA', formatOptions);
            const lastUpdate = event.last_update ? new Date(event.last_update).toLocaleString('uk-UA', formatOptions) : createdDate;
            
            const row = document.createElement('div');
            row.className = 'table-row data-row clickable-row';
            row.style.cursor = 'pointer';
            
            // Add click handler to open game in new tab with event data
            row.onclick = (e) => {
                // Prevent click when clicking on delete button
                if (e.target.classList.contains('action-btn') || e.target.closest('.action-btn')) {
                    return;
                }
                // Store event data in sessionStorage for the game page to access
                sessionStorage.setItem('selectedEvent', JSON.stringify({
                    id: event.id,
                    name: event.name,
                    link_to_csv: event.link_to_csv,
                    link_to_json: event.link_to_json,
                    created_date: event.created_date,
                    last_update: event.last_update
                }));
                // Open game page in new tab (ПРИПУЩЕННЯ: '/game' існує)
                window.open('/Brain-2.1/game', '_blank');
            };

            row.innerHTML = `
                <div class="cell event-name-col">${event.name || 'N/A'}</div>
                <div class="cell created-col">${createdDate}</div>
                <div class="cell modified-col">${lastUpdate}</div>
                <div class="cell actions-col delete-action">
                    <button class="action-btn delete-btn" onclick="handleDeleteEvent('${event.id}', '${(event.name || 'N/A').replace(/'/g, "\\'")}')">🗑️</button>
                </div>
            `;
            
            EVENT_LIST_CONTAINER.appendChild(row);
        });

    } catch (error) {
        console.error("Помилка завантаження івентів:", error);
        // Якщо токен не знайдено, помилку обробляє DOMContentLoaded.
        // Якщо інша помилка:
        if (error.message.includes("Автентифікаційний токен")) return;
        EVENT_LIST_CONTAINER.innerHTML = headerRow + `<div class="table-row data-row"><div class="cell event-name-col" style="grid-column: 1 / span 4;">Помилка завантаження: ${error.message}</div></div>`;
    }
}


// -----------------------------------------------------------------
// 2. ФУНКЦІЯ: ВИДАЛЕННЯ ЕЛЕМЕНТА (DELETE)
// -----------------------------------------------------------------
window.handleDeleteEvent = async function(id, name) {
    if (!confirm(`Ви впевнені, що хочете видалити подію "${name}" (ID: ${id})? Це також видалить файли в S3.`)) { return; }
    
    try {
        const headers = getAuthHeaders(); // <-- ВИКОРИСТОВУЄМО АВТОРИЗАЦІЮ
        
        // Запит DELETE на endpoint: /events/{id}
        const url = `${API_ENDPOINT}/${id}`;
        const response = await fetch(url, { 
            method: 'DELETE',
            headers: headers // <-- ДОДАНО: Заголовки
        });

        if (!response.ok) { 
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('idToken');
                window.location.href = '/Brain-2.1/';
                return;
            }
            throw new Error(`Помилка сервера: ${response.status} ${response.statusText}`); 
        }
        
        alert(`Подію "${name}" успішно видалено.`);
        loadEvents(); // Перезавантажуємо список після успішного видалення

    } catch (error) {
        console.error("Помилка видалення івенту:", error);
        alert(`Не вдалося видалити подію: ${error.message}.`);
    }
}


// -----------------------------------------------------------------
// 3. ФУНКЦІЯ: СТВОРЕННЯ НОВОГО ЕЛЕМЕНТА (POST)
// -----------------------------------------------------------------
if (CREATE_EVENT_FORM) {
    CREATE_EVENT_FORM.onsubmit = async (event) => {
        event.preventDefault();
        
        const eventName = EVENT_NAME_INPUT.value.trim();
        if (!eventName) { alert("Будь ласка, введіть назву події."); return; }

        try {
            const headers = getAuthHeaders(); // <-- ВИКОРИСТОВУЄМО АВТОРИЗАЦІЮ

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: headers, // <-- ДОДАНО: Заголовки
                body: JSON.stringify({ name: eventName }),
            });

            if (!response.ok) { 
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('idToken');
                    window.location.href = '/Brain-2.1/';
                    return;
                }
                throw new Error(`Помилка сервера: ${response.status} ${response.statusText}`); 
            }
            
            EVENT_NAME_INPUT.value = ''; 
            loadEvents(); 

        } catch (error) {
            console.error("Помилка створення івенту:", error);
            alert(`Помилка створення івенту: ${error.message}`);
        }
    };
}


// -----------------------------------------------------------------
// 4. ФУНКЦІЯ ВИХОДУ З СИСТЕМИ
// -----------------------------------------------------------------
window.signOut = function() {
    if (confirm('Ви впевнені, що хочете вийти з системи?')) {
        // Очищаємо токен
        localStorage.removeItem('idToken');
        // Перенаправляємо на головну сторінку
        window.location.href = '/Brain-2.1/';
    }
};

// -----------------------------------------------------------------
// 5. ІНІЦІАЛІЗАЦІЯ З ПЕРЕВІРКОЮ АВТЕНТИФІКАЦІЇ
// -----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // 1. Перевірка токену Cognito в localStorage
    const idToken = localStorage.getItem('idToken');
    
    if (!idToken) {
        console.log("Токен не знайдено. Перенаправлення на сторінку логіну.");
        // Якщо токену немає, перенаправити на сторінку логіну
        window.location.href = '/Brain-2.1/'; // <-- ОСНОВНА ЗМІНА: Перенаправлення
        return; 
    }
    
    // 2. Якщо токен є, завантажуємо дані
    loadEvents();
});