import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';
import { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initializeTestDb = async () => {
  const sql = await fs.readFile(path.resolve(__dirname, '../table.sql'), 'utf8');
  await pool.query(sql);
};

const getToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET);
};

export { initializeTestDb, insertTestUser, getToken };
