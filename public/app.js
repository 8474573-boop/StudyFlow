// Логіка сторінки: завантажує задачі з API і малює Kanban-дошку.
const $ = s => document.querySelector(s);

async function api(url, opts = {}) {
  const r = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  if (r.status === 204) return null;
  const data = await r.json();
  if (!r.ok) { alert(data.error || 'Помилка'); throw new Error(data.error); }
  return data;
}

const today = () => new Date().toISOString().slice(0, 10);

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text; // textContent — захист від HTML-ін'єкцій
  return e;
}

function renderCard(t) {
  const overdue = t.deadline && t.deadline < today() && t.status !== 'done';
  const card = el('article', `card ${t.priority}${overdue ? ' overdue' : ''}`);
  card.draggable = true;
  card.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', t.id));

  const title = el('strong', '', t.title);
  title.title = 'Подвійний клік — редагувати';
  title.addEventListener('dblclick', async () => {
    const value = prompt('Нова назва задачі:', t.title);
    if (value === null) return;
    await api(`/api/tasks/${t.id}`, { method: 'PATCH', body: JSON.stringify({ title: value }) }).catch(() => {});
    render();
  });
  card.append(title);

  if (t.deadline) card.append(el('small', '', (overdue ? 'Прострочено: ' : 'До: ') + t.deadline));

  const tags = el('div', 'tags');
  for (const tag of t.tags) {
    const chip = el('span', '', '#' + tag);
    chip.addEventListener('click', () => { $('#tag').value = tag; render(); });
    tags.append(chip);
  }
  card.append(tags);

  const del = el('button', 'del', '✕');
  del.title = 'Видалити';
  del.addEventListener('click', async () => {
    if (!confirm(`Видалити «${t.title}»?`)) return;
    await api(`/api/tasks/${t.id}`, { method: 'DELETE' });
    render();
  });
  card.append(del);
  return card;
}

async function render() {
  const p = new URLSearchParams();
  if ($('#q').value) p.set('q', $('#q').value);
  if ($('#tag').value) p.set('tag', $('#tag').value.replace(/^#/, ''));
  if ($('#overdue').checked) p.set('overdue', '1');

  const tasks = await api('/api/tasks?' + p);
  document.querySelectorAll('.list').forEach(l => l.replaceChildren());
  for (const t of tasks) {
    document.querySelector(`[data-status="${t.status}"] .list`).append(renderCard(t));
  }

  const s = await api('/api/stats');
  $('#stats').textContent =
    `Всього: ${s.total} · В роботі: ${s.in_progress} · Виконано: ${s.done} · Прострочено: ${s.overdue}`;
}

// Перетягування карток між колонками
document.querySelectorAll('.col').forEach(col => {
  col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('over'); });
  col.addEventListener('dragleave', () => col.classList.remove('over'));
  col.addEventListener('drop', async e => {
    e.preventDefault();
    col.classList.remove('over');
    const id = e.dataTransfer.getData('text/plain');
    await api(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status: col.dataset.status }) }).catch(() => {});
    render();
  });
});

// Створення задачі
$('#new-task').addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  await api('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      title: f.get('title'),
      priority: f.get('priority'),
      deadline: f.get('deadline') || null,
      tags: f.get('tags').split(',').map(s => s.trim()).filter(Boolean),
    }),
  }).catch(() => {});
  e.target.reset();
  render();
});

['#q', '#tag', '#overdue'].forEach(s => $(s).addEventListener('input', render));
render();
