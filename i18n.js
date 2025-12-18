/**
 * LocalDrop - Internationalization (i18n) & Theme Management
 * Supports: English, German, French, Spanish, Italian, Portuguese, Dutch, Polish, Russian, Japanese, Chinese
 */

const I18n = (() => {
    const LANG_STORAGE_KEY = 'localdrop_lang';
    const THEME_STORAGE_KEY = 'localdrop_theme';

    // Translations
    const translations = {
        en: {
            yourName: 'Your Name (click to edit)',
            editName: 'Edit name',
            clickToCopy: 'Click to copy',
            connectToDevice: 'Connect to Device',
            enterTheirName: 'Enter their name...',
            connect: 'Connect',
            connectedDevices: 'Connected Devices',
            nearbyDevices: 'Nearby Devices',
            scanForDevices: 'Scan for devices',
            scanning: 'Scanning for devices...',
            noDevicesFound: 'No nearby devices found',
            sendFiles: 'Send Files',
            dropFiles: 'Drop files here or click to browse',
            supportsAnyFile: 'Supports any file type',
            sendFilesBtn: 'Send Files',
            preparing: 'Preparing...',
            zipping: 'Zipping files...',
            sending: 'Sending...',
            receiving: 'Receiving...',
            sent: 'Sent!',
            received: 'Received!',
            ready: 'Ready to connect',
            nameCopied: 'Name copied!',
            copyFailed: 'Copy failed (try HTTPS / allow clipboard)',
            connectingTo: 'Connecting to {name}...',
            connected: '{name} connected!',
            joined: '{name} joined',
            left: '{name} left',
            deviceNotFound: 'Device not found',
            networkError: 'Network error - retrying...',
            notReadyYet: 'Not ready yet',
            errorSending: 'Error sending file',
            sentFile: 'Sent {name}',
            receivedFile: 'Received {name}',
            receivingFile: 'Receiving {name}...',
            receivingBusy: 'Receiving on this connection; try again after it finishes',
            nameChanged: 'Name changed to {name}',
            nameTooShort: 'Name must be at least 3 characters',
            httpsHint: 'Tip: run via HTTPS/localhost for best browser support',
            justNow: 'just now',
            secondsAgo: '{n}s ago',
            minutesAgo: '{n}m ago',
            hoursAgo: '{n}h ago',
            files: '{n} file(s) - {size}'
        },

        de: {
            yourName: 'Dein Name (zum Bearbeiten klicken)',
            editName: 'Name bearbeiten',
            clickToCopy: 'Zum Kopieren klicken',
            connectToDevice: 'Mit Geraet verbinden',
            enterTheirName: 'Namen eingeben...',
            connect: 'Verbinden',
            connectedDevices: 'Verbundene Geraete',
            nearbyDevices: 'Geraete in der Naehe',
            scanForDevices: 'Nach Geraeten suchen',
            scanning: 'Suche nach Geraeten...',
            noDevicesFound: 'Keine Geraete gefunden',
            sendFiles: 'Dateien senden',
            dropFiles: 'Dateien hier ablegen oder klicken',
            supportsAnyFile: 'Alle Dateitypen unterstuetzt',
            sendFilesBtn: 'Dateien senden',
            preparing: 'Vorbereiten...',
            zipping: 'Komprimieren...',
            sending: 'Senden...',
            receiving: 'Empfangen...',
            sent: 'Gesendet!',
            received: 'Empfangen!',
            ready: 'Bereit zum Verbinden',
            nameCopied: 'Name kopiert!',
            copyFailed: 'Kopieren fehlgeschlagen',
            connectingTo: 'Verbinde mit {name}...',
            connected: '{name} verbunden!',
            joined: '{name} beigetreten',
            left: '{name} hat verlassen',
            deviceNotFound: 'Geraet nicht gefunden',
            networkError: 'Netzwerkfehler - erneuter Versuch...',
            notReadyYet: 'Noch nicht bereit',
            errorSending: 'Fehler beim Senden',
            sentFile: '{name} gesendet',
            receivedFile: '{name} empfangen',
            receivingFile: 'Empfange {name}...',
            receivingBusy: 'Empfang laeuft; bitte warten',
            nameChanged: 'Name geaendert zu {name}',
            nameTooShort: 'Name muss mind. 3 Zeichen haben',
            httpsHint: 'Tipp: HTTPS/localhost fuer beste Unterstuetzung',
            justNow: 'gerade eben',
            secondsAgo: 'vor {n}s',
            minutesAgo: 'vor {n}m',
            hoursAgo: 'vor {n}h',
            files: '{n} Datei(en) - {size}'
        },

        fr: {
            yourName: 'Votre nom (cliquez pour modifier)',
            editName: 'Modifier le nom',
            clickToCopy: 'Cliquez pour copier',
            connectToDevice: 'Connecter a un appareil',
            enterTheirName: 'Entrez leur nom...',
            connect: 'Connecter',
            connectedDevices: 'Appareils connectes',
            nearbyDevices: 'Appareils a proximite',
            scanForDevices: 'Rechercher des appareils',
            scanning: 'Recherche d\'appareils...',
            noDevicesFound: 'Aucun appareil trouve',
            sendFiles: 'Envoyer des fichiers',
            dropFiles: 'Deposez les fichiers ici ou cliquez',
            supportsAnyFile: 'Tous types de fichiers',
            sendFilesBtn: 'Envoyer',
            preparing: 'Preparation...',
            zipping: 'Compression...',
            sending: 'Envoi...',
            receiving: 'Reception...',
            sent: 'Envoye!',
            received: 'Recu!',
            ready: 'Pret a connecter',
            nameCopied: 'Nom copie!',
            copyFailed: 'Echec de la copie',
            connectingTo: 'Connexion a {name}...',
            connected: '{name} connecte!',
            joined: '{name} rejoint',
            left: '{name} parti',
            deviceNotFound: 'Appareil non trouve',
            networkError: 'Erreur reseau - nouvelle tentative...',
            notReadyYet: 'Pas encore pret',
            errorSending: 'Erreur d\'envoi',
            sentFile: '{name} envoye',
            receivedFile: '{name} recu',
            receivingFile: 'Reception de {name}...',
            receivingBusy: 'Reception en cours; reessayez apres',
            nameChanged: 'Nom change en {name}',
            nameTooShort: 'Le nom doit avoir au moins 3 caracteres',
            httpsHint: 'Conseil: utilisez HTTPS pour un meilleur support',
            justNow: 'a l\'instant',
            secondsAgo: 'il y a {n}s',
            minutesAgo: 'il y a {n}m',
            hoursAgo: 'il y a {n}h',
            files: '{n} fichier(s) - {size}'
        },

        es: {
            yourName: 'Tu nombre (clic para editar)',
            editName: 'Editar nombre',
            clickToCopy: 'Clic para copiar',
            connectToDevice: 'Conectar a dispositivo',
            enterTheirName: 'Ingresa su nombre...',
            connect: 'Conectar',
            connectedDevices: 'Dispositivos conectados',
            nearbyDevices: 'Dispositivos cercanos',
            scanForDevices: 'Buscar dispositivos',
            scanning: 'Buscando dispositivos...',
            noDevicesFound: 'No se encontraron dispositivos',
            sendFiles: 'Enviar archivos',
            dropFiles: 'Suelta archivos aqui o haz clic',
            supportsAnyFile: 'Soporta cualquier tipo de archivo',
            sendFilesBtn: 'Enviar',
            preparing: 'Preparando...',
            zipping: 'Comprimiendo...',
            sending: 'Enviando...',
            receiving: 'Recibiendo...',
            sent: 'Enviado!',
            received: 'Recibido!',
            ready: 'Listo para conectar',
            nameCopied: 'Nombre copiado!',
            copyFailed: 'Error al copiar',
            connectingTo: 'Conectando a {name}...',
            connected: '{name} conectado!',
            joined: '{name} se unio',
            left: '{name} se fue',
            deviceNotFound: 'Dispositivo no encontrado',
            networkError: 'Error de red - reintentando...',
            notReadyYet: 'Aun no esta listo',
            errorSending: 'Error al enviar',
            sentFile: '{name} enviado',
            receivedFile: '{name} recibido',
            receivingFile: 'Recibiendo {name}...',
            receivingBusy: 'Recibiendo; intenta despues',
            nameChanged: 'Nombre cambiado a {name}',
            nameTooShort: 'El nombre debe tener al menos 3 caracteres',
            httpsHint: 'Consejo: usa HTTPS para mejor soporte',
            justNow: 'ahora mismo',
            secondsAgo: 'hace {n}s',
            minutesAgo: 'hace {n}m',
            hoursAgo: 'hace {n}h',
            files: '{n} archivo(s) - {size}'
        },

        it: {
            yourName: 'Il tuo nome (clicca per modificare)',
            editName: 'Modifica nome',
            clickToCopy: 'Clicca per copiare',
            connectToDevice: 'Connetti a dispositivo',
            enterTheirName: 'Inserisci il loro nome...',
            connect: 'Connetti',
            connectedDevices: 'Dispositivi connessi',
            nearbyDevices: 'Dispositivi vicini',
            scanForDevices: 'Cerca dispositivi',
            scanning: 'Ricerca dispositivi...',
            noDevicesFound: 'Nessun dispositivo trovato',
            sendFiles: 'Invia file',
            dropFiles: 'Trascina i file qui o clicca',
            supportsAnyFile: 'Supporta qualsiasi tipo di file',
            sendFilesBtn: 'Invia',
            preparing: 'Preparazione...',
            zipping: 'Compressione...',
            sending: 'Invio...',
            receiving: 'Ricezione...',
            sent: 'Inviato!',
            received: 'Ricevuto!',
            ready: 'Pronto per connettersi',
            nameCopied: 'Nome copiato!',
            copyFailed: 'Copia fallita',
            connectingTo: 'Connessione a {name}...',
            connected: '{name} connesso!',
            joined: '{name} si e unito',
            left: '{name} e uscito',
            deviceNotFound: 'Dispositivo non trovato',
            networkError: 'Errore di rete - riprovo...',
            notReadyYet: 'Non ancora pronto',
            errorSending: 'Errore nell\'invio',
            sentFile: '{name} inviato',
            receivedFile: '{name} ricevuto',
            receivingFile: 'Ricezione {name}...',
            receivingBusy: 'Ricezione in corso; riprova dopo',
            nameChanged: 'Nome cambiato in {name}',
            nameTooShort: 'Il nome deve avere almeno 3 caratteri',
            httpsHint: 'Consiglio: usa HTTPS per miglior supporto',
            justNow: 'adesso',
            secondsAgo: '{n}s fa',
            minutesAgo: '{n}m fa',
            hoursAgo: '{n}h fa',
            files: '{n} file - {size}'
        },

        pt: {
            yourName: 'Seu nome (clique para editar)',
            editName: 'Editar nome',
            clickToCopy: 'Clique para copiar',
            connectToDevice: 'Conectar a dispositivo',
            enterTheirName: 'Digite o nome...',
            connect: 'Conectar',
            connectedDevices: 'Dispositivos conectados',
            nearbyDevices: 'Dispositivos proximos',
            scanForDevices: 'Buscar dispositivos',
            scanning: 'Buscando dispositivos...',
            noDevicesFound: 'Nenhum dispositivo encontrado',
            sendFiles: 'Enviar arquivos',
            dropFiles: 'Solte arquivos aqui ou clique',
            supportsAnyFile: 'Suporta qualquer tipo de arquivo',
            sendFilesBtn: 'Enviar',
            preparing: 'Preparando...',
            zipping: 'Compactando...',
            sending: 'Enviando...',
            receiving: 'Recebendo...',
            sent: 'Enviado!',
            received: 'Recebido!',
            ready: 'Pronto para conectar',
            nameCopied: 'Nome copiado!',
            copyFailed: 'Falha ao copiar',
            connectingTo: 'Conectando a {name}...',
            connected: '{name} conectado!',
            joined: '{name} entrou',
            left: '{name} saiu',
            deviceNotFound: 'Dispositivo nao encontrado',
            networkError: 'Erro de rede - tentando novamente...',
            notReadyYet: 'Ainda nao esta pronto',
            errorSending: 'Erro ao enviar',
            sentFile: '{name} enviado',
            receivedFile: '{name} recebido',
            receivingFile: 'Recebendo {name}...',
            receivingBusy: 'Recebendo; tente depois',
            nameChanged: 'Nome alterado para {name}',
            nameTooShort: 'O nome deve ter pelo menos 3 caracteres',
            httpsHint: 'Dica: use HTTPS para melhor suporte',
            justNow: 'agora mesmo',
            secondsAgo: 'ha {n}s',
            minutesAgo: 'ha {n}m',
            hoursAgo: 'ha {n}h',
            files: '{n} arquivo(s) - {size}'
        },

        nl: {
            yourName: 'Je naam (klik om te bewerken)',
            editName: 'Naam bewerken',
            clickToCopy: 'Klik om te kopieren',
            connectToDevice: 'Verbinden met apparaat',
            enterTheirName: 'Voer hun naam in...',
            connect: 'Verbinden',
            connectedDevices: 'Verbonden apparaten',
            nearbyDevices: 'Apparaten in de buurt',
            scanForDevices: 'Zoeken naar apparaten',
            scanning: 'Zoeken naar apparaten...',
            noDevicesFound: 'Geen apparaten gevonden',
            sendFiles: 'Bestanden verzenden',
            dropFiles: 'Sleep bestanden hierheen of klik',
            supportsAnyFile: 'Ondersteunt elk bestandstype',
            sendFilesBtn: 'Verzenden',
            preparing: 'Voorbereiden...',
            zipping: 'Comprimeren...',
            sending: 'Verzenden...',
            receiving: 'Ontvangen...',
            sent: 'Verzonden!',
            received: 'Ontvangen!',
            ready: 'Klaar om te verbinden',
            nameCopied: 'Naam gekopieerd!',
            copyFailed: 'Kopieren mislukt',
            connectingTo: 'Verbinden met {name}...',
            connected: '{name} verbonden!',
            joined: '{name} is toegetreden',
            left: '{name} is vertrokken',
            deviceNotFound: 'Apparaat niet gevonden',
            networkError: 'Netwerkfout - opnieuw proberen...',
            notReadyYet: 'Nog niet klaar',
            errorSending: 'Fout bij verzenden',
            sentFile: '{name} verzonden',
            receivedFile: '{name} ontvangen',
            receivingFile: 'Ontvangen {name}...',
            receivingBusy: 'Bezig met ontvangen; probeer later',
            nameChanged: 'Naam gewijzigd naar {name}',
            nameTooShort: 'Naam moet minimaal 3 tekens hebben',
            httpsHint: 'Tip: gebruik HTTPS voor beste ondersteuning',
            justNow: 'zojuist',
            secondsAgo: '{n}s geleden',
            minutesAgo: '{n}m geleden',
            hoursAgo: '{n}u geleden',
            files: '{n} bestand(en) - {size}'
        },

        pl: {
            yourName: 'Twoja nazwa (kliknij aby edytowac)',
            editName: 'Edytuj nazwe',
            clickToCopy: 'Kliknij aby skopiowac',
            connectToDevice: 'Polacz z urzadzeniem',
            enterTheirName: 'Wpisz ich nazwe...',
            connect: 'Polacz',
            connectedDevices: 'Polaczone urzadzenia',
            nearbyDevices: 'Urzadzenia w poblizu',
            scanForDevices: 'Szukaj urzadzen',
            scanning: 'Szukanie urzadzen...',
            noDevicesFound: 'Nie znaleziono urzadzen',
            sendFiles: 'Wyslij pliki',
            dropFiles: 'Upusc pliki tutaj lub kliknij',
            supportsAnyFile: 'Obsluguje wszystkie typy plikow',
            sendFilesBtn: 'Wyslij',
            preparing: 'Przygotowywanie...',
            zipping: 'Kompresowanie...',
            sending: 'Wysylanie...',
            receiving: 'Odbieranie...',
            sent: 'Wyslano!',
            received: 'Odebrano!',
            ready: 'Gotowy do polaczenia',
            nameCopied: 'Nazwa skopiowana!',
            copyFailed: 'Kopiowanie nie powiodlo sie',
            connectingTo: 'Laczenie z {name}...',
            connected: '{name} polaczony!',
            joined: '{name} dolaczyl',
            left: '{name} wyszedl',
            deviceNotFound: 'Urzadzenie nie znalezione',
            networkError: 'Blad sieci - ponawiam...',
            notReadyYet: 'Jeszcze nie gotowe',
            errorSending: 'Blad wysylania',
            sentFile: '{name} wyslano',
            receivedFile: '{name} odebrano',
            receivingFile: 'Odbieranie {name}...',
            receivingBusy: 'Odbieranie w toku; sprobuj pozniej',
            nameChanged: 'Nazwa zmieniona na {name}',
            nameTooShort: 'Nazwa musi miec co najmniej 3 znaki',
            httpsHint: 'Wskazowka: uzyj HTTPS dla lepszej obslugi',
            justNow: 'przed chwila',
            secondsAgo: '{n}s temu',
            minutesAgo: '{n}m temu',
            hoursAgo: '{n}h temu',
            files: '{n} plik(ow) - {size}'
        },

        ru: {
            yourName: 'Vashe imya (nazmite dlya redaktirovaniya)',
            editName: 'Redaktirovat imya',
            clickToCopy: 'Nazmite dlya kopirovaniya',
            connectToDevice: 'Podklyuchit ustroistvo',
            enterTheirName: 'Vvedite ih imya...',
            connect: 'Podklyuchit',
            connectedDevices: 'Podklyuchennye ustroistva',
            nearbyDevices: 'Ustroistva poblizosti',
            scanForDevices: 'Iskat ustroistva',
            scanning: 'Poisk ustroistv...',
            noDevicesFound: 'Ustroistva ne naideny',
            sendFiles: 'Otpravit faily',
            dropFiles: 'Peretashchite faily syuda ili nazmite',
            supportsAnyFile: 'Podderzhivaet lyuboy tip failov',
            sendFilesBtn: 'Otpravit',
            preparing: 'Podgotovka...',
            zipping: 'Szhatie...',
            sending: 'Otpravka...',
            receiving: 'Poluchenie...',
            sent: 'Otpravleno!',
            received: 'Polucheno!',
            ready: 'Gotov k podklyucheniyu',
            nameCopied: 'Imya skopirovano!',
            copyFailed: 'Oshibka kopirovaniya',
            connectingTo: 'Podklyuchenie k {name}...',
            connected: '{name} podklyuchen!',
            joined: '{name} prisoedinilsya',
            left: '{name} vyshel',
            deviceNotFound: 'Ustroistvo ne naideno',
            networkError: 'Oshibka seti - povtor...',
            notReadyYet: 'Eshche ne gotov',
            errorSending: 'Oshibka otpravki',
            sentFile: '{name} otpravlen',
            receivedFile: '{name} poluchen',
            receivingFile: 'Poluchenie {name}...',
            receivingBusy: 'Poluchenie; poprobuite pozhe',
            nameChanged: 'Imya izmeneno na {name}',
            nameTooShort: 'Imya dolzhno imet minimum 3 simvola',
            httpsHint: 'Sovet: ispolzuite HTTPS dlya luchshey podderzhki',
            justNow: 'tolko chto',
            secondsAgo: '{n}s nazad',
            minutesAgo: '{n}m nazad',
            hoursAgo: '{n}h nazad',
            files: '{n} fail(ov) - {size}'
        },

        ja: {
            yourName: 'Your Name (click to edit)',
            editName: 'Edit name',
            clickToCopy: 'Click to copy',
            connectToDevice: 'Connect to Device',
            enterTheirName: 'Enter their name...',
            connect: 'Connect',
            connectedDevices: 'Connected Devices',
            nearbyDevices: 'Nearby Devices',
            scanForDevices: 'Scan for devices',
            scanning: 'Scanning...',
            noDevicesFound: 'No devices found',
            sendFiles: 'Send Files',
            dropFiles: 'Drop files here or click',
            supportsAnyFile: 'Supports any file type',
            sendFilesBtn: 'Send',
            preparing: 'Preparing...',
            zipping: 'Zipping...',
            sending: 'Sending...',
            receiving: 'Receiving...',
            sent: 'Sent!',
            received: 'Received!',
            ready: 'Ready',
            nameCopied: 'Name copied!',
            copyFailed: 'Copy failed',
            connectingTo: 'Connecting to {name}...',
            connected: '{name} connected!',
            joined: '{name} joined',
            left: '{name} left',
            deviceNotFound: 'Device not found',
            networkError: 'Network error - retrying...',
            notReadyYet: 'Not ready yet',
            errorSending: 'Error sending file',
            sentFile: 'Sent {name}',
            receivedFile: 'Received {name}',
            receivingFile: 'Receiving {name}...',
            receivingBusy: 'Receiving; try again after',
            nameChanged: 'Name changed to {name}',
            nameTooShort: 'Name must be at least 3 characters',
            httpsHint: 'Tip: Use HTTPS for best support',
            justNow: 'just now',
            secondsAgo: '{n}s ago',
            minutesAgo: '{n}m ago',
            hoursAgo: '{n}h ago',
            files: '{n} file(s) - {size}'
        },

        zh: {
            yourName: 'Your Name (click to edit)',
            editName: 'Edit name',
            clickToCopy: 'Click to copy',
            connectToDevice: 'Connect to Device',
            enterTheirName: 'Enter their name...',
            connect: 'Connect',
            connectedDevices: 'Connected Devices',
            nearbyDevices: 'Nearby Devices',
            scanForDevices: 'Scan for devices',
            scanning: 'Scanning...',
            noDevicesFound: 'No devices found',
            sendFiles: 'Send Files',
            dropFiles: 'Drop files here or click',
            supportsAnyFile: 'Supports any file type',
            sendFilesBtn: 'Send',
            preparing: 'Preparing...',
            zipping: 'Zipping...',
            sending: 'Sending...',
            receiving: 'Receiving...',
            sent: 'Sent!',
            received: 'Received!',
            ready: 'Ready',
            nameCopied: 'Name copied!',
            copyFailed: 'Copy failed',
            connectingTo: 'Connecting to {name}...',
            connected: '{name} connected!',
            joined: '{name} joined',
            left: '{name} left',
            deviceNotFound: 'Device not found',
            networkError: 'Network error - retrying...',
            notReadyYet: 'Not ready yet',
            errorSending: 'Error sending file',
            sentFile: 'Sent {name}',
            receivedFile: 'Received {name}',
            receivingFile: 'Receiving {name}...',
            receivingBusy: 'Receiving; try again after',
            nameChanged: 'Name changed to {name}',
            nameTooShort: 'Name must be at least 3 characters',
            httpsHint: 'Tip: Use HTTPS for best support',
            justNow: 'just now',
            secondsAgo: '{n}s ago',
            minutesAgo: '{n}m ago',
            hoursAgo: '{n}h ago',
            files: '{n} file(s) - {size}'
        }
    };

    // Language display names for the dropdown
    const languageNames = {
        en: { code: 'EN', name: 'English' },
        de: { code: 'DE', name: 'Deutsch' },
        fr: { code: 'FR', name: 'Francais' },
        es: { code: 'ES', name: 'Espanol' },
        it: { code: 'IT', name: 'Italiano' },
        pt: { code: 'PT', name: 'Portugues' },
        nl: { code: 'NL', name: 'Nederlands' },
        pl: { code: 'PL', name: 'Polski' },
        ru: { code: 'RU', name: 'Russkiy' },
        ja: { code: 'JA', name: 'Japanese' },
        zh: { code: 'ZH', name: 'Chinese' }
    };

    let currentLang = 'en';
    let currentTheme = 'light';

    // Detect browser language
    function detectLanguage() {
        const saved = localStorage.getItem(LANG_STORAGE_KEY);
        if (saved && translations[saved]) {
            return saved;
        }

        // Check browser languages
        const browserLangs = navigator.languages || [navigator.language || navigator.userLanguage || 'en'];
        for (const lang of browserLangs) {
            const shortLang = lang.split('-')[0].toLowerCase();
            if (translations[shortLang]) {
                return shortLang;
            }
        }

        return 'en';
    }

    // Detect system theme preference
    function detectTheme() {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (saved) {
            return saved;
        }

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return 'light';
    }

    // Get translation with optional interpolation
    function t(key, params = {}) {
        const dict = translations[currentLang] || translations.en;
        let text = dict[key] || translations.en[key] || key;

        Object.keys(params).forEach(param => {
            text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
        });

        return text;
    }

    // Update all DOM elements with data-i18n attributes
    function updateDOM() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = t(key);
        });

        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = t(key);
        });

        document.documentElement.lang = currentLang;
    }

    // Set language
    function setLanguage(lang) {
        if (!translations[lang]) return;

        currentLang = lang;
        localStorage.setItem(LANG_STORAGE_KEY, lang);
        updateDOM();

        // Update select element
        const select = document.getElementById('langSelect');
        if (select) {
            select.value = lang;
        }
    }

    // Get current language
    function getLanguage() {
        return currentLang;
    }

    // Set theme
    function setTheme(theme) {
        currentTheme = theme;
        localStorage.setItem(THEME_STORAGE_KEY, theme);
        document.documentElement.setAttribute('data-theme', theme);
    }

    // Toggle theme
    function toggleTheme() {
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    }

    // Get current theme
    function getTheme() {
        return currentTheme;
    }

    // Setup language select
    function setupLanguageSelect() {
        const select = document.getElementById('langSelect');
        if (!select) return;

        // Set initial value
        select.value = currentLang;

        // Handle change
        select.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }

    // Initialize
    function init() {
        currentLang = detectLanguage();
        currentTheme = detectTheme();

        // Apply theme immediately
        document.documentElement.setAttribute('data-theme', currentTheme);

        // Setup language select
        setupLanguageSelect();

        // Update DOM
        updateDOM();

        // Setup theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(THEME_STORAGE_KEY)) {
                    setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    // Auto-init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    return {
        t,
        setLanguage,
        getLanguage,
        setTheme,
        toggleTheme,
        getTheme,
        updateDOM
    };
})();
