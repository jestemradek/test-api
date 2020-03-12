import { Request, Response } from 'express';
import { formatOutput } from '../utility/apiUtility';

export const getApi = (_req: Request, res: Response): Response => {
  return formatOutput(res, { title: 'test-api' }, 200);
};
