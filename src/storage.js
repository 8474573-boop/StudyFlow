// Збереження задач у JSON-файл.
// Пишемо атомарно: спочатку в .tmp, потім rename — файл не зіпсується,
// навіть якщо програму вбити посеред запису.
import fs from 'node:fs';
import path from 'node:path';

const FILE = path.resolve('data/tasks.json');

export function load() {
  try {
    const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch (e) {
    if (e.code === 'ENOENT') return []; // файлу ще немає — починаємо з порожнього списку
    // файл зіпсований (наприклад, відредагований вручну) — робимо бекап і стартуємо з нуля
    fs.copyFileSync(FILE, FILE + '.broken');
    console.warn('tasks.json пошкоджений, копію збережено в tasks.json.broken');
    return [];
  }
}

export function save(tasks) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(tasks, null, 2));
  fs.renameSync(tmp, FILE);
}
