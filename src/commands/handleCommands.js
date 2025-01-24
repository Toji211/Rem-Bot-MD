// src/commands/handleCommands.js

import { downloadSticker } from '../media/mediaHandler.js';

const handleCommand = async (command, from, message, sock) => {
    if (command === '!sticker') {
        await downloadSticker(message, from, sock);
    }
    // Aquí puedes agregar otros comandos en el futuro
};

export { handleCommand };
