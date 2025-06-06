import { Router } from 'express';
import db from '../db.js';

const router = Router();

// Get all habits
router.get('/', (req, res) => {
  const habits = db.prepare('SELECT * FROM habits').all();
  res.json(habits);
});

// Get a specific habit
router.get('/:id', (req, res) => {
  const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(req.params.id);
  if (!habit) {
    res.status(404).json({ error: 'Habit not found' });
  } else {
    const entries = db
      .prepare('SELECT day, repetitions FROM habit_entries WHERE habit_id = ?')
      .all(req.params.id);
    res.json({ ...habit, entries });
  }
});

// Create a new habit
router.post('/', (req, res) => {
  const { name, repetitionsPerDay } = req.body;
  if (!name || typeof repetitionsPerDay !== 'number') {
    res.status(400).json({ error: 'Missing name or repetitionsPerDay' });
    return;
  }
  const stmt = db.prepare('INSERT INTO habits (name, repetitions_per_day) VALUES (?, ?)');
  const info = stmt.run(name, repetitionsPerDay);
  res.status(201).json({ id: info.lastInsertRowid, name, repetitionsPerDay });
});

// Update repetitions for a specific day
router.put('/:id/days/:day', (req, res) => {
  const { repetitions } = req.body;
  if (typeof repetitions !== 'number') {
    res.status(400).json({ error: 'Missing repetitions' });
    return;
  }
  const habit = db.prepare('SELECT id FROM habits WHERE id = ?').get(req.params.id);
  if (!habit) {
    res.status(404).json({ error: 'Habit not found' });
    return;
  }
  const stmt = db.prepare(
    'INSERT INTO habit_entries (habit_id, day, repetitions) VALUES (?, ?, ?)' +
      ' ON CONFLICT(habit_id, day) DO UPDATE SET repetitions=excluded.repetitions'
  );
  stmt.run(req.params.id, req.params.day, repetitions);
  res.json({ habitId: Number(req.params.id), day: req.params.day, repetitions });
});

export default router;
