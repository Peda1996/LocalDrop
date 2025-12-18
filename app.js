/**
 * LocalDrop - P2P File Sharing
 * Cross-browser hardening:
 * - Clipboard: fallback for Firefox/insecure contexts
 * - Key events: use keydown instead of deprecated keypress
 * - File transfer: chunked WebRTC DataChannel sending with backpressure
 * - Receiving: per-connection transfer state (handles multiple peers safely)
 * - Auto-discovery: BroadcastChannel + localStorage for finding nearby devices
 */

(() => {
    // Config
    const ANIMALS = ['Fox', 'Bat', 'Cat', 'Dog', 'Owl', 'Yak', 'Ant', 'Bee', 'Elk', 'Emu'];
    const ADJECTIVES = ['Red', 'Blue', 'Fast', 'Calm', 'Cool', 'Hot', 'Wise', 'Zen', 'Bold', 'Kind'];
    const DEFAULT_ROOM = 'Public';
    const STORAGE_KEY = 'localdrop_peers';
    const BROADCAST_CHANNEL = 'localdrop_presence';
    const PRESENCE_INTERVAL = 5000; // 5 seconds
    const PEER_TIMEOUT = 15000; // 15 seconds - consider peer offline

    // DataChannel tuning (conservative for Firefox/Chromium)
    const CHUNK_SIZE = 64 * 1024;          // 64KB
    const MAX_BUFFERED = 8 * 1024 * 1024;  // 8MB
    const BUFFER_LOW = 2 * 1024 * 1024;    // 2MB

    // State
    let peer = null;
    let conn = null;
    let myName = '';
    let selectedFiles = [];
    let connectedPeers = {};
    let connectingPeers = {};
    let discoveredPeers = new Map(); // name -> { lastSeen, online }
    let broadcastChannel = null;
    let presenceInterval = null;
    let isScanning = false;

    // Receive state per peer-id
    const incoming = new Map();

    // DOM Elements
    const elements = {
        statusDot: null,
        myName: null,
        myIdBox: null,
        myIdInput: null,
        editNameBtn: null,
        targetNick: null,
        connectBtn: null,
        deviceList: null,
        dropZone: null,
        fileInput: null,
        fileInfo: null,
        sendBtn: null,
        progressContainer: null,
        progressBar: null,
        progressText: null,
        toast: null,
        scanBtn: null,
        discoveredList: null
    };

    let isEditingName = false;

    // Initialize DOM elements
    function initElements() {
        elements.statusDot = document.getElementById('statusDot');
        elements.myName = document.getElementById('myName');
        elements.myIdBox = document.getElementById('myIdBox');
        elements.myIdInput = document.getElementById('myIdInput');
        elements.editNameBtn = document.getElementById('editNameBtn');
        elements.targetNick = document.getElementById('targetNick');
        elements.connectBtn = document.getElementById('connectBtn');
        elements.deviceList = document.getElementById('deviceList');
        elements.dropZone = document.getElementById('dropZone');
        elements.fileInput = document.getElementById('fileInput');
        elements.fileInfo = document.getElementById('fileInfo');
        elements.sendBtn = document.getElementById('sendBtn');
        elements.progressContainer = document.getElementById('progressContainer');
        elements.progressBar = document.getElementById('progressBar');
        elements.progressText = document.getElementById('progressText');
        elements.toast = document.getElementById('toast');
        elements.scanBtn = document.getElementById('scanBtn');
        elements.discoveredList = document.getElementById('discoveredList');
    }

    // UI Helpers
    let toastTimeout = null;

    function showToast(msg) {
        // Clear any existing timeout
        if (toastTimeout) {
            clearTimeout(toastTimeout);
            toastTimeout = null;
        }

        // Create toast content with close button
        elements.toast.innerHTML = `
            <span class="toast-message">${escapeHtml(msg)}</span>
            <button class="toast-close" aria-label="Close">&times;</button>
        `;

        // Add close button handler
        const closeBtn = elements.toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.onclick = () => hideToast();
        }

        elements.toast.classList.add('visible');
        toastTimeout = setTimeout(() => hideToast(), 5000);
    }

    function hideToast() {
        elements.toast.classList.remove('visible');
        if (toastTimeout) {
            clearTimeout(toastTimeout);
            toastTimeout = null;
        }
    }

    function updateProgress(percent, text) {
        elements.progressBar.style.width = percent + '%';
        if (text) elements.progressText.textContent = text;
    }

    function showProgress(text) {
        elements.progressContainer.classList.add('visible');
        updateProgress(0, text || '');
    }

    function hideProgress() {
        elements.progressContainer.classList.remove('visible');
        updateProgress(0, '');
    }

    function formatBytes(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    }

    function generateNickname() {
        const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
        const ani = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
        const num = Math.floor(Math.random() * 100);
        return `${adj}${ani}${num}`;
    }

    function formatTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 10) return I18n.t('justNow');
        if (seconds < 60) return I18n.t('secondsAgo', { n: seconds });
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return I18n.t('minutesAgo', { n: minutes });
        const hours = Math.floor(minutes / 60);
        return I18n.t('hoursAgo', { n: hours });
    }

    // Clipboard (works on Chrome/Edge; Firefox may require HTTPS + permissions)
    async function copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (_) {}

        // Fallback for Firefox / insecure contexts
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            return ok;
        } catch (_) {
            return false;
        }
    }

    // ==================== Device Detection ====================

    function getDeviceInfo() {
        const ua = navigator.userAgent;
        let deviceType = 'desktop';
        let browser = 'Unknown';

        // Detect device type
        if (/Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
            if (/iPad|Tablet/i.test(ua)) {
                deviceType = 'tablet';
            } else {
                deviceType = 'mobile';
            }
        }

        // Detect browser
        if (ua.includes('Firefox/')) {
            browser = 'Firefox';
        } else if (ua.includes('Edg/')) {
            browser = 'Edge';
        } else if (ua.includes('Chrome/')) {
            browser = 'Chrome';
        } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
            browser = 'Safari';
        } else if (ua.includes('Opera') || ua.includes('OPR/')) {
            browser = 'Opera';
        }

        return { deviceType, browser };
    }

    function getDeviceIcon(deviceType) {
        switch (deviceType) {
            case 'mobile':
                return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`;
            case 'tablet':
                return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`;
            default:
                return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`;
        }
    }

    // ==================== Discovery System ====================

    // Initialize BroadcastChannel for same-origin discovery
    function initBroadcastChannel() {
        try {
            if (typeof BroadcastChannel === 'undefined') return;

            broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL);

            broadcastChannel.onmessage = (event) => {
                const { type, name, timestamp, deviceType, browser } = event.data || {};
                if (type === 'presence' && name && name !== myName) {
                    addDiscoveredPeer(name, timestamp, true, { deviceType, browser });
                }
                if (type === 'goodbye' && name) {
                    markPeerOffline(name);
                }
            };
        } catch (e) {
            console.log('BroadcastChannel not available');
        }
    }

    // Broadcast our presence
    function broadcastPresence() {
        if (broadcastChannel) {
            try {
                const { deviceType, browser } = getDeviceInfo();
                broadcastChannel.postMessage({
                    type: 'presence',
                    name: myName,
                    timestamp: Date.now(),
                    deviceType,
                    browser
                });
            } catch (_) {}
        }
    }

    // Broadcast goodbye when leaving
    function broadcastGoodbye() {
        if (broadcastChannel) {
            try {
                broadcastChannel.postMessage({
                    type: 'goodbye',
                    name: myName
                });
            } catch (_) {}
        }
    }

    // Load saved peers from localStorage
    function loadSavedPeers() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const peers = JSON.parse(saved);
                peers.forEach(p => {
                    if (p.name && p.name !== myName) {
                        discoveredPeers.set(p.name, {
                            lastSeen: p.lastSeen || Date.now(),
                            online: false
                        });
                    }
                });
            }
        } catch (_) {}
    }

    // Save peers to localStorage
    function savePeers() {
        try {
            const peers = [];
            discoveredPeers.forEach((data, name) => {
                peers.push({ name, lastSeen: data.lastSeen });
            });
            // Keep only most recent 20 peers
            peers.sort((a, b) => b.lastSeen - a.lastSeen);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(peers.slice(0, 20)));
        } catch (_) {}
    }

    // Add a discovered peer
    function addDiscoveredPeer(name, timestamp, online = false, deviceInfo = {}) {
        if (name === myName) return;
        if (connectedPeers[`${DEFAULT_ROOM}_${name}`]) return; // Already connected

        const existing = discoveredPeers.get(name);
        const firstSeen = existing?.firstSeen || timestamp || Date.now();

        discoveredPeers.set(name, {
            lastSeen: timestamp || Date.now(),
            firstSeen: firstSeen,
            online: online,
            deviceType: deviceInfo.deviceType || existing?.deviceType || 'desktop',
            browser: deviceInfo.browser || existing?.browser || 'Unknown'
        });
        savePeers();
        updateDiscoveredList();
    }

    // Mark a peer as offline
    function markPeerOffline(name) {
        const peer = discoveredPeers.get(name);
        if (peer) {
            peer.online = false;
            updateDiscoveredList();
        }
    }

    // Remove connected peers from discovered list
    function cleanupDiscoveredList() {
        Object.keys(connectedPeers).forEach(peerId => {
            const name = peerId.split('_')[1];
            discoveredPeers.delete(name);
        });
        updateDiscoveredList();
    }

    // Update the discovered devices UI - only show online peers
    function updateDiscoveredList() {
        const container = elements.discoveredList;
        if (!container) return;

        // Filter: only online peers, exclude connected and self
        const onlinePeers = [];
        const now = Date.now();

        discoveredPeers.forEach((data, name) => {
            if (name === myName) return;
            if (connectedPeers[`${DEFAULT_ROOM}_${name}`]) return;

            // Only include if online (seen recently)
            const isOnline = data.online && (now - data.lastSeen) < PEER_TIMEOUT;
            if (isOnline) {
                onlinePeers.push({ name, ...data });
            }
        });

        // Sort by last seen (most recent first)
        onlinePeers.sort((a, b) => b.lastSeen - a.lastSeen);

        if (onlinePeers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
                        <line x1="9" y1="9" x2="9.01" y2="9"/>
                        <line x1="15" y1="9" x2="15.01" y2="9"/>
                    </svg>
                    <span>${I18n.t('noDevicesFound')}</span>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        onlinePeers.slice(0, 10).forEach(p => {
            const deviceIcon = getDeviceIcon(p.deviceType);
            const timeOnline = formatTimeAgo(p.firstSeen);

            const div = document.createElement('div');
            div.className = 'discovered-item';
            div.innerHTML = `
                <div class="discovered-item-info">
                    <div class="discovered-item-status"></div>
                    <div class="discovered-item-device-icon" title="${p.deviceType}">${deviceIcon}</div>
                    <div class="discovered-item-details">
                        <span class="discovered-item-name">${escapeHtml(p.name)}</span>
                        <span class="discovered-item-meta">${p.browser} • ${timeOnline}</span>
                    </div>
                </div>
                <button class="btn-quick-connect">${I18n.t('connect')}</button>
            `;
            div.querySelector('.btn-quick-connect').onclick = () => quickConnect(p.name);
            container.appendChild(div);
        });
    }

    // Remove offline peers from storage
    function cleanupOfflinePeers() {
        const now = Date.now();
        const toRemove = [];

        discoveredPeers.forEach((data, name) => {
            // Remove if offline for more than 30 seconds
            if (!data.online || (now - data.lastSeen) > 30000) {
                toRemove.push(name);
            }
        });

        toRemove.forEach(name => discoveredPeers.delete(name));
        if (toRemove.length > 0) {
            savePeers();
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Quick connect to a discovered peer
    function quickConnect(name) {
        if (!peer || peer.disconnected) {
            showToast(I18n.t('notReadyYet'));
            return;
        }

        const targetId = `${DEFAULT_ROOM}_${name}`;
        showToast(I18n.t('connectingTo', { name }));

        const connection = peer.connect(targetId);
        setupConnectionEvents(connection);
    }

    // Fetch peer list from PeerJS server for cross-device discovery
    async function fetchPeersFromServer() {
        try {
            // PeerJS cloud server peer listing API
            const response = await fetch('https://0.peerjs.com/peerjs/peers', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) return [];

            const peers = await response.json();

            // Filter for peers in our room (starting with "Public_")
            return peers
                .filter(id => id.startsWith(`${DEFAULT_ROOM}_`) && id !== `${DEFAULT_ROOM}_${myName}`)
                .map(id => id.replace(`${DEFAULT_ROOM}_`, ''));
        } catch (err) {
            console.log('Could not fetch peer list from server:', err.message);
            return [];
        }
    }

    // Scan for devices by probing known peer patterns AND fetching from server
    async function scanForDevices() {
        if (isScanning || !peer || peer.disconnected) return;

        isScanning = true;
        elements.scanBtn?.classList.add('scanning');

        // Broadcast our presence first (for same-device discovery)
        broadcastPresence();

        // Collect peers to probe from multiple sources
        const peersToProbe = new Set();

        // 1. Add saved peers from localStorage
        discoveredPeers.forEach((data, name) => {
            if (name !== myName && !connectedPeers[`${DEFAULT_ROOM}_${name}`]) {
                peersToProbe.add(name);
            }
        });

        // 2. Fetch peers from PeerJS server (cross-device discovery!)
        try {
            const serverPeers = await fetchPeersFromServer();
            serverPeers.forEach(name => {
                if (name !== myName && !connectedPeers[`${DEFAULT_ROOM}_${name}`]) {
                    peersToProbe.add(name);
                }
            });
        } catch (_) {}

        // Probe each peer (limit to 10 to avoid overwhelming)
        const probeArray = Array.from(peersToProbe).slice(0, 10);
        for (const name of probeArray) {
            await probePeer(name);
        }

        setTimeout(() => {
            isScanning = false;
            elements.scanBtn?.classList.remove('scanning');
            updateDiscoveredList();
        }, 1000);
    }

    // Probe a single peer to check if online
    async function probePeer(name) {
        return new Promise((resolve) => {
            const targetId = `${DEFAULT_ROOM}_${name}`;
            let resolved = false;

            try {
                const probeConn = peer.connect(targetId, { reliable: false });

                const timeout = setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        markPeerOffline(name);
                        try { probeConn.close(); } catch (_) {}
                        resolve(false);
                    }
                }, 3000);

                probeConn.on('open', () => {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timeout);
                        addDiscoveredPeer(name, Date.now(), true);
                        // Keep connection open and setup events
                        setupConnectionEvents(probeConn);
                        resolve(true);
                    }
                });

                probeConn.on('error', () => {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timeout);
                        markPeerOffline(name);
                        resolve(false);
                    }
                });
            } catch (_) {
                resolve(false);
            }
        });
    }

    // Start presence broadcasting and periodic discovery
    function startPresenceBroadcast() {
        broadcastPresence();

        // Periodic presence broadcast (every 5 seconds)
        presenceInterval = setInterval(() => {
            broadcastPresence();
            // Cleanup offline peers completely
            cleanupOfflinePeers();
            updateDiscoveredList();
        }, PRESENCE_INTERVAL);

        // Periodic server-based discovery (every 10 seconds)
        setInterval(async () => {
            if (!isScanning && peer && !peer.disconnected) {
                try {
                    const serverPeers = await fetchPeersFromServer();
                    for (const name of serverPeers.slice(0, 5)) {
                        if (name !== myName && !connectedPeers[`${DEFAULT_ROOM}_${name}`]) {
                            // Quick probe without blocking
                            probePeer(name);
                        }
                    }
                } catch (_) {}
            }
        }, 10000);
    }

    // ==================== Peer Connection ====================

    function joinRoom(room) {
        if (peer) peer.destroy();

        const myFullId = `${room}_${myName}`;
        elements.statusDot.classList.add('off');

        peer = new Peer(myFullId, {
            debug: 0,
            config: {
                iceServers: [
                    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }
                ]
            }
        });

        peer.on('open', () => {
            elements.statusDot.classList.remove('off');
            showToast(I18n.t('ready'));
            updateDeviceList();

            // Start discovery after peer is ready
            startPresenceBroadcast();
            setTimeout(() => scanForDevices(), 1000);
        });

        peer.on('connection', handleIncomingConnection);

        peer.on('error', (err) => {
            if (err.type === 'unavailable-id') {
                myName = generateNickname();
                renderMyName();
                joinRoom(room);
            } else if (err.type === 'peer-unavailable') {
                // Don't show toast for probe failures
                if (!isScanning) {
                    showToast(I18n.t('deviceNotFound'));
                }
            } else if (err.type === 'network') {
                showToast(I18n.t('networkError'));
            } else {
                showToast(`Error: ${err.type || 'unknown'}`);
            }
        });

        peer.on('disconnected', () => {
            elements.statusDot.classList.add('off');
            setTimeout(() => {
                try { peer.reconnect(); } catch (_) {}
            }, 2000);
        });
    }

    function connectToPeer() {
        const targetNick = (elements.targetNick.value || '').trim();
        if (!targetNick) return;

        if (!peer || peer.disconnected) {
            showToast(I18n.t('notReadyYet'));
            return;
        }

        const targetId = `${DEFAULT_ROOM}_${targetNick}`;
        showToast(I18n.t('connectingTo', { name: targetNick }));

        const connection = peer.connect(targetId);
        setupConnectionEvents(connection);
        elements.targetNick.value = '';
    }

    function handleIncomingConnection(c) {
        const nick = c.peer.split('_')[1];
        showToast(I18n.t('connected', { name: nick }));

        // Add to discovered peers
        addDiscoveredPeer(nick, Date.now(), true);

        setupConnectionEvents(c);
    }

    function setupConnectionEvents(c) {
        c.on('open', () => {
            const nick = c.peer.split('_')[1];
            delete connectingPeers[c.peer];
            connectedPeers[c.peer] = c;

            const dc = c.dataChannel || c._dc;
            if (dc) {
                try { dc.bufferedAmountLowThreshold = BUFFER_LOW; } catch (_) {}
            }

            // Remove from discovered since now connected
            discoveredPeers.delete(nick);

            updateDeviceList();
            updateDiscoveredList();
            showToast(I18n.t('joined', { name: nick }));
        });

        c.on('data', (data) => handleData(data, c));

        c.on('close', () => {
            const nick = c.peer.split('_')[1];
            incoming.delete(c.peer);
            delete connectedPeers[c.peer];
            delete connectingPeers[c.peer];
            if (conn === c) conn = null;

            // Add back to discovered peers
            addDiscoveredPeer(nick, Date.now(), false);

            updateDeviceList();
            updateDiscoveredList();
            showToast(I18n.t('left', { name: nick }));
        });

        c.on('error', () => {
            incoming.delete(c.peer);
            delete connectedPeers[c.peer];
            delete connectingPeers[c.peer];
            if (conn === c) conn = null;
            updateDeviceList();
        });
    }

    function updateDeviceList() {
        const container = elements.deviceList;
        const peers = Object.values(connectedPeers);

        if (peers.length === 0) {
            container.innerHTML = '';
            updateSendButton();
            return;
        }

        container.innerHTML = `<div class="card-label">${I18n.t('connectedDevices')}</div>`;
        peers.forEach(c => {
            const nick = c.peer.split('_')[1];
            const div = document.createElement('div');
            div.className = `device-item ${conn === c ? 'selected' : ''}`;
            div.innerHTML = `<div class="status-dot"></div>${escapeHtml(nick)}`;
            div.onclick = () => selectDevice(c);
            container.appendChild(div);
        });

        if (!conn && peers.length > 0) selectDevice(peers[0]);
        updateSendButton();
    }

    function selectDevice(c) {
        conn = c;
        updateDeviceList();
        updateSendButton();
    }

    function isReceivingOnSelectedConn() {
        if (!conn) return false;
        const s = incoming.get(conn.peer);
        return !!(s && s.meta);
    }

    function updateSendButton() {
        elements.sendBtn.disabled = !(conn && selectedFiles.length > 0) || isReceivingOnSelectedConn();
    }

    // File Handling
    function initFileHandling() {
        elements.dropZone.addEventListener('click', () => elements.fileInput.click());

        elements.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
            elements.dropZone.classList.add('dragover');
        });

        elements.dropZone.addEventListener('dragleave', () => {
            elements.dropZone.classList.remove('dragover');
        });

        elements.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            elements.dropZone.classList.remove('dragover');
            handleFileSelection(e.dataTransfer.files);
        });

        elements.fileInput.addEventListener('change', () => {
            handleFileSelection(elements.fileInput.files);
        });
    }

    function handleFileSelection(files) {
        selectedFiles = Array.from(files || []);

        if (selectedFiles.length > 0) {
            const totalSize = selectedFiles.reduce((a, f) => a + (f.size || 0), 0);
            elements.fileInfo.textContent = I18n.t('files', { n: selectedFiles.length, size: formatBytes(totalSize) });
            elements.fileInfo.classList.add('visible');
        } else {
            elements.fileInfo.classList.remove('visible');
        }
        updateSendButton();
    }

    async function readAsArrayBuffer(blob) {
        if (blob.arrayBuffer) return await blob.arrayBuffer();
        return await new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onerror = () => reject(r.error);
            r.onload = () => resolve(r.result);
            r.readAsArrayBuffer(blob);
        });
    }

    async function waitForBufferedAmountLow(connection) {
        const dc = connection.dataChannel || connection._dc || connection._dataChannel || connection._channel;
        if (!dc) return;

        if (dc.bufferedAmount <= MAX_BUFFERED) return;

        await new Promise((resolve) => {
            let done = false;

            const finish = () => {
                if (done) return;
                done = true;
                try { dc.removeEventListener('bufferedamountlow', onLow); } catch (_) {}
                resolve();
            };

            const onLow = () => {
                if (dc.bufferedAmount <= BUFFER_LOW) finish();
            };

            try { dc.addEventListener('bufferedamountlow', onLow); } catch (_) {}
            setTimeout(finish, 250);
        });
    }

    function newTransferId() {
        return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    }

    // Send Files
    async function sendFiles() {
        if (!conn || selectedFiles.length === 0) return;
        if (isReceivingOnSelectedConn()) {
            showToast(I18n.t('receivingBusy'));
            return;
        }

        elements.sendBtn.disabled = true;
        showProgress(I18n.t('preparing'));

        try {
            let fileBlob, fileName, fileType;

            if (selectedFiles.length > 1) {
                updateProgress(10, I18n.t('zipping'));
                const zip = new JSZip();
                selectedFiles.forEach(f => zip.file(f.name, f));
                const ab = await zip.generateAsync({ type: 'arraybuffer' });
                fileBlob = new Blob([ab], { type: 'application/zip' });
                fileName = `files_${Date.now()}.zip`;
                fileType = 'application/zip';
            } else {
                fileBlob = selectedFiles[0];
                fileName = fileBlob.name;
                fileType = fileBlob.type || 'application/octet-stream';
            }

            const transferId = newTransferId();
            const totalBytes = fileBlob.size;

            conn.send(JSON.stringify({
                t: 'meta',
                id: transferId,
                name: fileName,
                size: totalBytes,
                mime: fileType,
                chunkSize: CHUNK_SIZE
            }));

            updateProgress(15, I18n.t('sending'));

            let offset = 0;
            let seq = 0;

            while (offset < totalBytes) {
                const chunk = fileBlob.slice(offset, offset + CHUNK_SIZE);
                await waitForBufferedAmountLow(conn);
                conn.send(chunk);
                offset += chunk.size;
                seq += 1;

                const pct = Math.min(99, Math.round((offset / totalBytes) * 100));
                updateProgress(pct, `${I18n.t('sending')} ${formatBytes(offset)} / ${formatBytes(totalBytes)}`);

                if (seq % 16 === 0) await new Promise(r => setTimeout(r, 0));
            }

            conn.send(JSON.stringify({ t: 'end', id: transferId }));

            updateProgress(100, I18n.t('sent'));
            showToast(I18n.t('sentFile', { name: fileName }));

            setTimeout(() => {
                hideProgress();
                selectedFiles = [];
                elements.fileInfo.classList.remove('visible');
                elements.fileInput.value = '';
                updateSendButton();
            }, 800);

        } catch (err) {
            console.error(err);
            showToast(I18n.t('errorSending'));
            hideProgress();
            updateSendButton();
        }
    }

    // Receive Files
    function handleData(data, connection) {
        const peerId = connection && connection.peer ? connection.peer : '';
        const getState = () => incoming.get(peerId);
        const setState = (metaObj) => {
            incoming.set(peerId, {
                meta: metaObj,
                chunks: [],
                receivedBytes: 0,
                startedAt: Date.now()
            });
            showToast(I18n.t('receivingFile', { name: metaObj.name }));
            showProgress(I18n.t('receivingFile', { name: metaObj.name }));
            updateSendButton();
        };

        // Control messages as string JSON
        if (typeof data === 'string') {
            let msg;
            try { msg = JSON.parse(data); } catch (_) { return; }
            if (!msg || typeof msg !== 'object') return;

            const type = msg.t || msg.type;
            if (type === 'meta') {
                setState(msg);
                return;
            }
            if (type === 'end') {
                const s = getState();
                if (!s || !s.meta) return;

                const blob = new Blob(s.chunks, { type: s.meta.mime || 'application/octet-stream' });
                downloadFile(blob, s.meta.name);

                showToast(I18n.t('receivedFile', { name: s.meta.name }));
                updateProgress(100, I18n.t('received'));
                setTimeout(() => hideProgress(), 800);

                incoming.delete(peerId);
                updateSendButton();
                return;
            }
            return;
        }

        // Backward compatibility: object messages
        if (data && typeof data === 'object' && !(data instanceof Blob) && !(data instanceof ArrayBuffer) && !ArrayBuffer.isView(data)) {
            if (data.type === 'meta') {
                setState(data);
                return;
            }

            if (data.type === 'chunk') {
                const s = getState();
                if (!s || !s.meta || (s.meta.id && data.id && s.meta.id !== data.id)) return;

                const part = data.data;
                if (part instanceof Blob) {
                    s.chunks.push(part);
                    s.receivedBytes += part.size;
                } else if (part instanceof ArrayBuffer) {
                    s.chunks.push(part);
                    s.receivedBytes += part.byteLength;
                } else if (ArrayBuffer.isView(part)) {
                    const sliced = part.buffer.slice(part.byteOffset, part.byteOffset + part.byteLength);
                    s.chunks.push(sliced);
                    s.receivedBytes += part.byteLength;
                }

                const total = s.meta.size || 1;
                const pct = Math.min(99, Math.round((s.receivedBytes / total) * 100));
                updateProgress(pct, `${I18n.t('receiving')} ${formatBytes(s.receivedBytes)} / ${formatBytes(total)}`);
                return;
            }

            if (data.type === 'end') {
                const s = getState();
                if (!s || !s.meta || (s.meta.id && data.id && s.meta.id !== data.id)) return;

                const blob = new Blob(s.chunks, { type: s.meta.mime || 'application/octet-stream' });
                downloadFile(blob, s.meta.name);

                showToast(I18n.t('receivedFile', { name: s.meta.name }));
                updateProgress(100, I18n.t('received'));
                setTimeout(() => hideProgress(), 800);

                incoming.delete(peerId);
                updateSendButton();
                return;
            }
            return;
        }

        // Binary chunk (Blob / ArrayBuffer / TypedArray)
        const s = getState();
        if (!s || !s.meta) return;

        let bytes = 0;
        let part = data;

        if (data instanceof Blob) {
            bytes = data.size;
        } else if (data instanceof ArrayBuffer) {
            bytes = data.byteLength;
        } else if (ArrayBuffer.isView(data)) {
            bytes = data.byteLength;
            part = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
        } else {
            return;
        }

        s.chunks.push(part);
        s.receivedBytes += bytes;

        const total = s.meta.size || 1;
        const pct = Math.min(99, Math.round((s.receivedBytes / total) * 100));
        updateProgress(pct, `Receiving... ${formatBytes(s.receivedBytes)} / ${formatBytes(total)}`);
    }

    function downloadFile(blob, name) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Render
    function renderMyName() {
        elements.myName.textContent = myName;
        elements.myIdBox.textContent = myName;
    }

    // Initialize
    // Name editing functions
    function startEditingName() {
        if (isEditingName) return;
        isEditingName = true;

        elements.myIdBox.style.display = 'none';
        elements.myIdInput.style.display = 'block';
        elements.myIdInput.value = myName;
        elements.myIdInput.focus();
        elements.myIdInput.select();
        elements.editNameBtn.classList.add('editing');
        elements.editNameBtn.innerHTML = '&#10003;'; // checkmark
    }

    function finishEditingName() {
        if (!isEditingName) return;

        const newName = (elements.myIdInput.value || '').trim().replace(/[^a-zA-Z0-9]/g, '');

        if (newName && newName !== myName && newName.length >= 3) {
            const oldName = myName;
            myName = newName;
            renderMyName();

            // Rejoin with new name
            if (peer) {
                broadcastGoodbye();
                joinRoom(DEFAULT_ROOM);
            }
            showToast(I18n.t('nameChanged', { name: myName }));
        } else if (newName.length > 0 && newName.length < 3) {
            showToast(I18n.t('nameTooShort'));
        }

        isEditingName = false;
        elements.myIdBox.style.display = 'block';
        elements.myIdInput.style.display = 'none';
        elements.editNameBtn.classList.remove('editing');
        elements.editNameBtn.innerHTML = '&#9998;'; // pencil
    }

    function cancelEditingName() {
        isEditingName = false;
        elements.myIdBox.style.display = 'block';
        elements.myIdInput.style.display = 'none';
        elements.editNameBtn.classList.remove('editing');
        elements.editNameBtn.innerHTML = '&#9998;';
    }

    function init() {
        initElements();
        myName = generateNickname();
        renderMyName();

        // Initialize discovery
        initBroadcastChannel();
        loadSavedPeers();
        updateDiscoveredList();

        // Click-to-copy name (only when not editing)
        elements.myIdBox.addEventListener('click', async () => {
            if (!isEditingName) {
                const ok = await copyToClipboard(myName);
                showToast(ok ? I18n.t('nameCopied') : I18n.t('copyFailed'));
            }
        });

        // Name editing
        if (elements.editNameBtn) {
            elements.editNameBtn.addEventListener('click', () => {
                if (isEditingName) {
                    finishEditingName();
                } else {
                    startEditingName();
                }
            });
        }

        if (elements.myIdInput) {
            elements.myIdInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    finishEditingName();
                } else if (e.key === 'Escape') {
                    cancelEditingName();
                }
            });

            elements.myIdInput.addEventListener('blur', () => {
                // Small delay to allow button click to register first
                setTimeout(() => {
                    if (isEditingName) finishEditingName();
                }, 150);
            });
        }

        // Connect actions
        elements.connectBtn.addEventListener('click', connectToPeer);
        elements.targetNick.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') connectToPeer();
        });

        // Scan button
        if (elements.scanBtn) {
            elements.scanBtn.addEventListener('click', scanForDevices);
        }

        // Send action
        elements.sendBtn.addEventListener('click', sendFiles);

        // File handling
        initFileHandling();

        // Join room
        joinRoom(DEFAULT_ROOM);

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            broadcastGoodbye();
            if (presenceInterval) clearInterval(presenceInterval);
        });

        // Helpful hint for local file:// usage
        if (location.protocol === 'file:') {
            showToast(I18n.t('httpsHint'));
        }
    }

    // Start app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
