import { startBot } from './src/whatsapp.js';
import os from 'os';
import { execSync } from 'child_process';
import * as Whatsapp from './src/whatsapp.js';
const SESSION_FILE_PATH = './auth/session.json';

console.log(chalk.green('Starting Rem-Bot-MD...'));

startBot();

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

import chalk from 'chalk';

// Banner personalizado para Rem-Bot-MD
const banner = `
${chalk.blue(`

██████╗ ███████╗███╗   ███╗
██╔══██╗██╔════╝████╗ ████║
██████╔╝█████╗  ██╔████╔██║
██╔══██╗██╔══╝  ██║╚██╔╝██║
██║  ██║███████╗██║ ╚═╝ ██║
╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝
`)}
$chalk.green('REM-BOT-MD by ERICK')}
`;

console.clear();
console.log(banner);

// Información del sistema
console.log(chalk.yellow('Iniciando Rem-Bot-MD...\n'));
console.log(`${chalk.cyan('🖥️ Sistema Operativo:')} ${os.type()}, ${os.release()} - ${os.arch()}`);
console.log(`${chalk.cyan('💾 Memoria Total:')} ${formatBytes(os.totalmem())}`);
console.log(`${chalk.cyan('💽 Memoria Libre:')} ${formatBytes(os.freemem())}`);

// Fecha y hora actual
const now = new Date();
console.log(`${chalk.cyan('⏰ Fecha y Hora Actual:')} ${now.toLocaleString()}`);

// Información del paquete
console.log(`${chalk.cyan('\n📦 Información del Paquete:')}`);
console.log(`Nombre: ${chalk.green('Rem-Bot-MD')}`);
console.log(`Versión: ${chalk.green('1.0.0')}`);
console.log(`Descripción: ${chalk.green('Customizable WhatsApp Bot')}`);
console.log(`Autor: ${chalk.green('Erick')}\n`);

// Ejecutar el bot principal
execSync('node src/whatsapp.js', { stdio: 'inherit' });
