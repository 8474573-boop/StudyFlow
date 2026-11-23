// Прості перевірки ядра. Запуск: npm test
import { create, list, update, remove } from './src/taskService.js';

let ok = 0, fail = 0;
function check(name, fn) {
  try { fn(); console.log('OK  ', name); ok++; }
  catch (e) { console.log('FAIL', name, '-', e.message); fail++; }
}
function expectError(fn) {
  try { fn(); } catch { return; }
  throw new Error('очікувалась помилка, але її не було');
}

const t = create({ title: 'Тестова задача', tags: ['test'] });
check('задача створюється з id', () => { if (!t.id) throw new Error('немає id'); });
check('задача є у списку', () => { if (!list({ tag: 'test' }).length) throw new Error('не знайдено'); });
check('зміна статусу', () => { if (update(t.id, { status: 'in_progress' }).status !== 'in_progress') throw new Error(); });
check('порожня назва відхиляється', () => expectError(() => create({ title: '   ' })));
check('довга назва відхиляється', () => expectError(() => create({ title: 'а'.repeat(201) })));
check('невідомий пріоритет відхиляється', () => expectError(() => create({ title: 'x', priority: 'super' })));
check('невідомий id відхиляється', () => expectError(() => update('nope', { title: 'x' })));
remove(t.id);

console.log(`\nПройдено: ${ok}, впало: ${fail}`);
if (fail) process.exit(1);
