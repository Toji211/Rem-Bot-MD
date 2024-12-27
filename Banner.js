import chalk from 'chalk';

export function showBanner() {
  console.clear();

  // Banner original
  console.log(chalk.blue(`
    ██████╗ ███████╗███╗   ███╗
    ██╔══██╗██╔════╝████╗ ████║
    ██████╔╝█████╗  ██╔████╔██║
    ██╔══██╗██╔══╝  ██║╚██╔╝██║
    ██║  ██║███████╗██║ ╚═╝ ██║
    ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝
  `));

  // Información adicional
  console.log(`
    ${chalk.green.bold('🚀 REM-BOT-MD by ERICK')}
    ${chalk.green('-----------------------------------')}
    ${chalk.yellow.bold('⚡ Iniciando el sistema...')}
    ${chalk.blue.bold('🔧 Configuración del Sistema:')}
    ${chalk.white.bold('• Sistema Operativo:')} ${chalk.cyan(process.platform.padEnd(40))}
    ${chalk.white.bold('• Versión de Node.js:')} ${chalk.cyan(process.version.padEnd(40))}
    ${chalk.white.bold('• Memoria Total:')} ${chalk.cyan(`${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`.padEnd(40))}
    ${chalk.white.bold('• Memoria Libre:')} ${chalk.cyan(`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`.padEnd(40))}
    ${chalk.yellow.bold('🕒 Hora de inicio:')} ${chalk.white.bold(new Date().toLocaleString())}
  `);

  console.log(chalk.bgCyan.white.bold('───────────────────────────────────────────────────────────────────────────────────────────────'));
  console.log(`${chalk.green.bold('🚀 Rem-Bot-MD está listo para usar!')}`);

  // Mensajes de estado y logs
  console.log(chalk.bgYellow.black('🔧 Iniciando servicios principales...'));

  console.log(chalk.green('❯ Conectando a WhatsApp...'));
  console.log(chalk.green('❯ Conexión establecida.'));

  // Aquí puedes ver cómo se ven los logs más concisos y estéticos
  console.log(chalk.white('❯ ' + chalk.green('Mensaje recibido y procesado.')));

  console.log(chalk.blue('───────────────────────────────────────────────────────────────────────────────────────────────'));

  // Resumen de conexión con WhatsApp
  console.log(chalk.cyan('❯ Conexión a WhatsApp exitosa.'));
  console.log(chalk.cyan('❯ Usuario: 51917282040'));
  console.log(chalk.cyan('❯ Pre-keys disponibles: 25'));

  console.log(chalk.blue('───────────────────────────────────────────────────────────────────────────────────────────────'));
}
