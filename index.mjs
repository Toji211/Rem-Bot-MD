import os from 'os';
import chalk from 'chalk';
import pino from 'pino';
import fetch from 'node-fetch';
import { makeWASocket, fetchLatestBaileysVersion, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { showBanner } from './Banner.js'; // Asegúrate de que este archivo esté correctamente configurado

// Configuración del logger (ajustada para evitar conflictos)
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

// Mostrar el banner al inicio
console.clear();
showBanner();

// Formatear memoria
const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Información del sistema
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

// Variables para reconexión
let reconnectionAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectInterval = 5000;

// Manejo de reconexión
const handleReconnect = () => {
  if (reconnectionAttempts < maxReconnectAttempts) {
    console.log(chalk.yellow(`🔄 Intentando reconectar... (Intento ${reconnectionAttempts + 1}/${maxReconnectAttempts})`));
    reconnectionAttempts++;
    setTimeout(() => {
      process.exit(1); // Reiniciar el proceso
    }, reconnectInterval);
  } else {
    console.log(chalk.red('❌ Demasiados intentos de reconexión fallidos. Deteniendo el proceso.'));
    process.exit(1); // Finalizar el proceso tras fallar múltiples veces
  }
};

// Enviar mensaje
const sendMessage = async (sock, jid, text) => {
  try {
    await sock.sendMessage(jid, { text });
    console.log(chalk.green(`✅ Mensaje enviado a ${jid}: ${text}`));
  } catch (error) {
    console.error(chalk.red(`❌ Error al enviar mensaje a ${jid}: ${error.message}`));
  }
};

// Iniciar el bot
(async () => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      auth: state,
      logger,
      version,
      emitOwnEvents: true,
      maxCachedMessages: 1000, // Soporte para grupos grandes
    });

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401; // Reconectar si no es un cierre por credenciales inválidas
        console.log(chalk.red('❌ Conexión cerrada.'));
        if (shouldReconnect) handleReconnect();
      } else if (connection === 'open') {
        console.log(chalk.green('✅ Bot conectado exitosamente.'));
        reconnectionAttempts = 0; // Reiniciar el contador de reconexión
      }
    });

    sock.ev.on('creds.update', saveCreds);
    console.log(chalk.green('🚀 Rem-Bot-MD está listo para usar.'));

    // Evento para recibir mensajes
    sock.ev.on('messages.upsert', async (m) => {
      if (m.type === 'notify') {
        const message = m.messages[0];

        // Ignorar mensajes enviados por el bot o mensajes vacíos
        if (!message || message.key.fromMe || !message.message) return;

        const text = message.message?.conversation || ''; // Obtener el texto del mensaje
        const remoteJid = message.key.remoteJid;

        if (!isValidMessage(text)) {
          console.error(chalk.yellow('⚠️ Mensaje inválido:', text));
          return;
        }

        console.log(`📩 Mensaje recibido de ${remoteJid}: ${text}`);
        try {
          const response = await fetch('http://127.0.0.1:5000/mensaje', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mensaje: text.trim(), // Mensaje del usuario
              user_id: message.key.participant || remoteJid || '', // ID del usuario
            }),
          });

          if (!response.ok) {
            console.error(chalk.red('❌ Error en la respuesta del servidor Flask:', response.status, response.statusText));
            await sendMessage(sock, remoteJid, 'Hubo un error en el servidor. Intenta nuevamente más tarde.');
            return;
          }

          const data = await response.json();

          if (data && data.respuesta) {
            console.log(chalk.blue('🤖 Respuesta de la IA:', data.respuesta));
            await sendMessage(sock, remoteJid, data.respuesta);
          } else {
            console.error(chalk.yellow('⚠️ Respuesta inválida del servidor:', data));
            await sendMessage(sock, remoteJid, 'Lo siento, algo salió mal. Intenta nuevamente más tarde.');
          }
        } catch (error) {
          console.error('❌ Error al procesar mensaje:', error.message);
          await sendMessage(sock, remoteJid, 'Hubo un problema al procesar tu mensaje. Intenta nuevamente.');
        }
      }
    });
  } catch (error) {
    console.error('❌ Error crítico al iniciar el bot:', error.message);
    handleReconnect();
  }
})();

// Validar mensajes antes de procesarlos
const isValidMessage = (message) => {
  return message && message.trim().length > 0;
};
