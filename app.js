/**
 * LocalDrop - P2P File Sharing
 * Discovery: IP-based room system (like ShareDrop)
 * - Devices on same network share public IP = same room
 * - Numbered peer slots for discovery
 * - BroadcastChannel for same-browser tabs
 */

(() => {
    // Config
    const ANIMALS = ['Fox', 'Bat', 'Cat', 'Dog', 'Owl', 'Yak', 'Ant', 'Bee', 'Elk', 'Emu'];
    const ADJECTIVES = ['Red', 'Blue', 'Fast', 'Calm', 'Cool', 'Hot', 'Wise', 'Zen', 'Bold', 'Kind'];
    const STORAGE_KEY = 'localdrop_peers';
    const BROADCAST_CHANNEL = 'localdrop_presence';
    const PRESENCE_INTERVAL = 5000;
    const PEER_TIMEOUT = 15000;
    const MAX_ROOM_SLOTS = 10; // Max devices per room
    const DISCOVERY_INTERVAL = 8000; // Scan every 8 seconds

    // DataChannel tuning
    const CHUNK_SIZE = 64 * 1024;
    const MAX_BUFFERED = 8 * 1024 * 1024;
    const BUFFER_LOW = 2 * 1024 * 1024;

    // State
    let peer = null;
    let conn = null;
    let myName = '';
    let mySlot = 0;
    let roomId = 'local'; // Will be set based on IP
    let selectedFiles = [];
    let connectedPeers = {};
    let connectingPeers = {};
    let discoveredPeers = new Map();
    let broadcastChannel = null;
    let presenceInterval = null;
    let discoveryInterval = null;
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

    // ==================== UI Helpers ====================

    let toastTimeout = null;

    function showToast(msg) {
        if (toastTimeout) {
            clearTimeout(toastTimeout);
            toastTimeout = null;
        }

        elements.toast.innerHTML = `
            <span class="toast-message">${escapeHtml(msg)}</span>
            <button class="toast-close" aria-label="Close">&times;</button>
        `;

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

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Clipboard
    async function copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (_) {}

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

    // ==================== IP-Based Room Discovery ====================

    // Get public IP and create room ID
    async function getPublicIP() {
        const apis = [
            'https://api.ipify.org?format=json',
            'https://api.my-ip.io/ip.json',
            'https://ipapi.co/json/'
        ];

        for (const api of apis) {
            try {
                const response = await fetch(api, { timeout: 5000 });
                const data = await response.json();
                return data.ip || data.IPv4 || null;
            } catch (_) {}
        }
        return null;
    }

    // Create a short hash from IP for room ID
    function hashIP(ip) {
        let hash = 0;
        for (let i = 0; i < ip.length; i++) {
            const char = ip.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36).substring(0, 6);
    }

    // Peer names by ID (discovered via handshake)
    const peerNames = new Map();

    // Generate peer ID: LD_{room}_{slot} (no name - discovered via handshake)
    function getPeerId(slot) {
        return `LD_${roomId}_${slot}`;
    }

    // Parse peer ID to extract room and slot
    function parsePeerId(peerId) {
        const parts = peerId.split('_');
        if (parts.length >= 3 && parts[0] === 'LD') {
            return {
                room: parts[1],
                slot: parseInt(parts[2], 10)
            };
        }
        return null;
    }

    // Get display name for a peer (from handshake or fallback)
    function getPeerName(peerId) {
        return peerNames.get(peerId) || `Device ${parsePeerId(peerId)?.slot || '?'}`;
    }

    // ==================== Device Detection ====================

    function getDeviceInfo() {
        const ua = navigator.userAgent;
        let deviceType = 'desktop';
        let browser = 'Unknown';

        if (/Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
            if (/iPad|Tablet/i.test(ua)) {
                deviceType = 'tablet';
            } else {
                deviceType = 'mobile';
            }
        }

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

    // ==================== BroadcastChannel (Same Browser) ====================

    function initBroadcastChannel() {
        try {
            if (typeof BroadcastChannel === 'undefined') return;

            broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL);

            broadcastChannel.onmessage = (event) => {
                const { type, name, peerId, timestamp, deviceType, browser } = event.data || {};
                if (type === 'presence' && name && name !== myName) {
                    addDiscoveredPeer(name, peerId, timestamp, true, { deviceType, browser });
                }
                if (type === 'goodbye' && name) {
                    removePeer(name);
                }
            };
        } catch (e) {
            console.log('BroadcastChannel not available');
        }
    }

    function broadcastPresence() {
        if (broadcastChannel && peer) {
            try {
                const { deviceType, browser } = getDeviceInfo();
                broadcastChannel.postMessage({
                    type: 'presence',
                    name: myName,
                    peerId: peer.id,
                    timestamp: Date.now(),
                    deviceType,
                    browser
                });
            } catch (_) {}
        }
    }

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

    // ==================== Peer Discovery ====================

    function addDiscoveredPeer(name, peerId, timestamp, online = false, deviceInfo = {}) {
        if (name === myName) return;
        if (connectedPeers[peerId]) return;

        const existing = discoveredPeers.get(name);
        const firstSeen = existing?.firstSeen || timestamp || Date.now();

        discoveredPeers.set(name, {
            peerId: peerId,
            lastSeen: timestamp || Date.now(),
            firstSeen: firstSeen,
            online: online,
            deviceType: deviceInfo.deviceType || existing?.deviceType || 'desktop',
            browser: deviceInfo.browser || existing?.browser || 'Unknown'
        });
        updateDiscoveredList();
    }

    function removePeer(name) {
        discoveredPeers.delete(name);
        updateDiscoveredList();
    }

    function cleanupOfflinePeers() {
        const now = Date.now();
        const toRemove = [];

        discoveredPeers.forEach((data, name) => {
            if (!data.online || (now - data.lastSeen) > PEER_TIMEOUT * 2) {
                toRemove.push(name);
            }
        });

        toRemove.forEach(name => discoveredPeers.delete(name));
    }

    // Scan room for other devices
    async function scanRoom() {
        if (isScanning || !peer || peer.disconnected) return;

        isScanning = true;
        elements.scanBtn?.classList.add('scanning');

        // Broadcast presence for same-browser discovery
        broadcastPresence();

        // Scan all slots in our room
        const probePromises = [];
        for (let slot = 0; slot < MAX_ROOM_SLOTS; slot++) {
            if (slot === mySlot) continue; // Skip our own slot

            // Try each slot
            probePromises.push(probeSlot(slot));
        }

        await Promise.all(probePromises);

        setTimeout(() => {
            isScanning = false;
            elements.scanBtn?.classList.remove('scanning');
            updateDiscoveredList();
        }, 500);
    }

    // Probe a specific slot to check if a peer exists there
    async function probeSlot(slot) {
        return new Promise((resolve) => {
            if (!peer || peer.disconnected) {
                resolve(false);
                return;
            }

            const targetId = `LD_${roomId}_${slot}`;

            // Don't probe ourselves
            if (targetId === peer.id) {
                resolve(false);
                return;
            }

            // Already connected?
            if (connectedPeers[targetId]) {
                resolve(true);
                return;
            }

            let resolved = false;

            try {
                const probeConn = peer.connect(targetId, { reliable: true });

                const timeout = setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        try { probeConn.close(); } catch (_) {}
                        resolve(false);
                    }
                }, 3000);

                probeConn.on('open', () => {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timeout);

                        // Send our info for handshake
                        sendHandshake(probeConn);

                        // Setup connection
                        setupConnectionEvents(probeConn);
                        resolve(true);
                    }
                });

                probeConn.on('error', () => {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timeout);
                        resolve(false);
                    }
                });
            } catch (_) {
                resolve(false);
            }
        });
    }

    // Send handshake with our device info
    function sendHandshake(connection) {
        const { deviceType, browser } = getDeviceInfo();
        try {
            connection.send(JSON.stringify({
                t: 'handshake',
                name: myName,
                deviceType: deviceType,
                browser: browser
            }));
        } catch (_) {}
    }

    function updateDiscoveredList() {
        const container = elements.discoveredList;
        if (!container) return;

        const onlinePeers = [];
        const now = Date.now();

        discoveredPeers.forEach((data, name) => {
            if (name === myName) return;
            if (connectedPeers[data.peerId]) return;

            const isOnline = data.online && (now - data.lastSeen) < PEER_TIMEOUT;
            if (isOnline) {
                onlinePeers.push({ name, ...data });
            }
        });

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
            div.querySelector('.btn-quick-connect').onclick = () => connectToPeerId(p.peerId);
            container.appendChild(div);
        });
    }

    // ==================== Peer Connection ====================

    async function joinRoom() {
        if (peer) peer.destroy();

        // Get public IP for room-based discovery
        const ip = await getPublicIP();
        if (ip) {
            roomId = hashIP(ip);
            console.log('Room ID (from IP):', roomId);
        } else {
            roomId = 'local';
            console.log('Could not get IP, using local room');
        }

        // Find an available slot
        await findAvailableSlot();
    }

    async function findAvailableSlot() {
        // Try slots 0-9 until we find one that's not taken
        for (let slot = 0; slot < MAX_ROOM_SLOTS; slot++) {
            const success = await trySlot(slot);
            if (success) {
                mySlot = slot;
                return;
            }
        }

        // All slots taken, use random high slot
        mySlot = MAX_ROOM_SLOTS + Math.floor(Math.random() * 90);
        await trySlot(mySlot);
    }

    async function trySlot(slot) {
        return new Promise((resolve) => {
            const peerId = getPeerId(slot);

            elements.statusDot.classList.add('off');

            peer = new Peer(peerId, {
                debug: 0,
                config: {
                    iceServers: [
                        { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }
                    ]
                }
            });

            const timeout = setTimeout(() => {
                peer.destroy();
                resolve(false);
            }, 5000);

            peer.on('open', () => {
                clearTimeout(timeout);
                elements.statusDot.classList.remove('off');
                console.log('Connected as:', peerId);
                showToast(I18n.t('ready'));

                // Start discovery
                startDiscovery();
                updateDeviceList();
                resolve(true);
            });

            peer.on('connection', handleIncomingConnection);

            peer.on('error', (err) => {
                clearTimeout(timeout);

                if (err.type === 'unavailable-id') {
                    // Slot taken, try next
                    peer.destroy();
                    resolve(false);
                } else if (err.type === 'peer-unavailable') {
                    if (!isScanning) {
                        showToast(I18n.t('deviceNotFound'));
                    }
                } else if (err.type === 'network') {
                    showToast(I18n.t('networkError'));
                }
            });

            peer.on('disconnected', () => {
                elements.statusDot.classList.add('off');
                setTimeout(() => {
                    try { peer.reconnect(); } catch (_) {}
                }, 2000);
            });
        });
    }

    function startDiscovery() {
        // Same-browser discovery
        initBroadcastChannel();
        broadcastPresence();

        // Periodic presence broadcast
        presenceInterval = setInterval(() => {
            broadcastPresence();
            cleanupOfflinePeers();
            updateDiscoveredList();
        }, PRESENCE_INTERVAL);

        // Periodic room scan
        discoveryInterval = setInterval(() => {
            scanRoom();
        }, DISCOVERY_INTERVAL);

        // Initial scan
        setTimeout(() => scanRoom(), 1000);
    }

    function connectToPeer() {
        const targetNick = (elements.targetNick.value || '').trim();
        if (!targetNick) return;

        if (!peer || peer.disconnected) {
            showToast(I18n.t('notReadyYet'));
            return;
        }

        // Try to find the peer in discovered list first
        const discovered = discoveredPeers.get(targetNick);
        if (discovered && discovered.peerId) {
            connectToPeerId(discovered.peerId);
        } else {
            // Try common slot patterns
            showToast(I18n.t('connectingTo', { name: targetNick }));
            tryConnectByName(targetNick);
        }

        elements.targetNick.value = '';
    }

    async function tryConnectByName(name) {
        // Scan all slots to find this user via handshake
        // Since peer IDs don't contain names, we connect and the handshake reveals the name
        let found = false;

        for (let slot = 0; slot < MAX_ROOM_SLOTS; slot++) {
            if (slot === mySlot) continue;

            const targetId = `LD_${roomId}_${slot}`;

            // Skip if already connected
            if (connectedPeers[targetId]) {
                // Check if this connected peer has the name we're looking for
                if (peerNames.get(targetId) === name) {
                    found = true;
                    break;
                }
                continue;
            }

            // Try to connect to this slot
            const success = await probeSlot(slot);
            if (success) {
                // Give time for handshake
                await new Promise(r => setTimeout(r, 500));

                // Check if we found our target
                if (peerNames.get(targetId) === name) {
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            showToast(I18n.t('deviceNotFound'));
        }
    }

    function connectToPeerId(peerId) {
        if (!peer || peer.disconnected) {
            showToast(I18n.t('notReadyYet'));
            return;
        }

        const nick = getPeerName(peerId);
        showToast(I18n.t('connectingTo', { name: nick }));

        const connection = peer.connect(peerId);
        setupConnectionEvents(connection);
    }

    function handleIncomingConnection(c) {
        const nick = getPeerName(c.peer);
        showToast(I18n.t('connected', { name: nick }));
        setupConnectionEvents(c);
    }

    function setupConnectionEvents(c) {
        c.on('open', () => {
            const nick = getPeerName(c.peer);

            delete connectingPeers[c.peer];
            connectedPeers[c.peer] = c;

            const dc = c.dataChannel || c._dc;
            if (dc) {
                try { dc.bufferedAmountLowThreshold = BUFFER_LOW; } catch (_) {}
            }

            // Send our handshake
            sendHandshake(c);

            // Remove from discovered since now connected
            const knownName = peerNames.get(c.peer);
            if (knownName) {
                discoveredPeers.delete(knownName);
            }

            updateDeviceList();
            updateDiscoveredList();
            showToast(I18n.t('joined', { name: nick }));
        });

        c.on('data', (data) => handleData(data, c));

        c.on('close', () => {
            const nick = getPeerName(c.peer);

            incoming.delete(c.peer);
            peerNames.delete(c.peer);
            delete connectedPeers[c.peer];
            delete connectingPeers[c.peer];
            if (conn === c) conn = null;

            updateDeviceList();
            updateDiscoveredList();
            showToast(I18n.t('left', { name: nick }));
        });

        c.on('error', () => {
            incoming.delete(c.peer);
            peerNames.delete(c.peer);
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
            const nick = getPeerName(c.peer);
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

    // ==================== File Handling ====================

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

        if (typeof data === 'string') {
            let msg;
            try { msg = JSON.parse(data); } catch (_) { return; }
            if (!msg || typeof msg !== 'object') return;

            const type = msg.t || msg.type;

            // Handle handshake (device info exchange)
            if (type === 'handshake') {
                if (msg.name && peerId) {
                    peerNames.set(peerId, msg.name);
                    addDiscoveredPeer(msg.name, peerId, Date.now(), true, {
                        deviceType: msg.deviceType || 'desktop',
                        browser: msg.browser || 'Unknown'
                    });
                    updateDeviceList();
                    updateDiscoveredList();
                }
                return;
            }

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

        // Binary chunk
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
        updateProgress(pct, `${I18n.t('receiving')} ${formatBytes(s.receivedBytes)} / ${formatBytes(total)}`);
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

    // ==================== Name Editing ====================

    function renderMyName() {
        elements.myName.textContent = myName;
        elements.myIdBox.textContent = myName;
    }

    function startEditingName() {
        if (isEditingName) return;
        isEditingName = true;

        elements.myIdBox.style.display = 'none';
        elements.myIdInput.style.display = 'block';
        elements.myIdInput.value = myName;
        elements.myIdInput.focus();
        elements.myIdInput.select();
        elements.editNameBtn.classList.add('editing');
        elements.editNameBtn.innerHTML = '&#10003;';
    }

    function finishEditingName() {
        if (!isEditingName) return;

        const newName = (elements.myIdInput.value || '').trim().replace(/[^a-zA-Z0-9]/g, '');

        if (newName && newName !== myName && newName.length >= 3) {
            myName = newName;
            renderMyName();

            if (peer) {
                broadcastGoodbye();
                joinRoom();
            }
            showToast(I18n.t('nameChanged', { name: myName }));
        } else if (newName.length > 0 && newName.length < 3) {
            showToast(I18n.t('nameTooShort'));
        }

        isEditingName = false;
        elements.myIdBox.style.display = 'block';
        elements.myIdInput.style.display = 'none';
        elements.editNameBtn.classList.remove('editing');
        elements.editNameBtn.innerHTML = '&#9998;';
    }

    function cancelEditingName() {
        isEditingName = false;
        elements.myIdBox.style.display = 'block';
        elements.myIdInput.style.display = 'none';
        elements.editNameBtn.classList.remove('editing');
        elements.editNameBtn.innerHTML = '&#9998;';
    }

    // ==================== Initialize ====================

    function init() {
        initElements();
        myName = generateNickname();
        renderMyName();

        // Click-to-copy name
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
            elements.scanBtn.addEventListener('click', scanRoom);
        }

        // Send action
        elements.sendBtn.addEventListener('click', sendFiles);

        // File handling
        initFileHandling();

        // Join room (IP-based)
        joinRoom();

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            broadcastGoodbye();
            if (presenceInterval) clearInterval(presenceInterval);
            if (discoveryInterval) clearInterval(discoveryInterval);
        });

        if (location.protocol === 'file:') {
            showToast(I18n.t('httpsHint'));
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
