# LocalDrop

**[Live Demo](https://peda1996.github.io/LocalDrop/)**

A peer-to-peer file sharing web application that allows you to share files directly between devices on the same network without uploading to any server.

## Features

- **P2P File Transfer**: Direct device-to-device file sharing using WebRTC
- **No Server Upload**: Files are transferred directly between browsers
- **Auto-Discovery**: Automatically discovers nearby devices using BroadcastChannel API
- **Multi-Language Support**: Available in English, German, French, Spanish, Italian, Portuguese, Dutch, Polish, Russian, Japanese, and Chinese
- **Dark Mode**: Automatic system theme detection with manual toggle
- **Editable Name**: Customize your device name for easy identification
- **Multiple Files**: Send multiple files at once (automatically zipped)
- **Progress Tracking**: Real-time transfer progress with speed indication
- **Cross-Browser**: Works on Chrome, Firefox, Edge, and other modern browsers

## Usage

1. Open `index.html` in a web browser
2. Share your name with the person you want to connect to
3. Enter their name and click "Connect"
4. Drag and drop files or click to browse
5. Click "Send Files" to transfer

For best results, access via HTTPS or localhost.

## Quick Start

Simply open `index.html` in your browser. No installation required!

For local development, you can use any static file server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve

# Using PHP
php -S localhost:8080
```

Then open `http://localhost:8080` in your browser.

## How It Works

LocalDrop uses [PeerJS](https://peerjs.com/) for WebRTC signaling and establishes direct peer-to-peer connections between browsers. Files are transferred in 64KB chunks with backpressure handling for optimal performance.

### Discovery Methods

1. **BroadcastChannel API**: Instant discovery for tabs/windows on the same origin
2. **Manual Connection**: Enter the device name to connect directly
3. **Recent Devices**: Previously connected devices are remembered

## Browser Support

- Chrome 80+
- Firefox 75+
- Edge 80+
- Safari 14+

## Files

- `index.html` - Main HTML structure
- `styles.css` - Modern CSS with dark mode support
- `app.js` - Core application logic
- `i18n.js` - Internationalization and theme management

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

Made by [Peda1996](https://github.com/Peda1996)

[photogala.net](https://photogala.net)
