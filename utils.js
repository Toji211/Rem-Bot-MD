import pkg from '@whiskeysockets/baileys';  // Importa todo el paquete
const { proto } = pkg;  // Desestructuramos el objeto para obtener 'proto'

async function convertToSticker(media, sock) {
  try {
    const mimeType = media.mimetype;
    if (!mimeType.startsWith('image/')) {
      throw new Error('El archivo no es una imagen');
    }

    const mediaBuffer = await sock.downloadMediaMessage(media); // Usamos el método adecuado de Baileys

    const stickerBuffer = await createSticker(mediaBuffer, mimeType);

    return stickerBuffer; // Retorna el buffer del sticker
  } catch (error) {
    console.error('Error al convertir a sticker:', error);
    throw error; // Lanza el error para que el comando lo maneje
  }
}

async function createSticker(fileBuffer, mimeType) {
  return fileBuffer; // Devuelve el buffer del archivo como ejemplo
}

async function downloadMusic(song) {
  try {
    const response = await axios.get(`https://api.example.com/download?query=${song}`, {
      responseType: 'arraybuffer',
    });
    return response.data; // Devuelve el archivo de música descargado
  } catch (error) {
    console.error('Error al descargar música:', error);
    throw error; // Lanza el error para que el comando lo maneje
  }
}

export { convertToSticker, downloadMusic };
