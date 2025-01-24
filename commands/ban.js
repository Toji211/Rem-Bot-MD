const banCommand = async (sock, from, message) => {
    const { message: msg } = message;

    if (msg.text && msg.text.includes('@')) {
        const userToBan = msg.text.match(/@([0-9]{11})/); // Extrae el número de teléfono

        if (userToBan) {
            try {
                // Banea al usuario
                await sock.groupRemove(from, [userToBan[1]]);
                console.log(`✅ Usuario ${userToBan[1]} baneado.`);
                await sock.sendMessage(from, { text: `El usuario @${userToBan[1]} ha sido baneado.` });
            } catch (error) {
                console.error('❌ Error al banear al usuario:', error);
                await sock.sendMessage(from, { text: 'No se pudo banear al usuario.' });
            }
        } else {
            await sock.sendMessage(from, { text: 'Por favor, menciona a un usuario para banearlo.' });
        }
    }
};

export default banCommand;
