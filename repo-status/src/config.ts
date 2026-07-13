import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const GAMES_DIR = join(__dirname, '..', '..', 'games');
