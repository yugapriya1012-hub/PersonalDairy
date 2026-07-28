const API_BASE = "http://localhost:8000/api";

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initThemeToggle();
    initDate();
    loadDashboard();
    // initVoice();
});

// --- UI Logic ---
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-links li');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Remove active from all
            navLinks.forEach(n => n.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active-page'));
            
            // Add active to clicked
            link.classList.add('active');
            const pageId = link.getAttribute('data-page') + '-page';
            document.getElementById(pageId).classList.add('active-page');

            // Load specific page data
            if(pageId === 'diary-page') {
                if (typeof renderDiaryDashboard === 'function') renderDiaryDashboard();
            }
            else if(pageId === 'expenses-page') loadExpenses();
            else if(pageId === 'challenges-page') {
                loadChallengeHistory();
                loadChallengePage();
            }
        });
    });
}

function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    const html = document.documentElement;
    btn.addEventListener('click', () => {
        if(html.getAttribute('data-theme') === 'dark') {
            html.setAttribute('data-theme', 'light');
            btn.innerHTML = '<i class="fa-solid fa-sun"></i> Theme';
        } else {
            html.setAttribute('data-theme', 'dark');
            btn.innerHTML = '<i class="fa-solid fa-moon"></i> Theme';
        }
    });
}

function initDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', options);
    const dateInput = document.getElementById('diary-date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
}

// --- Dashboard ---
async function loadDashboard() {
    try {
        // Quote
        let quoteRes = await fetch(`${API_BASE}/quote`);
        if(quoteRes.ok) {
            let quoteData = await quoteRes.json();
            document.getElementById('daily-quote').innerText = `"${quoteData.quote}"`;
        }

        // Challenge
        loadChallenge();

        // Tracker Stats for today
        let today = new Date().toISOString().split('T')[0];
        let trackerRes = await fetch(`${API_BASE}/tracker/${today}`);
        if(trackerRes.ok) {
            let trackerData = await trackerRes.json();
            document.getElementById('stat-score').innerText = `${trackerData.productivity_score}/10`;
            document.getElementById('stat-study').innerText = `${trackerData.study_hours} hrs`;
        }

        // Streak
        let streakRes = await fetch(`${API_BASE}/streak`);
        if(streakRes.ok) {
            let streakData = await streakRes.json();
            document.getElementById('stat-streak').innerText = `${streakData.streak} days`;
        }
    } catch(e) {
        console.error("API error", e);
    }
}

async function loadChallenge() {
    try {
        document.getElementById('creative-challenge').innerText = "Loading...";
        let res = await fetch(`${API_BASE}/challenge`);
        let data = await res.json();
        document.getElementById('creative-challenge').innerText = data.challenge;
    } catch(e) {
        console.error(e);
    }
}

// --- Creative Challenges Page ---
function openChallengePage() {
    document.querySelector('.nav-links li[data-page="challenges"]').click();
}

async function loadChallengePage() {
    document.getElementById('current-challenge-text').innerText = "Loading AI challenge...";
    try {
        let res = await fetch(`${API_BASE}/challenge`);
        let data = await res.json();
        document.getElementById('current-challenge-text').innerText = data.challenge;
    } catch(e) {
        console.error(e);
    }
}

async function submitChallenge() {
    const responseInput = document.getElementById('challenge-response-input').value;
    const challengeText = document.getElementById('current-challenge-text').innerText;
    
    if(!responseInput) return alert("Please write a response first!");
    
    try {
        let res = await fetch(`${API_BASE}/completed_challenge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                challenge_text: challengeText,
                response_text: responseInput
            })
        });
        if(res.ok) {
            document.getElementById('challenge-response-input').value = '';
            alert("Challenge completed and saved!");
            loadChallengeHistory();
            loadChallengePage(); // get a new one
        }
    } catch(e) {
        console.error(e);
    }
}

async function loadChallengeHistory() {
    try {
        let res = await fetch(`${API_BASE}/completed_challenges`);
        if(res.ok) {
            let entries = await res.json();
            const container = document.getElementById('challenge-history');
            container.innerHTML = '';
            entries.forEach(entry => {
                container.innerHTML += `
                    <div class="glass-card" style="margin-top: 15px;">
                        <p class="date-text">${new Date(entry.date).toLocaleDateString()}</p>
                        <p style="font-weight: 500; margin-bottom: 5px;"><i class="fa-solid fa-star" style="color: gold;"></i> ${entry.challenge_text}</p>
                        <p style="color: var(--text-secondary);">${entry.response_text}</p>
                    </div>
                `;
            });
        }
    } catch(e) {
        console.error(e);
    }
}

// --- Diary & Voice ---
function previewImage(event) {
    const preview = document.getElementById('diary-image-preview');
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'none';
        preview.src = '';
    }
}

async function loadDiary() {
    let res = await fetch(`${API_BASE}/diary`);
    if(res.ok) {
        let entries = await res.json();
        const container = document.getElementById('diary-history');
        container.innerHTML = '';
        entries.forEach(entry => {
            const div = document.createElement('div');
            div.className = "glass-card";
            div.style.marginTop = "15px";
            
            const imgHtml = entry.image_path ? `<img src="${entry.image_path}" style="max-width: 100%; border-radius: 8px; margin-top: 10px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.2);">` : '';
            
            div.innerHTML = `
                <div class="entry-header">
                    <strong>${new Date(entry.date).toLocaleDateString()}</strong>
                    <span class="mood-badge ${entry.mood ? entry.mood.toLowerCase() : 'neutral'}">${entry.mood || 'Neutral'}</span>
                </div>
                <p>${entry.content}</p>
                ${imgHtml}
                <div class="entry-summary"><i class="fa-solid fa-bolt"></i> ${entry.summary}</div>
            `;
            container.appendChild(div);
        });
    }
}

async function saveDiary() {
    const input = document.getElementById('diary-input');
    const dateInput = document.getElementById('diary-date');
    if(!input.value) return;

    let payload = { content: input.value };
    if (dateInput && dateInput.value) {
        payload.date = dateInput.value;
    }

    const imageInput = document.getElementById('diary-image');
    if (imageInput && imageInput.files.length > 0) {
        const formData = new FormData();
        formData.append("file", imageInput.files[0]);
        try {
            let imgRes = await fetch(`${API_BASE}/upload`, {
                method: 'POST',
                body: formData
            });
            if (imgRes.ok) {
                let imgData = await imgRes.json();
                payload.image_path = imgData.image_path;
            }
        } catch(e) {
            console.error("Image upload failed:", e);
        }
    }

    try {
        let res = await fetch(`${API_BASE}/diary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if(res.ok) {
            input.value = '';
            const imageInput = document.getElementById('diary-image');
            if(imageInput) imageInput.value = '';
            const preview = document.getElementById('diary-image-preview');
            if(preview) { preview.style.display = 'none'; preview.src = ''; }
            alert("Entry saved successfully!");
            loadDiary();
        } else {
            let errorText = await res.text();
            console.error("Failed to save diary:", errorText);
            alert("Error saving diary: " + errorText);
        }
    } catch (e) {
        console.error("Network error:", e);
        alert("Network error: " + e.message);
    }
}

function initVoice() {
    const btn = document.getElementById('voice-btn');
    const input = document.getElementById('diary-input');
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        btn.addEventListener('click', () => {
            recognition.start();
            btn.innerHTML = '<i class="fa-solid fa-microphone-slash" style="color:red;"></i> Listening...';
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            input.value += (input.value ? ' ' : '') + transcript;
            btn.innerHTML = '<i class="fa-solid fa-microphone"></i> Voice Note';
        };

        recognition.onerror = (event) => {
            btn.innerHTML = '<i class="fa-solid fa-microphone"></i> Voice Note';
            console.error("Speech recognition error:", event.error);
            alert("Voice Note Error: " + event.error + ". Make sure you are using Chrome/Edge, running on localhost, and have granted microphone permissions.");
        };
    } else {
        btn.style.display = 'none'; // Not supported
        alert("Your browser does not support Voice Notes. Try Google Chrome.");
    }
}

// --- Planner ---
async function generatePlan() {
    const subject = document.getElementById('subject-input').value;
    const date = document.getElementById('exam-date-input').value;
    
    if(!subject || !date) return alert("Please fill subject and date");
    
    document.getElementById('planner-result').style.display = 'block';
    document.getElementById('plan-text').innerText = "Generating AI plan... Please wait.";

    let res = await fetch(`${API_BASE}/planner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject, exam_date: date })
    });

    if(res.ok) {
        let data = await res.json();
        document.getElementById('plan-text').innerText = data.plan_text;
    }
}

// --- Tracker ---
async function saveTracker() {
    let payload = {
        date: new Date().toISOString().split('T')[0],
        study_hours: parseFloat(document.getElementById('t-study').value),
        workout_minutes: parseInt(document.getElementById('t-workout').value),
        sleep_hours: parseFloat(document.getElementById('t-sleep').value),
        water_glasses: parseInt(document.getElementById('t-water').value),
        productivity_score: parseInt(document.getElementById('t-prod').value)
    };

    let res = await fetch(`${API_BASE}/tracker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if(res.ok) {
        alert("Tracker updated!");
        loadDashboard();
    }
}

// --- Expenses ---
async function loadExpenses() {
    let res = await fetch(`${API_BASE}/expenses`);
    if(res.ok) {
        let expenses = await res.json();
        const container = document.getElementById('expense-list');
        container.innerHTML = '';
        let total = 0;
        expenses.forEach(e => {
            total += e.amount;
            container.innerHTML += `
                <div class="glass-card" style="margin-top: 10px; display: flex; justify-content: space-between;">
                    <div>
                        <strong>${e.category}</strong>
                        <p class="date-text" style="font-size:0.8em">${e.description || 'No description'}</p>
                    </div>
                    <div>
                        <h3 class="gradient-text">$${e.amount.toFixed(2)}</h3>
                    </div>
                </div>
            `;
        });
        document.getElementById('stat-expense').innerText = `$${total.toFixed(2)}`;
    }
}

async function addExpense() {
    let amount = parseFloat(document.getElementById('exp-amount').value);
    let category = document.getElementById('exp-category').value;
    let desc = document.getElementById('exp-desc').value;

    if(!amount) return;

    let res = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            amount: amount,
            category: category,
            description: desc,
            date: new Date().toISOString().split('T')[0]
        })
    });

    if(res.ok) {
        document.getElementById('exp-amount').value = '';
        document.getElementById('exp-desc').value = '';
        loadExpenses();
        loadDashboard(); // update dashboard stats
    }
}
