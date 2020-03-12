import { NextFunction, Request, Response } from 'express';
import { APILogger } from '../utility/logger';

export const logging = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  APILogger.logger.error(err);
  next(err);
};

export const clientErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (req && req.xhr) {
    res.status(500).send({ error: 'Internal server error!' });
  } else {
    next(err);
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  res.status(500).send({ error: err.message });
};
