// Веб-сервер: віддає сторінку з папки public і REST API на /api.
import express from 'express';
import * as svc from './taskService.js';

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.get('/api/tasks', (req, res) => res.json(svc.list(req.query)));
app.post('/api/tasks', (req, res) => res.status(201).json(svc.create(req.body)));
app.patch('/api/tasks/:id', (req, res) => res.json(svc.update(req.params.id, req.body)));
app.delete('/api/tasks/:id', (req, res) => { svc.remove(req.params.id); res.status(204).end(); });
app.get('/api/stats', (req, res) => res.json(svc.stats()));

app.get('/api/export.csv', (req, res) => {
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = svc.list().map(t =>
    [t.title, t.status, t.priority, t.deadline, t.tags.join(';'), t.createdAt].map(esc).join(','));
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', 'attachment; filename="tasks.csv"');
  // ﻿ — щоб Excel правильно показав українські літери
  res.send('﻿' + ['title,status,priority,deadline,tags,createdAt', ...rows].join('\n'));
});

// Єдиний обробник помилок
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
  if (err.name === 'NotFoundError') return res.status(404).json({ error: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Некоректний JSON' });
  console.error(err);
  res.status(500).json({ error: 'Внутрішня помилка сервера' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущено: http://localhost:${PORT}`));
