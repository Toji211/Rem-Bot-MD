import fetch from 'node-fetch';
import { convertToSticker } from '../utils.js'; // Asegúrate de que la función está importada

const stickerCommand = async (sock, from, message) => {
    const { message: msg } = message;

    if (msg.imageMessage) {
        const imageUrl = msg.imageMessage.url;

        console.log('📸 Comando de sticker detectado con imagen.');

        // Descargamos la imagen
        try {
            const response = await fetch(imageUrl);
            const buffer = await response.buffer();

            // Intentamos convertir cualquier imagen a WebP
            console.log('📂 Intentando convertir la imagen a WebP...');
            const stickerBuffer = await convertToSticker(buffer);

            // Enviar la imagen como sticker
            await sock.sendMessage(from, { sticker: stickerBuffer });
            console.log('✅ Sticker enviado exitosamente.');
        } catch (error) {
            console.error('❌ Error al manejar el archivo de sticker:', error);
            await sock.sendMessage(from, { text: 'Hubo un error al procesar el sticker.' });
        }
    } else {
        console.log('❌ No se encontró una imagen para convertir en sticker.');
        await sock.sendMessage(from, { text: 'Por favor, envíame una imagen para convertirla en sticker.' });
    }
};

export default stickerCommand;
