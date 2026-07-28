// diary.js
// Standalone logic for the AI Diary Web App MVP

let diaryEntries = JSON.parse(localStorage.getItem('ai_diary_entries')) || [];
let currentTags = [];
let mediaRecorder;
let audioChunks = [];
let audioBlob = null;
let currentImageBase64 = null;
let isRecording = false;

document.addEventListener('DOMContentLoaded', () => {
    initDiary();
});

function initDiary() {
    // Set default date
    const dateInput = document.getElementById('diary-date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Initialize geolocation and weather
    fetchLocationAndWeather();

    // Mood Selector setup
    const moodEmojis = document.querySelectorAll('.mood-emoji');
    const moodInput = document.getElementById('diary-mood');
    moodEmojis.forEach(emoji => {
        emoji.addEventListener('click', () => {
            moodEmojis.forEach(e => e.classList.remove('active'));
            emoji.classList.add('active');
            if (moodInput) moodInput.value = emoji.getAttribute('data-mood');
        });
    });

    // Tags setup
    const tagsInput = document.getElementById('diary-tags-input');
    if (tagsInput) {
        tagsInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tag = this.value.trim().toLowerCase().replace(/^#/, '');
                if (tag && !currentTags.includes(tag)) {
                    currentTags.push(tag);
                    renderTags();
                }
                this.value = '';
            }
        });
    }

    renderDiaryDashboard();
}

async function fetchLocationAndWeather() {
    const locSpan = document.getElementById('diary-location');
    const weatherSpan = document.getElementById('diary-weather');
    
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            locSpan.innerHTML = `<i class="fa-solid fa-location-dot"></i> Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
            
            try {
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                const data = await res.json();
                const temp = data.current_weather.temperature;
                weatherSpan.innerHTML = `<i class="fa-solid fa-cloud-sun"></i> ${temp}°C`;
            } catch (e) {
                weatherSpan.innerHTML = `<i class="fa-solid fa-cloud-sun"></i> Weather unavailable`;
            }
        }, () => {
            locSpan.innerHTML = `<i class="fa-solid fa-location-dot"></i> Location denied`;
            weatherSpan.innerHTML = `<i class="fa-solid fa-cloud-sun"></i> Weather unavailable`;
        });
    }
}

function formatDoc(cmd, value=null) {
    document.execCommand(cmd, false, value);
    document.getElementById('diary-input').focus();
}

function renderTags() {
    const container = document.getElementById('diary-tags-container');
    container.innerHTML = '';
    currentTags.forEach(tag => {
        const pill = document.createElement('div');
        pill.className = 'tag-pill';
        pill.innerHTML = `#${tag} <span class="remove-tag" onclick="removeTag('${tag}')"><i class="fa-solid fa-xmark"></i></span>`;
        container.appendChild(pill);
    });
}

function removeTag(tagToRemove) {
    currentTags = currentTags.filter(t => t !== tagToRemove);
    renderTags();
}

function previewDiaryImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImageBase64 = e.target.result;
            document.getElementById('diary-image-preview').src = currentImageBase64;
            document.getElementById('image-preview-container').style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
}

function removeDiaryImage() {
    currentImageBase64 = null;
    document.getElementById('diary-image').value = '';
    document.getElementById('image-preview-container').style.display = 'none';
}

function toggleVoiceRecord() {
    const btn = document.getElementById('diary-voice-btn');
    const text = document.getElementById('voice-btn-text');
    
    if (!isRecording) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                isRecording = true;
                btn.style.color = '#ff4757';
                text.innerText = 'Recording... (Click to stop)';
                
                mediaRecorder.ondataavailable = e => {
                    audioChunks.push(e.data);
                };
                
                mediaRecorder.onstop = () => {
                    audioBlob = new Blob(audioChunks, { 'type' : 'audio/ogg; codecs=opus' });
                    audioChunks = [];
                    const audioUrl = window.URL.createObjectURL(audioBlob);
                    document.getElementById('diary-audio-preview').src = audioUrl;
                    document.getElementById('voice-preview-container').style.display = 'flex';
                };
            }).catch(e => {
                alert("Microphone access denied or unavailable.");
            });
    } else {
        mediaRecorder.stop();
        isRecording = false;
        btn.style.color = '';
        text.innerText = 'Record Voice';
    }
}

function removeDiaryVoice() {
    audioBlob = null;
    document.getElementById('voice-preview-container').style.display = 'none';
}

async function callOpenAI(promptText, systemPrompt) {
    const apiKey = localStorage.getItem('openai_api_key') || 'mock_key'; 
    if (apiKey === 'mock_key') {
        console.warn("No OpenAI API key found. Using mock response.");
        return "This is a mock AI response. Please set your API key in Settings.";
    }

    try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: promptText }
                ]
            })
        });
        const data = await res.json();
        return data.choices[0].message.content;
    } catch(e) {
        console.error("AI API Error:", e);
        return "AI is currently unavailable.";
    }
}

async function generateAIPrompt() {
    const editor = document.getElementById('diary-input');
    const promptText = await callOpenAI("Give me one thought-provoking journaling prompt for today.", "You are a helpful journaling assistant. Return only the prompt string.");
    editor.innerHTML += `<strong>AI Prompt:</strong> ${promptText}<br><br>`;
}

async function saveDiaryEntry() {
    const contentHtml = document.getElementById('diary-input').innerHTML.trim();
    if (!contentHtml || contentHtml === '<br>') {
        alert("Please write something before saving.");
        return;
    }

    const date = document.getElementById('diary-date').value;
    const mood = document.getElementById('diary-mood').value;
    const btn = document.getElementById('save-diary-btn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving & Analyzing...';
    btn.disabled = true;

    // AI Analysis (Summary & Reflection)
    const plainText = document.getElementById('diary-input').innerText;
    
    let summary = "A brief thought.";
    let reflection = "Keep up the good work!";
    
    if (plainText.length > 10) {
        let analysis = await callOpenAI(`Analyze this diary entry:\n\n${plainText}`, "You are an empathetic AI. Return a JSON object with two fields: 'summary' (a 1-line summary) and 'reflection' (a warm 2-line advice/reflection).");
        try {
            // Strip markdown formatting if AI returned ```json ... ```
            analysis = analysis.replace(/^```json\s*/, '').replace(/```$/, '');
            const parsed = JSON.parse(analysis);
            summary = parsed.summary || summary;
            reflection = parsed.reflection || reflection;
        } catch(e) {
            reflection = analysis;
        }
    }

    // Voice to Base64 (simplified for MVP local storage)
    let audioBase64 = null;
    if (audioBlob) {
        audioBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => resolve(reader.result);
        });
    }

    const entry = {
        id: Date.now().toString(),
        date,
        mood,
        content: contentHtml,
        plainText,
        tags: [...currentTags],
        image: currentImageBase64,
        audio: audioBase64,
        summary,
        reflection,
        timestamp: Date.now()
    };

    diaryEntries.unshift(entry);
    localStorage.setItem('ai_diary_entries', JSON.stringify(diaryEntries));

    // Show AI Insights
    document.getElementById('ai-summary').querySelector('span').innerText = summary;
    document.getElementById('ai-reflection').querySelector('span').innerText = reflection;
    document.getElementById('ai-reflection-area').style.display = 'block';

    // Reset Form
    document.getElementById('diary-input').innerHTML = '';
    currentTags = [];
    renderTags();
    removeDiaryImage();
    removeDiaryVoice();
    
    btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Save Entry & Analyze';
    btn.disabled = false;

    renderDiaryDashboard();
}

function renderDiaryDashboard(searchQuery = '') {
    renderMiniCalendar();
    
    const container = document.getElementById('diary-history');
    container.innerHTML = '';
    
    // Get active tag filters
    const activeTags = Array.from(document.querySelectorAll('.filter-pill.active')).map(el => el.innerText.replace('#', '').trim());

    let filtered = diaryEntries;
    
    if (searchQuery) {
        filtered = filtered.filter(e => e.plainText.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    if (activeTags.length > 0) {
        filtered = filtered.filter(e => activeTags.some(t => e.tags.includes(t)));
    }

    filtered.forEach(entry => {
        const moodEmojiMap = {
            'excellent': '🤩',
            'good': '😊',
            'neutral': '😐',
            'bad': '😔',
            'terrible': '😭'
        };

        const hasImage = entry.image ? `<img src="${entry.image}" class="diary-card-thumb">` : '';
        const hasAudio = entry.audio ? `<div style="margin-top: 10px;"><audio src="${entry.audio}" controls style="height: 30px; width: 100%;"></audio></div>` : '';
        const tagsHtml = entry.tags.map(t => `<span class="tag-pill" style="font-size: 0.7rem; padding: 2px 6px;">#${t}</span>`).join('');
        
        const card = document.createElement('div');
        card.className = 'diary-entry-card';
        card.innerHTML = `
            <div class="diary-card-header">
                <span class="diary-card-date">${new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}</span>
                <span class="diary-card-mood">${moodEmojiMap[entry.mood] || '😐'}</span>
            </div>
            <div class="diary-card-body">
                ${hasImage}
                <div style="flex:1;">
                    <div class="diary-card-snippet">${entry.content}</div>
                    ${hasAudio}
                </div>
            </div>
            <div style="display: flex; gap: 5px; flex-wrap: wrap; margin-top: 5px;">${tagsHtml}</div>
            <div class="diary-card-footer">
                <span style="font-size: 0.8rem; color: var(--accent-color); font-weight: 500;"><i class="fa-solid fa-bolt"></i> ${entry.summary}</span>
                <div class="card-actions">
                    <button class="delete-btn" onclick="deleteDiaryEntry('${entry.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    
    renderTagFilters();
}

function filterDiaryEntries() {
    const q = document.getElementById('diary-search').value;
    renderDiaryDashboard(q);
}

function toggleTagFilter(tag, element) {
    element.classList.toggle('active');
    filterDiaryEntries();
}

function renderTagFilters() {
    const container = document.getElementById('diary-filter-tags');
    // Keep track of active tags before re-rendering
    const activeTags = Array.from(document.querySelectorAll('.filter-pill.active')).map(el => el.innerText.replace('#', '').trim());
    
    const allTags = [...new Set(diaryEntries.flatMap(e => e.tags))];
    container.innerHTML = '';
    
    allTags.forEach(tag => {
        const pill = document.createElement('div');
        pill.className = `tag-pill filter-pill ${activeTags.includes(tag) ? 'active' : ''}`;
        pill.innerText = `#${tag}`;
        pill.onclick = function() { toggleTagFilter(tag, this); };
        container.appendChild(pill);
    });
}

function deleteDiaryEntry(id) {
    if(confirm("Delete this entry?")) {
        diaryEntries = diaryEntries.filter(e => e.id !== id);
        localStorage.setItem('ai_diary_entries', JSON.stringify(diaryEntries));
        renderDiaryDashboard(document.getElementById('diary-search').value);
    }
}

function renderMiniCalendar() {
    const cal = document.getElementById('diary-mini-calendar');
    cal.innerHTML = '';
    
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    days.forEach(d => {
        const el = document.createElement('div');
        el.className = 'cal-day-header';
        el.innerText = d;
        cal.appendChild(el);
    });
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const entryDates = diaryEntries.map(e => e.date);
    
    // Padding
    for(let i=0; i<firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'cal-day empty';
        cal.appendChild(empty);
    }
    
    // Days
    for(let i=1; i<=daysInMonth; i++) {
        const dateStr = `${currentYear}-${(currentMonth+1).toString().padStart(2,'0')}-${i.toString().padStart(2,'0')}`;
        const dayEl = document.createElement('div');
        dayEl.className = 'cal-day';
        if (entryDates.includes(dateStr)) {
            dayEl.classList.add('has-entry');
        }
        dayEl.innerText = i;
        cal.appendChild(dayEl);
    }
}
