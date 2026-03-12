// LocalWhisper Settings UI - JavaScript

// Engine change — fetch models for selected engine, update model dropdown
async function onEngineChange(engine) {
    const resp = await fetch(`/api/models?engine=${encodeURIComponent(engine)}`);
    if (!resp.ok) return;
    const data = await resp.json();
    const modelSelect = document.getElementById('model');
    modelSelect.innerHTML = '';
    for (const m of data.models) {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        modelSelect.appendChild(opt);
    }
    // Hide compute type for engines that don't use it
    const ctGroup = document.getElementById('compute-type-group');
    if (ctGroup) {
        ctGroup.style.display = engine === 'sensevoice' ? 'none' : '';
    }
    clearProfile();
}

// Profile quick-switcher
function applyProfile(profileKey) {
    if (!profileKey) return;
    const opt = document.querySelector(`#profile option[value="${profileKey}"]`);
    if (!opt) return;
    const engine = opt.dataset.engine || 'faster-whisper';
    const engineSelect = document.getElementById('engine');
    if (engineSelect && engineSelect.value !== engine) {
        engineSelect.value = engine;
        // Fetch new model list then set model value
        onEngineChange(engine).then(() => {
            document.getElementById('model').value = opt.dataset.model;
            document.getElementById('device').value = opt.dataset.device;
            document.getElementById('compute_type').value = opt.dataset.compute;
        });
    } else {
        document.getElementById('model').value = opt.dataset.model;
        document.getElementById('device').value = opt.dataset.device;
        document.getElementById('compute_type').value = opt.dataset.compute;
    }
}

function clearProfile() {
    // When user manually changes engine/model/device/compute, reset profile to "Custom"
    const profile = document.getElementById('profile');
    if (!profile) return;
    const engine = document.getElementById('engine') ? document.getElementById('engine').value : 'faster-whisper';
    const model = document.getElementById('model').value;
    const device = document.getElementById('device').value;
    const compute = document.getElementById('compute_type').value;
    // Check if current values match any profile
    let matched = false;
    for (const opt of profile.options) {
        if (opt.value
            && (opt.dataset.engine || 'faster-whisper') === engine
            && opt.dataset.model === model
            && opt.dataset.device === device
            && opt.dataset.compute === compute) {
            profile.value = opt.value;
            matched = true;
            break;
        }
    }
    if (!matched) profile.value = '';
}

// On page load: set initial compute-type visibility
document.addEventListener('DOMContentLoaded', function() {
    const toast = document.getElementById('toast');
    if (toast) {
        setTimeout(() => toast.style.display = 'none', 3000);
    }
    // Set initial compute-type visibility based on current engine
    const engineSelect = document.getElementById('engine');
    if (engineSelect) {
        const ctGroup = document.getElementById('compute-type-group');
        if (ctGroup && engineSelect.value === 'sensevoice') {
            ctGroup.style.display = 'none';
        }
    }
});

// Add custom word
async function addWord() {
    const input = document.getElementById('new-word');
    const word = input.value.trim();
    if (!word) return;

    const resp = await fetch('/api/custom-words', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({word: word})
    });

    if (resp.ok) {
        const list = document.getElementById('word-list');
        const tag = document.createElement('span');
        tag.className = 'word-tag';
        tag.innerHTML = `${word} <button type="button" class="delete-word" data-word="${word}" onclick="deleteWord('${word}')">&times;</button>`;
        list.appendChild(tag);
        input.value = '';
    }
}

// Delete custom word
async function deleteWord(word) {
    const resp = await fetch(`/api/custom-words/${encodeURIComponent(word)}`, {method: 'DELETE'});
    if (resp.ok) {
        const buttons = document.querySelectorAll(`.delete-word[data-word="${word}"]`);
        buttons.forEach(btn => btn.parentElement.remove());
    }
}

// Copy transcription text to clipboard
function copyText(btn) {
    const row = btn.closest('tr');
    const fullText = row.querySelector('.full-text').value;

    // Use textarea fallback — navigator.clipboard needs HTTPS on some browsers
    const ta = document.createElement('textarea');
    ta.value = fullText;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);

    btn.classList.add('copied');
    btn.innerHTML = '&#10003;';
    setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = '&#128203;';
    }, 1500);
}

// Restart the application to pick up new settings
async function restartApp() {
    const btn = document.getElementById('restart-btn');
    btn.disabled = true;
    btn.textContent = 'Restarting\u2026';
    try {
        await fetch('/api/restart', {method: 'POST'});
    } catch (e) {
        // Expected — server shuts down before responding
    }
    // Wait for server to come back up, then reload
    setTimeout(function poll() {
        fetch('/health').then(r => {
            if (r.ok) location.reload();
            else setTimeout(poll, 1000);
        }).catch(() => setTimeout(poll, 1000));
    }, 2000);
}

// Delete history entry
async function deleteEntry(id) {
    const resp = await fetch(`/api/history/${id}`, {method: 'DELETE'});
    if (resp.ok) {
        location.reload();
    }
}

// Allow Enter in word input
const wordInput = document.getElementById('new-word');
if (wordInput) {
    wordInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addWord();
        }
    });
}
