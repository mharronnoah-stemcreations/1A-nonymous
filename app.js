/**
 * 1A-nonymous | NGL Toad Anonymous Messaging
 * Clean, emoji-free integration with Supabase, retro Web Audio, and NGL features.
 */

// ================= CONFIGURATION =================
const SUPABASE_CONFIG = {
  url: 'https://ujhisqxsixqrqpjjeaaj.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqaGlzcXhzaXhxcnFwamplYWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1NDUxNzQsImV4cCI6MjExMDEyMTE3NH0.2f3HkhIhLZTjNYJdluzvx7Bae35uXlj4zrf7SVAVPGc',
  tableName: 'messages'
};

// Initialize Supabase client if CDN is available
let supabaseClient = null;
try {
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.log('Supabase initialized with client library');
  }
} catch (err) {
  console.warn('Supabase SDK initialization warning:', err);
}

// ================= AUDIO SYNTHESIZER & BACKGROUND MUSIC =================
class RetroAudio {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('toad_sound_muted') === 'true';
    this.bgMusic = null;
    this.initBgMusic();
    this.updateIcon();
  }

  initBgMusic() {
    // Hidden audio element (no mini player)
    this.bgMusic = document.getElementById('bg-music');
    if (!this.bgMusic) {
      this.bgMusic = new Audio('musica/SUPER%20MARIO%20RUN%20(OFFICIAL%20TRAP%20REMIX)%20-%20(320%20Kbps).mp3');
      this.bgMusic.id = 'bg-music';
      this.bgMusic.style.display = 'none';
      document.body.appendChild(this.bgMusic);
    }
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.45;

    const tryPlayMusic = () => {
      if (!this.muted && this.bgMusic && this.bgMusic.paused) {
        this.bgMusic.play().catch(() => {
          // Browser autoplay restriction, will trigger on first interaction
        });
      }
    };

    // Attempt autoplay immediately
    tryPlayMusic();

    // Browser policy fallback: play on first user interaction (click, touch, key)
    const onFirstUserInteraction = () => {
      this.init();
      tryPlayMusic();
      window.removeEventListener('click', onFirstUserInteraction);
      window.removeEventListener('touchstart', onFirstUserInteraction);
      window.removeEventListener('keydown', onFirstUserInteraction);
    };

    window.addEventListener('click', onFirstUserInteraction, { passive: true });
    window.addEventListener('touchstart', onFirstUserInteraction, { passive: true });
    window.addEventListener('keydown', onFirstUserInteraction, { passive: true });
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.muted = !this.muted;
    localStorage.setItem('toad_sound_muted', this.muted);
    this.updateIcon();

    if (this.bgMusic) {
      if (this.muted) {
        this.bgMusic.pause();
      } else {
        this.bgMusic.play().catch(() => {});
        this.playCoin();
      }
    } else if (!this.muted) {
      this.playCoin();
    }
  }

  updateIcon() {
    const onIcon = document.getElementById('sound-on-icon');
    const offIcon = document.getElementById('sound-off-icon');
    if (onIcon && offIcon) {
      if (this.muted) {
        onIcon.classList.add('hidden');
        offIcon.classList.remove('hidden');
      } else {
        onIcon.classList.remove('hidden');
        offIcon.classList.add('hidden');
      }
    }
  }

  // Mario Coin Sound: B5 (987.77 Hz) -> E6 (1318.51 Hz)
  playCoin() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(987.77, t);
      osc.frequency.setValueAtTime(1318.51, t + 0.08);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.45);
    } catch (e) {}
  }

  // Jump Sound: Quick pitch sweep up
  playJump() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.18);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.2);
    } catch (e) {}
  }

  // Dice Roll click / pop
  playDice() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.08);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) {}
  }
}

const audio = new RetroAudio();

// ================= PROMPTS LIST (NO EMOJIS) =================
const PROMPTS = [
  "Send me anonymous messages!",
  "Tell me something you've never told anyone...",
  "Who is your secret crush in class 1-A?",
  "What's your honest first impression of me?",
  "Drop a hot take you'd never say out loud!",
  "Give me a song recommendation that reminds you of me",
  "What is my biggest green flag or red flag?",
  "Ask me anything, no filter!",
  "Rate my vibe from 1 to 10",
  "One secret you will take to Princess Peach's castle",
  "If you could spend one whole day with me, what would we do?",
  "What's something you secretly admire about me?",
  "Confess something you did in school that nobody caught!",
  "Drop your funniest memory of 1-A",
  "What superpower do you wish I had?"
];

// ================= TOAD QUOTES (NO EMOJIS) =================
const TOAD_QUOTES = [
  "Psst! Tell me anything! Your secret is 100% safe with me!",
  "I'm Toad! I keep all your secrets locked in the castle vault!",
  "Nobody knows who sent this, I promise!",
  "Thank you! But our secret is in another castle!",
  "Hit me with your best confessions!",
  "Tap the dice to roll a new question!",
  "100% anonymous! Your identity is completely safe!",
  "Speak your heart out! 1A-nonymous never tells!"
];

// ================= STATE =================
let currentPromptIndex = 0;
let isDbConnected = false;
let localMessages = JSON.parse(localStorage.getItem('toad_messages_cache') || '[]');

// ================= DOM ELEMENTS =================
const sendView = document.getElementById('send-view');
const inboxView = document.getElementById('inbox-view');
const tabSendBtn = document.getElementById('tab-send-btn');
const tabInboxBtn = document.getElementById('tab-inbox-btn');
const soundToggleBtn = document.getElementById('sound-toggle-btn');
const openCreditsBtn = document.getElementById('open-credits-btn');
const creditsModal = document.getElementById('credits-modal');
const closeCreditsModal = document.getElementById('close-credits-modal');

const toadAvatar = document.getElementById('toad-avatar');
const toadImg = document.getElementById('toad-img');
const speechQuote = document.getElementById('speech-quote');

const diceRollBtn = document.getElementById('dice-roll-btn');
const currentPromptText = document.getElementById('current-prompt-text');
const nglForm = document.getElementById('ngl-form');
const messageInput = document.getElementById('message-input');
const charCounter = document.getElementById('char-counter');
const sendBtn = document.getElementById('send-btn');
const copyLinkBtn = document.getElementById('copy-link-btn');

const successOverlay = document.getElementById('success-overlay');
const sendAnotherBtn = document.getElementById('send-another-btn');
const viewInboxFromSuccess = document.getElementById('view-inbox-from-success');

const refreshInboxBtn = document.getElementById('refresh-inbox-btn');
const messagesList = document.getElementById('messages-list');
const dbStatusBanner = document.getElementById('db-status-banner');
const statusDot = document.getElementById('status-dot');
const dbStatusText = document.getElementById('db-status-text');
const inboxCountBadge = document.getElementById('inbox-count');

const toastContainer = document.getElementById('toast-container');
const shareCardModal = document.getElementById('share-card-modal');
const closeStoryModal = document.getElementById('close-story-modal');
const storyPrompt = document.getElementById('story-prompt');
const storyText = document.getElementById('story-text');
const copyStoryTextBtn = document.getElementById('copy-story-text-btn');

// ================= TOAST NOTIFICATION =================
function showToast(message, type = 'normal') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ================= TAB NAVIGATION =================
function switchTab(tab) {
  if (tab === 'send') {
    sendView.classList.add('active');
    inboxView.classList.remove('active');
    tabSendBtn.classList.add('active');
    tabInboxBtn.classList.remove('active');
  } else if (tab === 'inbox') {
    inboxView.classList.add('active');
    sendView.classList.remove('active');
    tabInboxBtn.classList.add('active');
    tabSendBtn.classList.remove('active');
    fetchMessages();
  }
}

tabSendBtn.addEventListener('click', () => switchTab('send'));
tabInboxBtn.addEventListener('click', () => switchTab('inbox'));

// ================= SOUND TOGGLE =================
soundToggleBtn.addEventListener('click', () => {
  audio.toggle();
  showToast(audio.muted ? 'Sound muted' : 'Sound enabled', 'normal');
});

// ================= MASCOT INTERACTIONS =================
toadAvatar.addEventListener('click', () => {
  audio.playJump();

  // Change quote randomly
  const randomQuote = TOAD_QUOTES[Math.floor(Math.random() * TOAD_QUOTES.length)];
  speechQuote.textContent = randomQuote;
});

// ================= DICE SHUFFLE =================
diceRollBtn.addEventListener('click', () => {
  audio.playDice();
  diceRollBtn.classList.add('spinning');
  setTimeout(() => diceRollBtn.classList.remove('spinning'), 400);

  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * PROMPTS.length);
  } while (newIndex === currentPromptIndex && PROMPTS.length > 1);

  currentPromptIndex = newIndex;
  const newPrompt = PROMPTS[currentPromptIndex];

  currentPromptText.style.opacity = '0';
  currentPromptText.style.transform = 'translateY(-4px)';

  setTimeout(() => {
    currentPromptText.textContent = newPrompt;
    currentPromptText.style.opacity = '1';
    currentPromptText.style.transform = 'translateY(0)';
    messageInput.placeholder = newPrompt.toLowerCase() + '...';
  }, 180);
});

// ================= CHARACTER COUNTER =================
messageInput.addEventListener('input', () => {
  const len = messageInput.value.length;
  charCounter.textContent = `${len} / 300`;
  if (len >= 280) {
    charCounter.classList.add('warning');
  } else {
    charCounter.classList.remove('warning');
  }
});

// ================= SUPABASE DATA SERVICE =================

/**
 * Send message to Supabase with fallback to direct REST fetch
 */
async function insertMessageToSupabase(content, prompt) {
  const payload = {
    content: content.trim(),
    prompt: prompt,
    recipient: 'toad'
  };

  // Try Supabase SDK first
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from(SUPABASE_CONFIG.tableName)
        .insert([payload])
        .select();

      if (!error) {
        return { success: true, source: 'supabase', data };
      }
      console.warn('Supabase JS insert error:', error);
    } catch (sdkErr) {
      console.warn('Supabase SDK exception:', sdkErr);
    }
  }

  // Fallback: Direct REST Fetch
  try {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tableName}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, source: 'supabase-rest', data };
    } else {
      const errText = await res.text();
      console.warn('REST fetch error status:', res.status, errText);
      return { success: false, status: res.status, error: errText };
    }
  } catch (netErr) {
    console.warn('Network fetch error:', netErr);
    return { success: false, error: netErr.message };
  }
}

/**
 * Fetch messages from Supabase
 */
async function fetchMessagesFromSupabase() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from(SUPABASE_CONFIG.tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && Array.isArray(data)) {
        return { success: true, messages: data };
      }
    } catch (err) {
      console.warn('Supabase SDK query error:', err);
    }
  }

  // Direct fetch fallback
  try {
    const res = await fetch(
      `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tableName}?select=*&order=created_at.desc&limit=50`,
      {
        headers: {
          'apikey': SUPABASE_CONFIG.anonKey,
          'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
        }
      }
    );

    if (res.ok) {
      const data = await res.json();
      return { success: true, messages: data };
    } else {
      return { success: false, status: res.status };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ================= FORM SUBMISSION =================
nglForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const text = messageInput.value.trim();
  if (!text) {
    showToast('Please write a message before sending!', 'warning');
    messageInput.focus();
    return;
  }

  const prompt = currentPromptText.textContent.trim();

  // Button loading state
  sendBtn.disabled = true;
  sendBtn.classList.add('loading');

  // Attempt Supabase insert
  let insertResult = await insertMessageToSupabase(text, prompt);

  // Always save to local cache so user never loses message
  const localItem = {
    id: 'local_' + Date.now(),
    content: text,
    prompt: prompt,
    recipient: 'toad',
    created_at: new Date().toISOString(),
    is_local: !insertResult.success
  };
  localMessages.unshift(localItem);
  localStorage.setItem('toad_messages_cache', JSON.stringify(localMessages.slice(0, 100)));
  updateInboxBadge();

  // Sound & Confetti celebration
  audio.playCoin();
  launchConfetti();

  // Reset Form
  messageInput.value = '';
  charCounter.textContent = '0 / 300';
  sendBtn.disabled = false;
  sendBtn.classList.remove('loading');

  // Show Success Overlay
  successOverlay.classList.add('show');

  if (insertResult.success) {
    isDbConnected = true;
    updateDbStatusUI('connected', 'Connected to Supabase');
  } else {
    updateDbStatusUI('warning', 'Message saved locally (Supabase table pending)');
    showToast('Saved locally.', 'normal');
  }
});

// ================= SUCCESS SCREEN ACTIONS =================
sendAnotherBtn.addEventListener('click', () => {
  successOverlay.classList.remove('show');
  messageInput.focus();
});

viewInboxFromSuccess.addEventListener('click', () => {
  successOverlay.classList.remove('show');
  switchTab('inbox');
});

// ================= CONFETTI EFFECT =================
function launchConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { x: 0.25, y: 0.65 },
      colors: ['#ff3b30', '#feca1d', '#0070d2', '#ffffff']
    });
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { x: 0.75, y: 0.65 },
      colors: ['#ff3b30', '#feca1d', '#0070d2', '#ffffff']
    });
  }
}

// ================= INBOX RENDERING =================
function updateDbStatusUI(state, text) {
  statusDot.className = 'status-indicator ' + state;
  dbStatusText.textContent = text;
}

function updateInboxBadge() {
  const count = localMessages.length;
  inboxCountBadge.textContent = count > 99 ? '99+' : count;
}

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (isNaN(seconds) || seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function fetchMessages() {
  refreshInboxBtn.classList.add('rotating');
  updateDbStatusUI('', 'Refreshing messages...');

  const result = await fetchMessagesFromSupabase();

  refreshInboxBtn.classList.remove('rotating');

  let displayList = [];

  if (result.success && Array.isArray(result.messages)) {
    isDbConnected = true;
    updateDbStatusUI('connected', `Connected to Supabase (${result.messages.length} messages)`);

    // Merge Supabase messages with local unsynced ones
    const remoteIds = new Set(result.messages.map(m => String(m.id)));
    const unsyncedLocal = localMessages.filter(m => m.is_local && !remoteIds.has(String(m.id)));
    displayList = [...unsyncedLocal, ...result.messages];
  } else {
    isDbConnected = false;
    updateDbStatusUI('warning', 'Showing cached messages (Table setup needed)');
    displayList = localMessages;
  }

  // Update badge
  inboxCountBadge.textContent = displayList.length > 99 ? '99+' : displayList.length;

  // Render cards
  if (displayList.length === 0) {
    messagesList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon-wrap">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </div>
        <h3>No messages yet</h3>
        <p>Toad's inbox is empty. Be the first to send a secret note!</p>
      </div>
    `;
    return;
  }

  messagesList.innerHTML = displayList.map(msg => `
    <div class="message-card" data-id="${msg.id}">
      <div class="message-card-header">
        <span class="msg-prompt-tag">${escapeHtml(msg.prompt || 'Anonymous Note')}</span>
        <span class="msg-time">${timeAgo(msg.created_at)}</span>
      </div>
      <div class="msg-content">${escapeHtml(msg.content)}</div>
      <div class="msg-card-footer">
        <button class="card-action-btn share-story-btn" onclick="openStoryModal('${escapeAttr(msg.prompt || '')}', '${escapeAttr(msg.content || '')}')">
          Story Card
        </button>
        <button class="card-action-btn copy-msg-btn" onclick="copyMessageText('${escapeAttr(msg.content || '')}')">
          Copy
        </button>
      </div>
    </div>
  `).join('');
}

function escapeAttr(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
}

window.copyMessageText = function(text) {
  audio.playDice();
  navigator.clipboard.writeText(text).then(() => {
    showToast('Message copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Failed to copy', 'error');
  });
};

window.openStoryModal = function(prompt, content) {
  audio.playJump();
  storyPrompt.textContent = prompt || 'Send me anonymous messages!';
  storyText.textContent = content;
  shareCardModal.classList.add('show');
};

closeStoryModal.addEventListener('click', () => {
  shareCardModal.classList.remove('show');
});

copyStoryTextBtn.addEventListener('click', () => {
  const fullText = `Q: ${storyPrompt.textContent}\n\nA: ${storyText.textContent}\n\nSent anonymously via 1A-nonymous`;
  navigator.clipboard.writeText(fullText).then(() => {
    showToast('Story text copied!', 'success');
  });
});

refreshInboxBtn.addEventListener('click', () => {
  audio.playDice();
  fetchMessages();
});

// ================= COPY LINK =================
copyLinkBtn.addEventListener('click', () => {
  audio.playCoin();
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    showToast('Link copied! Share it on your story or bio!', 'success');
  }).catch(() => {
    showToast('Could not copy link', 'error');
  });
});

// ================= CREDITS MODAL =================
openCreditsBtn.addEventListener('click', () => {
  audio.playDice();
  creditsModal.classList.add('show');
});

closeCreditsModal.addEventListener('click', () => {
  creditsModal.classList.remove('show');
});

creditsModal.addEventListener('click', (e) => {
  if (e.target === creditsModal) creditsModal.classList.remove('show');
});

shareCardModal.addEventListener('click', (e) => {
  if (e.target === shareCardModal) shareCardModal.classList.remove('show');
});

// ================= AMBIENT SKY PARTICLES (CLEAN CIRCLES, NO EMOJIS) =================
function initSkyParticles() {
  const container = document.getElementById('sky-particles');
  if (!container) return;

  const count = 14;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'sky-particle';
    const size = 4 + Math.random() * 8;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 98}vw`;
    p.style.animationDuration = `${7 + Math.random() * 10}s`;
    p.style.animationDelay = `${Math.random() * 7}s`;
    p.style.opacity = `${0.3 + Math.random() * 0.5}`;
    container.appendChild(p);
  }
}

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
  updateInboxBadge();
  initSkyParticles();
  
  // Initial database check
  fetchMessages();
});
