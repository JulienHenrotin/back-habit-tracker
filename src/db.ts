import Database from 'better-sqlite3';
import path from 'path';

const dbFile = path.join(process.cwd(), 'data.db');
const db = new Database(dbFile);

// Initialize tables if they do not exist
const initHabits = `CREATE TABLE IF NOT EXISTS habits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  repetitions_per_day INTEGER NOT NULL
);`;
db.exec(initHabits);

const initEntries = `CREATE TABLE IF NOT EXISTS habit_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  repetitions INTEGER NOT NULL,
  UNIQUE(habit_id, day)
);`;
db.exec(initEntries);

export default db;
