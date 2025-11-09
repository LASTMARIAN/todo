import { pool } from '../helper/db.js'
import { Router } from 'express'
import { hash, compare } from 'bcrypt'
import jwt from 'jsonwebtoken'

const { sign } = jwt

const router = Router()

router.post('/signup', (req, res, next) => {
  try {
    const { user } = req.body;
    if (!user || !user.email || !user.password) {
      const err = new Error('Email and password are required');
      err.status = 400;
      return next(err);
    }

    hash(user.password, 10, (hashErr, hashedPassword) => {
      if (hashErr) return next(hashErr);

      pool.query(
        'INSERT INTO account (email, password) VALUES ($1, $2) RETURNING id, email',
        [user.email, hashedPassword],
        (dbErr, result) => {
          if (dbErr) {
            if (dbErr.code === '23505') {
              const err = new Error('Email already exists');
              err.status = 409;
              return next(err);
            }
            return next(dbErr);
          }
          const row = result.rows[0];
          return res.status(201).json({ id: row.id, email: row.email });
        }
      );
    });
  } catch (e) {
    return next(e);
  }
});

router.post('/signin', async (req, res, next) => {
  const startedAt = Date.now();
  try {
    const { user } = req.body;
    if (!user || !user.email || !user.password) {
      console.warn('[signin] 400 missing fields', {
        emailPresent: Boolean(user?.email),
        passwordPresent: Boolean(user?.password),
      });
      const err = new Error('Email and password are required');
      err.status = 400;
      return next(err);
    }

    console.info('[signin] query user by email', { email: user.email });
    const { rows } = await pool.query(
      'SELECT id, email, password FROM account WHERE email = $1',
      [user.email]
    );
    const found = rows[0];

    if (!found) {
      console.warn('[signin] 400 user not found', { email: user.email });
      const err = new Error('Invalid credentials');
      err.status = 400;
      return next(err);
    }

    const ok = await compare(user.password, found.password);
    if (!ok) {
      console.warn('[signin] 400 wrong password', { userId: found.id, email: found.email });
      const err = new Error('Invalid credentials');
      err.status = 400;
      return next(err);
    }

    if (!process.env.JWT_SECRET) {
      console.error('[signin] 500 missing JWT_SECRET');
      const err = new Error('Server misconfiguration');
      err.status = 500;
      return next(err);
    }

    const token = jwt.sign(
      { id: found.id, email: found.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const ms = Date.now() - startedAt;
    console.info('[signin] 200 success', { userId: found.id, email: found.email, ms });
    return res.status(200).json({ id: found.id, email: found.email, token });
  } catch (err) {
    const ms = Date.now() - startedAt;
    console.error('[signin] unhandled error', { email: req.body?.user?.email, ms, err });
    return next(err);
  }
});



export default router
