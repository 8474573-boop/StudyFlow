// Уся логіка роботи із задачами.
import crypto from 'node:crypto';
import { load, save } from './storage.js';
import { validate, ValidationError } from './validation.js';

export class NotFoundError extends Error { name = 'NotFoundError'; }

// Дозволені переходи між статусами
const TRANSITIONS = {
  todo: ['in_progress', 'done'],
  in_progress: ['done', 'todo'],
  done: ['todo', 'in_progress'],
};
const RANK = { high: 0, med: 1, low: 2 };

let tasks = load();
const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);
const isOverdue = t => Boolean(t.deadline && t.deadline < today() && t.status !== 'done');

export function list({ status, priority, tag, q, overdue } = {}) {
  return tasks
    .filter(t => !status || t.status === status)
    .filter(t => !priority || t.priority === priority)
    .filter(t => !tag || t.tags.includes(tag))
    .filter(t => !q || t.title.toLowerCase().includes(String(q).toLowerCase()))
    .filter(t => !overdue || isOverdue(t))
    .sort((a, b) => RANK[a.priority] - RANK[b.priority]);
}

export function create(input) {
  const d = validate(input);
  const task = {
    id: crypto.randomUUID(),
    title: d.title,
    status: 'todo',
    priority: d.priority ?? 'med',
    deadline: d.deadline ?? null,
    tags: d.tags ?? [],
    createdAt: now(),
    updatedAt: now(),
  };
  tasks.push(task);
  save(tasks);
  return task;
}

export function update(id, input) {
  const task = tasks.find(t => t.id === id);
  if (!task) throw new NotFoundError('Задачу не знайдено');
  const d = validate(input, { partial: true });
  if (d.status && d.status !== task.status && !TRANSITIONS[task.status].includes(d.status)) {
    throw new ValidationError(`Не можна перейти з ${task.status} у ${d.status}`);
  }
  Object.assign(task, d, { updatedAt: now() });
  save(tasks);
  return task;
}

export function remove(id) {
  const i = tasks.findIndex(t => t.id === id);
  if (i === -1) throw new NotFoundError('Задачу не знайдено');
  tasks.splice(i, 1);
  save(tasks);
}

export function stats() {
  const count = s => tasks.filter(t => t.status === s).length;
  return {
    total: tasks.length,
    todo: count('todo'),
    in_progress: count('in_progress'),
    done: count('done'),
    overdue: tasks.filter(isOverdue).length,
  };
}
