import os from 'os';
import chalk from 'chalk';
import pino from 'pino';
import { makeWASocket, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import { showBanner } from './Banner.js';
import { handleCommand } from './src/commands/handleCommands.js'; // Importar el manejador de comandos
import { processMessageText } from './src/messages/messageProcessor.js'; // Importar el procesador de mensajes
import { formatBytes } from './src/utils/utils.js'; // Importar las utilidades
import { downloadSticker } from './src/media/mediaHandler.js'; // Importar el manejador de stickers
import { useMultiFileAuthState } from '@whiskeysockets/baileys';
import fetch from 'node-fetch'; // Importar fetch para las solicitudes HTTP

const { state, saveCreds } = await useMultiFileAuthState('./auth');

let sock;

const logger = pino({
    level: 'info',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
            singleLine: true,
        },
    },
});

console.clear();
showBanner();
const systemInfo = {
    os: `${os.type()} ${os.release()} - ${os.arch()}`,
    totalMem: formatBytes(os.totalmem()),
    freeMem: formatBytes(os.freemem()),
    currentTime: new Date().toLocaleString(),
};

console.log(`🖥️ Sistema Operativo: ${systemInfo.os}`);
console.log(`💾 Memoria Total: ${systemInfo.totalMem}`);
console.log(`💽 Memoria Libre: ${systemInfo.freeMem}`);
console.log(`⏰ Fecha y Hora Actual: ${systemInfo.currentTime}`);
console.log('🚀 Iniciando servicios principales...\n');

let reconnectionAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectInterval = 5000;

const handleReconnect = () => {
    if (reconnectionAttempts < maxReconnectAttempts) {
        console.log(chalk.yellow(`🔄 Intentando reconectar... (Intento ${reconnectionAttempts + 1}/${maxReconnectAttempts})`));
        reconnectionAttempts++;
        setTimeout(() => {
            process.exit(1);
        }, reconnectInterval);
    } else {
        console.log(chalk.red('❌ Demasiados intentos de reconexión fallidos. Deteniendo el proceso.'));
        process.exit(1);
    }
};

const initializeBot = async () => {
    try {
        const { version } = await fetchLatestBaileysVersion();

        sock = makeWASocket({
            auth: state,
            logger,
            version,
            emitOwnEvents: true,
            maxCachedMessages: 1000,
        });

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log('Código QR generado:');
                qrcode.generate(qr, { small: true }); // Muestra el QR en la terminal
            }
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
                console.log(chalk.red('❌ Conexión cerrada.'));
                if (shouldReconnect) handleReconnect();
            } else if (connection === 'open') {                                                                                                                                                   console.log(chalk.green('✅ Bot conectado exitosamente.'));
                reconnectionAttempts = 0;
            }
        });                                                                                                                                                                                                                                                                                                                                                                 sock.ev.on('creds.update', saveCreds);
        console.log(chalk.green('🚀 Rem-Bot-MD está listo para usar.'));

        sock.ev.on('messages.upsert', async (message) => {
            try {
                const { messages } = message;
                const m = messages[0];
                const from = m.key.remoteJid;

                if (!m.message || from === 'status@broadcast') return;

                const sender = from.split('@')[0]; // Extrae el número del remitente
                const textMessage = m.message.conversation || m.message.imageMessage?.caption || 'Mensaje sin texto';
                const timestamp = new Date(m.messageTimestamp * 1000).toLocaleString();

                console.log(chalk.blue(`\n🗣️ Nuevo mensaje de: ${chalk.bold(sender)}`));
                console.log(chalk.green(`🕒 Enviado a las: ${chalk.bold(timestamp)}`));
                console.log(chalk.cyan(`💬 Mensaje: ${chalk.bold(textMessage)}`));
                console.log('--------------------------------------------');

                const normalizedText = processMessageText(textMessage);

                // Comprobamos si es un mensaje con imagen y el comando de sticker
                if (m.message.imageMessage?.caption?.startsWith('!sticker')) {
                    console.log('📸 Comando de sticker detectado con imagen.');
                    await downloadSticker(m, from, sock);
                    return;
                }

                // Procesar comandos de texto
                if (normalizedText.startsWith('!')) {
                    const [command, ...args] = normalizedText.split(' ');
                    await handleCommand(command, from, m, sock);
                    return;
                }

                // Enviar el mensaje al servidor Flask para que la IA lo procese
                const response = await fetch('http://127.0.0.1:5000/process_message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: normalizedText }),
                });

                // Verificar que la respuesta sea válida
                if (!response.ok) {
                    throw new Error('Error al conectar con el servidor Flask');
                }

                const responseData = await response.json();

                // Comprobamos si la respuesta contiene el campo esperado
                if (!responseData.response) {
                    throw new Error('El servidor no devolvió una respuesta válida');
                }

                const aiResponse = responseData.response; // Respuesta de la IA

                // Enviar la respuesta de la IA al usuario
                await sock.sendMessage(from, { text: aiResponse });
                console.log(chalk.green(`💬 Respuesta enviada: ${chalk.bold(aiResponse)}`));
            } catch (err) {
                console.error('❌ Error al procesar el mensaje:', err);
            }
        });

    } catch (error) {
        console.error('❌ Error crítico al iniciar el bot:', error.message);
        handleReconnect();
    }
};

initializeBot();
