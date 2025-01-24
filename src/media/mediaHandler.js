// src/media/mediaHandler.js

import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { fileTypeFromBuffer } from 'file-type';

const downloadSticker = async (message, from, sock) => {
    try {
        const media = await downloadMediaMessage(message, 'buffer');
        if (!media) throw new Error('No se pudo descargar el sticker.');

        const type = await fileTypeFromBuffer(media);

        if (!type) {
            throw new Error('No se pudo determinar el tipo de archivo.');
        }

        if (type.ext !== 'webp') {
            throw new Error(`El archivo no es un sticker válido (WebP). Tipo detectado: ${type.ext}`);
        }

        console.log('✅ Sticker descargado correctamente.');
        await sock.sendMessage(from, { sticker: media });
    } catch (err) {
        console.error('❌ Error al manejar el archivo de sticker:', err.message);
        await sock.sendMessage(from, { text: 'No se pudo procesar el sticker. Intenta de nuevo.' });
    }
};

export { downloadSticker };
