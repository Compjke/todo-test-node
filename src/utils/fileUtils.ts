import { PathLike } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utils
export const loadData = async (path: PathLike) => {
  try {
    const content = await fs.readFile(path, 'utf-8');
    if (content) {
      return JSON.parse(content);
    }
  } catch (err) {
    if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
      console.log(err);
    }
    throw err;
  }
};

export const saveData = async (path: PathLike, data: unknown) => {
  await fs.writeFile(path, JSON.stringify(data, null, 2));
};

export const TODOS_FILE_PATH = path.join(__dirname, '../../data/todos.json');
export const USERS_FILE_PATH = path.join(__dirname, '../../data/users.json');
