// Демо-дані. Запуск: npm run seed
import { create, update } from './src/taskService.js';

const d = days => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

const tasks = [
  { title: 'Захист проєкту Task Tracker', priority: 'high', deadline: d(1), tags: ['університет'] },
  { title: 'Лаба 4 з ООП', priority: 'high', deadline: d(-2), tags: ['університет', 'ооп'] },
  { title: 'Прочитати розділ про event loop', priority: 'med', deadline: d(5), tags: ['навчання'] },
  { title: 'Підготуватись до контрольної з матану', priority: 'high', deadline: d(3), tags: ['університет'] },
  { title: 'Оновити резюме', priority: 'low', deadline: null, tags: ['карʼєра'] },
  { title: 'Зробити портфоліо на GitHub', priority: 'med', deadline: d(14), tags: ['карʼєра'] },
  { title: 'Купити продукти', priority: 'low', deadline: d(0), tags: ['побут'] },
  { title: 'Оплатити інтернет', priority: 'med', deadline: d(-1), tags: ['побут'] },
  { title: 'Тренування', priority: 'low', deadline: null, tags: ['спорт'] },
  { title: 'Написати README', priority: 'med', deadline: d(1), tags: ['університет'] },
];

const created = tasks.map(create);
update(created[2].id, { status: 'in_progress' });
update(created[3].id, { status: 'in_progress' });
update(created[6].id, { status: 'done' });
update(created[8].id, { status: 'done' });
console.log(`Додано ${created.length} демо-задач`);
