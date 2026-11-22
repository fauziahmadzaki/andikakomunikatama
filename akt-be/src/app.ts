import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { NotFoundError } from './core/errors.js';
import { env } from './core/config.js';

export const app = express();

// Security and utility middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Mount API routes
app.use('/api/v1', apiRouter);

// 404 handler
app.use((_req, _res, next) => {
  next(new NotFoundError('API endpoint not found'));
});

// Global error handler
app.use(errorHandler);
