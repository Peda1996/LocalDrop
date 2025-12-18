/**
 * LocalDrop - P2P File Sharing
 * Cross-browser hardening:
 * - Clipboard: fallback for Firefox/insecure contexts
 * - Key events: use keydown instead of deprecated keypress
 * - File transfer: chunked WebRTC DataChannel sending with backpressure
 * - Receiving: per-connection transfer state (handles multiple peers safely)
 */

(() => {
    // Config
    const ANIMALS = ['Fox', 'Bat', 'Cat', 'Dog', 'Owl', 'Yak', 'Ant', 'Bee', 'Elk', 'Emu'];
    const ADJECTIVES = ['Red', 'Blue', 'Fast', 'Calm', 'Cool', 'Hot', 'Wise', 'Zen', 'Bold', 'Kind'];
    const DEFAULT_ROOM = 'Public';

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

    // Receive state per peer-id
    const incoming = new Map();

    // DOM Elements
    const elements = {
        statusDot: null,
        myName: null,
        myIdBox: null,
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
        toast: null
    };

    // Initialize DOM elements
    function initElements() {
        elements.statusDot = document.getElementById('statusDot');
        elements.myName = document.getElementById('myName');
        elements.myIdBox = document.getElementById('myIdBox');
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
    }

    // UI Helpers
    function showToast(msg) {
        elements.toast.textContent = msg;
        elements.toast.classList.add('visible');
        setTimeout(() => elements.toast.classList.remove('visible'), 3000);
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

    // Peer Connection
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
            showToast('Ready to connect');
            updateDeviceList();
        });

        peer.on('connection', handleIncomingConnection);

        peer.on('error', (err) => {
            if (err.type === 'unavailable-id') {
                myName = generateNickname();
                renderMyName();
                joinRoom(room);
            } else if (err.type === 'peer-unavailable') {
                showToast('Device not found');
            } else if (err.type === 'network') {
                showToast('Network error - retrying...');
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
            showToast('Not ready yet');
            return;
        }

        const targetId = `${DEFAULT_ROOM}_${targetNick}`;
        showToast(`Connecting to ${targetNick}...`);

        const connection = peer.connect(targetId);
        setupConnectionEvents(connection);
        elements.targetNick.value = '';
    }

    function handleIncomingConnection(c) {
        showToast(`${c.peer.split('_')[1]} connected!`);
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

            updateDeviceList();
            showToast(`${nick} joined`);
        });

        c.on('data', (data) => handleData(data, c));

        c.on('close', () => {
            const nick = c.peer.split('_')[1];
            incoming.delete(c.peer);
            delete connectedPeers[c.peer];
            delete connectingPeers[c.peer];
            if (conn === c) conn = null;
            updateDeviceList();
            showToast(`${nick} left`);
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

        container.innerHTML = '<div class="card-label">Connected Devices</div>';
        peers.forEach(c => {
            const nick = c.peer.split('_')[1];
            const div = document.createElement('div');
            div.className = `device-item ${conn === c ? 'selected' : ''}`;
            div.innerHTML = `<div class="status-dot"></div>${nick}`;
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
            elements.fileInfo.textContent = `${selectedFiles.length} file(s) - ${formatBytes(totalSize)}`;
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
            showToast('Receiving on this connection; try again after it finishes');
            return;
        }

        elements.sendBtn.disabled = true;
        showProgress('Preparing...');

        try {
            let fileBlob, fileName, fileType;

            if (selectedFiles.length > 1) {
                updateProgress(10, 'Zipping files...');
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

            updateProgress(15, 'Sending...');

            let offset = 0;
            let seq = 0;

            while (offset < totalBytes) {
                const chunk = fileBlob.slice(offset, offset + CHUNK_SIZE);
                await waitForBufferedAmountLow(conn);
                conn.send(chunk);
                offset += chunk.size;
                seq += 1;

                const pct = Math.min(99, Math.round((offset / totalBytes) * 100));
                updateProgress(pct, `Sending... ${formatBytes(offset)} / ${formatBytes(totalBytes)}`);

                if (seq % 16 === 0) await new Promise(r => setTimeout(r, 0));
            }

            conn.send(JSON.stringify({ t: 'end', id: transferId }));

            updateProgress(100, 'Sent!');
            showToast(`Sent ${fileName}`);

            setTimeout(() => {
                hideProgress();
                selectedFiles = [];
                elements.fileInfo.classList.remove('visible');
                elements.fileInput.value = '';
                updateSendButton();
            }, 800);

        } catch (err) {
            console.error(err);
            showToast('Error sending file');
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
            showToast(`Receiving ${metaObj.name}...`);
            showProgress(`Receiving ${metaObj.name}...`);
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

                showToast(`Received ${s.meta.name}`);
                updateProgress(100, 'Received!');
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
                updateProgress(pct, `Receiving... ${formatBytes(s.receivedBytes)} / ${formatBytes(total)}`);
                return;
            }

            if (data.type === 'end') {
                const s = getState();
                if (!s || !s.meta || (s.meta.id && data.id && s.meta.id !== data.id)) return;

                const blob = new Blob(s.chunks, { type: s.meta.mime || 'application/octet-stream' });
                downloadFile(blob, s.meta.name);

                showToast(`Received ${s.meta.name}`);
                updateProgress(100, 'Received!');
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
    function init() {
        initElements();
        myName = generateNickname();
        renderMyName();

        // Click-to-copy name
        elements.myIdBox.addEventListener('click', async () => {
            const ok = await copyToClipboard(myName);
            showToast(ok ? 'Name copied!' : 'Copy failed (try HTTPS / allow clipboard)');
        });

        // Connect actions
        elements.connectBtn.addEventListener('click', connectToPeer);
        elements.targetNick.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') connectToPeer();
        });

        // Send action
        elements.sendBtn.addEventListener('click', sendFiles);

        // File handling
        initFileHandling();

        // Join room
        joinRoom(DEFAULT_ROOM);

        // Helpful hint for local file:// usage
        if (location.protocol === 'file:') {
            showToast('Tip: run via HTTPS/localhost for best browser support');
        }
    }

    // Start app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
