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
            subtitle: 'P2P File Sharing',
            yourName: 'Your Name',
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
            dropFiles: 'Drop files here',
            dropFilesDesc: 'or click to browse',
            supportsAnyFile: 'Supports any file type',
            sendFilesBtn: 'Send Files',
            privacyTitle: 'Privacy First',
            privacyDesc: 'Files transfer directly between devices. No server upload, no data stored.',
            madeWith: 'Made with',
            by: 'by',
            forProject: 'for',
            toggleDarkMode: 'Toggle dark mode',
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
            subtitle: 'P2P Dateifreigabe',
            yourName: 'Dein Name',
            editName: 'Name bearbeiten',
            clickToCopy: 'Zum Kopieren klicken',
            connectToDevice: 'Mit Gerät verbinden',
            enterTheirName: 'Namen eingeben...',
            connect: 'Verbinden',
            connectedDevices: 'Verbundene Geräte',
            nearbyDevices: 'Geräte in der Nähe',
            scanForDevices: 'Nach Geräten suchen',
            scanning: 'Suche nach Geräten...',
            noDevicesFound: 'Keine Geräte gefunden',
            sendFiles: 'Dateien senden',
            dropFiles: 'Dateien hier ablegen',
            dropFilesDesc: 'oder klicken zum Durchsuchen',
            supportsAnyFile: 'Alle Dateitypen unterstützt',
            sendFilesBtn: 'Dateien senden',
            privacyTitle: 'Datenschutz zuerst',
            privacyDesc: 'Dateien werden direkt zwischen Geräten übertragen. Kein Server-Upload, keine Datenspeicherung.',
            madeWith: 'Erstellt mit',
            by: 'von',
            forProject: 'für',
            toggleDarkMode: 'Dunkelmodus umschalten',
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
            deviceNotFound: 'Gerät nicht gefunden',
            networkError: 'Netzwerkfehler - erneuter Versuch...',
            notReadyYet: 'Noch nicht bereit',
            errorSending: 'Fehler beim Senden',
            sentFile: '{name} gesendet',
            receivedFile: '{name} empfangen',
            receivingFile: 'Empfange {name}...',
            receivingBusy: 'Empfang läuft; bitte warten',
            nameChanged: 'Name geändert zu {name}',
            nameTooShort: 'Name muss mind. 3 Zeichen haben',
            httpsHint: 'Tipp: HTTPS/localhost für beste Unterstützung',
            justNow: 'gerade eben',
            secondsAgo: 'vor {n}s',
            minutesAgo: 'vor {n}m',
            hoursAgo: 'vor {n}h',
            files: '{n} Datei(en) - {size}'
        },

        fr: {
            subtitle: 'Partage de fichiers P2P',
            yourName: 'Votre nom',
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
            dropFiles: 'Deposez les fichiers ici',
            dropFilesDesc: 'ou cliquez pour parcourir',
            supportsAnyFile: 'Tous types de fichiers',
            sendFilesBtn: 'Envoyer',
            privacyTitle: 'Confidentialite d\'abord',
            privacyDesc: 'Les fichiers sont transferes directement entre appareils. Pas de telechargement serveur.',
            madeWith: 'Fait avec',
            by: 'par',
            forProject: 'pour',
            toggleDarkMode: 'Basculer le mode sombre',
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
            subtitle: 'Compartir archivos P2P',
            yourName: 'Tu nombre',
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
            dropFiles: 'Suelta archivos aqui',
            dropFilesDesc: 'o haz clic para explorar',
            supportsAnyFile: 'Soporta cualquier tipo de archivo',
            sendFilesBtn: 'Enviar',
            privacyTitle: 'Privacidad primero',
            privacyDesc: 'Los archivos se transfieren directamente entre dispositivos. Sin carga a servidor.',
            madeWith: 'Hecho con',
            by: 'por',
            forProject: 'para',
            toggleDarkMode: 'Cambiar modo oscuro',
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
            subtitle: 'Condivisione file P2P',
            yourName: 'Il tuo nome',
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
            dropFiles: 'Trascina i file qui',
            dropFilesDesc: 'o clicca per sfogliare',
            supportsAnyFile: 'Supporta qualsiasi tipo di file',
            sendFilesBtn: 'Invia',
            privacyTitle: 'Privacy prima di tutto',
            privacyDesc: 'I file vengono trasferiti direttamente tra dispositivi. Nessun caricamento su server.',
            madeWith: 'Fatto con',
            by: 'da',
            forProject: 'per',
            toggleDarkMode: 'Attiva/disattiva modalità scura',
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
            subtitle: 'Compartilhamento de arquivos P2P',
            yourName: 'Seu nome',
            editName: 'Editar nome',
            clickToCopy: 'Clique para copiar',
            connectToDevice: 'Conectar a dispositivo',
            enterTheirName: 'Digite o nome...',
            connect: 'Conectar',
            connectedDevices: 'Dispositivos conectados',
            nearbyDevices: 'Dispositivos próximos',
            scanForDevices: 'Buscar dispositivos',
            scanning: 'Buscando dispositivos...',
            noDevicesFound: 'Nenhum dispositivo encontrado',
            sendFiles: 'Enviar arquivos',
            dropFiles: 'Solte arquivos aqui',
            dropFilesDesc: 'ou clique para explorar',
            supportsAnyFile: 'Suporta qualquer tipo de arquivo',
            sendFilesBtn: 'Enviar',
            privacyTitle: 'Privacidade primeiro',
            privacyDesc: 'Arquivos são transferidos diretamente entre dispositivos. Sem upload para servidor.',
            madeWith: 'Feito com',
            by: 'por',
            forProject: 'para',
            toggleDarkMode: 'Alternar modo escuro',
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
            subtitle: 'P2P bestandsdeling',
            yourName: 'Je naam',
            editName: 'Naam bewerken',
            clickToCopy: 'Klik om te kopiëren',
            connectToDevice: 'Verbinden met apparaat',
            enterTheirName: 'Voer hun naam in...',
            connect: 'Verbinden',
            connectedDevices: 'Verbonden apparaten',
            nearbyDevices: 'Apparaten in de buurt',
            scanForDevices: 'Zoeken naar apparaten',
            scanning: 'Zoeken naar apparaten...',
            noDevicesFound: 'Geen apparaten gevonden',
            sendFiles: 'Bestanden verzenden',
            dropFiles: 'Sleep bestanden hierheen',
            dropFilesDesc: 'of klik om te bladeren',
            supportsAnyFile: 'Ondersteunt elk bestandstype',
            sendFilesBtn: 'Verzenden',
            privacyTitle: 'Privacy eerst',
            privacyDesc: 'Bestanden worden direct tussen apparaten overgedragen. Geen server upload.',
            madeWith: 'Gemaakt met',
            by: 'door',
            forProject: 'voor',
            toggleDarkMode: 'Donkere modus schakelen',
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
            subtitle: 'Udostępnianie plików P2P',
            yourName: 'Twoja nazwa',
            editName: 'Edytuj nazwę',
            clickToCopy: 'Kliknij aby skopiować',
            connectToDevice: 'Połącz z urządzeniem',
            enterTheirName: 'Wpisz ich nazwę...',
            connect: 'Połącz',
            connectedDevices: 'Połączone urządzenia',
            nearbyDevices: 'Urządzenia w pobliżu',
            scanForDevices: 'Szukaj urządzeń',
            scanning: 'Szukanie urządzeń...',
            noDevicesFound: 'Nie znaleziono urządzeń',
            sendFiles: 'Wyślij pliki',
            dropFiles: 'Upuść pliki tutaj',
            dropFilesDesc: 'lub kliknij aby przeglądać',
            supportsAnyFile: 'Obsługuje wszystkie typy plików',
            sendFilesBtn: 'Wyślij',
            privacyTitle: 'Prywatność przede wszystkim',
            privacyDesc: 'Pliki są przesyłane bezpośrednio między urządzeniami. Bez uploadu na serwer.',
            madeWith: 'Stworzone z',
            by: 'przez',
            forProject: 'dla',
            toggleDarkMode: 'Przełącz tryb ciemny',
            preparing: 'Przygotowywanie...',
            zipping: 'Kompresowanie...',
            sending: 'Wysyłanie...',
            receiving: 'Odbieranie...',
            sent: 'Wysłano!',
            received: 'Odebrano!',
            ready: 'Gotowy do połączenia',
            nameCopied: 'Nazwa skopiowana!',
            copyFailed: 'Kopiowanie nie powiodło się',
            connectingTo: 'Łączenie z {name}...',
            connected: '{name} połączony!',
            joined: '{name} dołączył',
            left: '{name} wyszedł',
            deviceNotFound: 'Urządzenie nie znalezione',
            networkError: 'Błąd sieci - ponawiam...',
            notReadyYet: 'Jeszcze nie gotowe',
            errorSending: 'Błąd wysyłania',
            sentFile: '{name} wysłano',
            receivedFile: '{name} odebrano',
            receivingFile: 'Odbieranie {name}...',
            receivingBusy: 'Odbieranie w toku; spróbuj później',
            nameChanged: 'Nazwa zmieniona na {name}',
            nameTooShort: 'Nazwa musi mieć co najmniej 3 znaki',
            httpsHint: 'Wskazówka: użyj HTTPS dla lepszej obsługi',
            justNow: 'przed chwilą',
            secondsAgo: '{n}s temu',
            minutesAgo: '{n}m temu',
            hoursAgo: '{n}h temu',
            files: '{n} plik(ów) - {size}'
        },

        ru: {
            subtitle: 'P2P обмен файлами',
            yourName: 'Ваше имя',
            editName: 'Редактировать имя',
            clickToCopy: 'Нажмите для копирования',
            connectToDevice: 'Подключить устройство',
            enterTheirName: 'Введите их имя...',
            connect: 'Подключить',
            connectedDevices: 'Подключенные устройства',
            nearbyDevices: 'Устройства поблизости',
            scanForDevices: 'Искать устройства',
            scanning: 'Поиск устройств...',
            noDevicesFound: 'Устройства не найдены',
            sendFiles: 'Отправить файлы',
            dropFiles: 'Перетащите файлы сюда',
            dropFilesDesc: 'или нажмите для выбора',
            supportsAnyFile: 'Поддерживает любой тип файлов',
            sendFilesBtn: 'Отправить',
            privacyTitle: 'Конфиденциальность',
            privacyDesc: 'Файлы передаются напрямую между устройствами. Без загрузки на сервер.',
            madeWith: 'Сделано с',
            by: '',
            forProject: 'для',
            toggleDarkMode: 'Переключить тёмный режим',
            preparing: 'Подготовка...',
            zipping: 'Сжатие...',
            sending: 'Отправка...',
            receiving: 'Получение...',
            sent: 'Отправлено!',
            received: 'Получено!',
            ready: 'Готов к подключению',
            nameCopied: 'Имя скопировано!',
            copyFailed: 'Ошибка копирования',
            connectingTo: 'Подключение к {name}...',
            connected: '{name} подключен!',
            joined: '{name} присоединился',
            left: '{name} вышел',
            deviceNotFound: 'Устройство не найдено',
            networkError: 'Ошибка сети - повтор...',
            notReadyYet: 'Ещё не готов',
            errorSending: 'Ошибка отправки',
            sentFile: '{name} отправлен',
            receivedFile: '{name} получен',
            receivingFile: 'Получение {name}...',
            receivingBusy: 'Получение; попробуйте позже',
            nameChanged: 'Имя изменено на {name}',
            nameTooShort: 'Имя должно иметь минимум 3 символа',
            httpsHint: 'Совет: используйте HTTPS для лучшей поддержки',
            justNow: 'только что',
            secondsAgo: '{n}с назад',
            minutesAgo: '{n}м назад',
            hoursAgo: '{n}ч назад',
            files: '{n} файл(ов) - {size}'
        },

        ja: {
            subtitle: 'P2Pファイル共有',
            yourName: 'あなたの名前',
            editName: '名前を編集',
            clickToCopy: 'クリックしてコピー',
            connectToDevice: 'デバイスに接続',
            enterTheirName: '相手の名前を入力...',
            connect: '接続',
            connectedDevices: '接続済みデバイス',
            nearbyDevices: '近くのデバイス',
            scanForDevices: 'デバイスを検索',
            scanning: '検索中...',
            noDevicesFound: 'デバイスが見つかりません',
            sendFiles: 'ファイルを送信',
            dropFiles: 'ここにファイルをドロップ',
            dropFilesDesc: 'またはクリックして参照',
            supportsAnyFile: 'すべてのファイル形式に対応',
            sendFilesBtn: '送信',
            privacyTitle: 'プライバシー優先',
            privacyDesc: 'ファイルはデバイス間で直接転送されます。サーバーアップロードなし。',
            madeWith: '',
            by: '',
            forProject: '',
            toggleDarkMode: 'ダークモード切替',
            preparing: '準備中...',
            zipping: '圧縮中...',
            sending: '送信中...',
            receiving: '受信中...',
            sent: '送信完了！',
            received: '受信完了！',
            ready: '準備完了',
            nameCopied: '名前をコピーしました！',
            copyFailed: 'コピー失敗',
            connectingTo: '{name}に接続中...',
            connected: '{name}が接続しました！',
            joined: '{name}が参加しました',
            left: '{name}が退出しました',
            deviceNotFound: 'デバイスが見つかりません',
            networkError: 'ネットワークエラー - 再試行中...',
            notReadyYet: 'まだ準備ができていません',
            errorSending: '送信エラー',
            sentFile: '{name}を送信しました',
            receivedFile: '{name}を受信しました',
            receivingFile: '{name}を受信中...',
            receivingBusy: '受信中; 後で再試行してください',
            nameChanged: '名前を{name}に変更しました',
            nameTooShort: '名前は3文字以上必要です',
            httpsHint: 'ヒント: HTTPSを使用してください',
            justNow: 'たった今',
            secondsAgo: '{n}秒前',
            minutesAgo: '{n}分前',
            hoursAgo: '{n}時間前',
            files: '{n}ファイル - {size}'
        },

        zh: {
            subtitle: 'P2P文件共享',
            yourName: '您的名称',
            editName: '编辑名称',
            clickToCopy: '点击复制',
            connectToDevice: '连接到设备',
            enterTheirName: '输入对方名称...',
            connect: '连接',
            connectedDevices: '已连接设备',
            nearbyDevices: '附近设备',
            scanForDevices: '搜索设备',
            scanning: '搜索中...',
            noDevicesFound: '未找到设备',
            sendFiles: '发送文件',
            dropFiles: '将文件拖放到此处',
            dropFilesDesc: '或点击浏览',
            supportsAnyFile: '支持任何文件类型',
            sendFilesBtn: '发送',
            privacyTitle: '隐私优先',
            privacyDesc: '文件直接在设备之间传输。无服务器上传。',
            madeWith: '由',
            by: '',
            forProject: '为',
            toggleDarkMode: '切换深色模式',
            preparing: '准备中...',
            zipping: '压缩中...',
            sending: '发送中...',
            receiving: '接收中...',
            sent: '已发送！',
            received: '已接收！',
            ready: '准备就绪',
            nameCopied: '名称已复制！',
            copyFailed: '复制失败',
            connectingTo: '正在连接到{name}...',
            connected: '{name}已连接！',
            joined: '{name}已加入',
            left: '{name}已离开',
            deviceNotFound: '未找到设备',
            networkError: '网络错误 - 重试中...',
            notReadyYet: '尚未准备好',
            errorSending: '发送错误',
            sentFile: '已发送{name}',
            receivedFile: '已接收{name}',
            receivingFile: '正在接收{name}...',
            receivingBusy: '正在接收; 请稍后重试',
            nameChanged: '名称已更改为{name}',
            nameTooShort: '名称至少需要3个字符',
            httpsHint: '提示: 请使用HTTPS以获得最佳支持',
            justNow: '刚刚',
            secondsAgo: '{n}秒前',
            minutesAgo: '{n}分钟前',
            hoursAgo: '{n}小时前',
            files: '{n}个文件 - {size}'
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
