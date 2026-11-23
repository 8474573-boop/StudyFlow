// Перевірка вхідних даних. Будь-яка помилка — ValidationError (сервер поверне 400).
export class ValidationError extends Error { name = 'ValidationError'; }

export const STATUSES = ['todo', 'in_progress', 'done'];
export const PRIORITIES = ['low', 'med', 'high'];

// partial = true — для редагування, коли передають лише частину полів
export function validate(input, { partial = false } = {}) {
  if (!input || typeof input !== 'object') throw new ValidationError('Порожній запит');
  const out = {};

  if (!partial || 'title' in input) {
    const t = String(input.title ?? '').trim();
    if (!t) throw new ValidationError('Назва не може бути порожньою');
    if (t.length > 200) throw new ValidationError('Назва довша за 200 символів');
    out.title = t;
  }
  if ('status' in input) {
    if (!STATUSES.includes(input.status)) throw new ValidationError('Невідомий статус');
    out.status = input.status;
  }
  if ('priority' in input) {
    if (!PRIORITIES.includes(input.priority)) throw new ValidationError('Невідомий пріоритет');
    out.priority = input.priority;
  }
  if ('deadline' in input) {
    if (input.deadline && isNaN(Date.parse(input.deadline))) throw new ValidationError('Некоректна дата');
    out.deadline = input.deadline || null;
  }
  if ('tags' in input) {
    if (!Array.isArray(input.tags)) throw new ValidationError('tags має бути масивом');
    out.tags = input.tags.map(s => String(s).trim()).filter(Boolean);
  }
  return out; // лише дозволені поля — зайве відкидається
}
