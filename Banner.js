import cfonts from 'cfonts';
import { createRequire } from 'module';

// Obtener datos de package.json
const require = createRequire(import.meta.url);
const { name, author } = require('./package.json');

// Función para mostrar el banner
export function showBanner() {
  console.clear(); // Limpiar la consola antes de mostrar el banner

  // Mostrar el mensaje de inicio con el diseño del banner
  cfonts.say(name, {
    font: 'chrome',
    align: 'center',
    gradient: ['cyan', 'blue'],
  });

  cfonts.say(`by: ${author.name}`, {
    font: 'console',
    align: 'center',
    gradient: ['cyan', 'blue'],
  });

  // Mensaje adicional o cualquier otra cosa que quieras agregar
  console.log('\nIniciando 🚀🚀🚀');
}
