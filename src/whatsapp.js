import * as baileys from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import axios from 'axios';

const OPENAI_API_KEY = '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';

// Objeto para almacenar la conversación temporalmente
const memory = {};

export const startBot = async () => {
  const { makeWASocket, useMultiFileAuthState } = baileys;

  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({
    auth: state,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, qr } = update;

    if (qr) {
      qrcode.generate(qr, { small: true });
      console.log('¡Escanea este código QR para autenticarte!');
    }

    if (connection === 'close') {
      console.log('Conexión cerrada. Reconectando...');
      startBot(); // Reconectar si la conexión se cierra
    } else if (connection === 'open') {
      console.log('Conexión a WhatsApp establecida.');
    }
  });

  sock.ev.on('messages.upsert', async (msg) => {
    const m = msg.messages[0];
    if (!m.message || m.key.fromMe) return;

    // Extraer el texto del mensaje, considerando diferentes tipos de mensajes
    const text =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      m.message.videoMessage?.caption ||
      '';

    const remoteJid = m.key.remoteJid;

    // Verifica si el mensaje comienza con "Rem" o "Rem,"
    const regex = /^rem[, ]/i; // "Rem," o "Rem " (con coma o espacio)
    if (regex.test(text)) {
      const userMessage = text.slice(4).trim(); // Eliminar "Rem," o "Rem " del inicio
      console.log(`Mensaje del usuario: ${userMessage}`);

      // Verifica si ya existe memoria para este usuario
      if (!memory[remoteJid]) {
        memory[remoteJid] = []; // Inicializa una memoria vacía
      }

      // Si el mensaje está vacío o no contiene contenido relevante, no procesar
      if (!userMessage) {
        await sock.sendMessage(remoteJid, { text: 'No he recibido un mensaje válido.' });
        return;
      }

      // Responde a mensajes específicos (puedes agregar más comandos aquí)
      if (userMessage.toLowerCase() === 'hola') {
        await sock.sendMessage(remoteJid, { text: '¡Hola! ¿En qué puedo ayudarte?' });
        return; // Sale de la función para evitar que consulte OpenAI
      }

      // Agregar el mensaje del usuario a la memoria
      memory[remoteJid].push({ role: 'user', content: userMessage });

      try {
        // Generar respuesta desde GPT, pasando el historial del usuario
        const botReply = await getAIResponse(memory[remoteJid]);

        // Verificar si la respuesta es válida y no está vacía
        if (botReply) {
          // Agregar la respuesta del bot a la memoria
          memory[remoteJid].push({ role: 'assistant', content: botReply });

          // Enviar la respuesta del bot al usuario
          await sock.sendMessage(remoteJid, { text: botReply });
        } else {
          await sock.sendMessage(remoteJid, { text: 'Lo siento, no pude generar una respuesta.' });
        }
      } catch (error) {
        console.error('Error al obtener la respuesta de OpenAI:', error);
        await sock.sendMessage(remoteJid, { text: 'Hubo un error al procesar tu solicitud.' });
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);
};

// Función para obtener una respuesta de OpenAI
const getAIResponse = async (conversation) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo', // O 'gpt-3.5-turbo' si no tienes acceso a GPT-4
        messages: conversation, // Enviar historial completo
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const botMessage = response.data.choices[0].message.content.trim();
    return botMessage;
  } catch (error) {
    console.error('Error al obtener respuesta de OpenAI:', error.response?.data || error.message);
    return 'Lo siento, no pude procesar tu mensaje en este momento.';
  }
};
