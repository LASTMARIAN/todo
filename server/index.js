import express from 'express';
import cors from 'cors';
import tasksRouter from './todoRouter/todoRouter.js';
import usersRouter from './todoRouter/userRouter.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', tasksRouter);
app.use('/user', usersRouter);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

app.listen(process.env.PORT || 3001, () => {
  console.log('Server listening');
});
