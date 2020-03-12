import { Response } from 'express';
import { ApplicationType } from '../models/applicationType';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatOutput = (res: Response, data: any, statusCode: number): Response => {
  return res.format({
    json: () => {
      res.type(ApplicationType.JSON);
      res.status(statusCode).send(data);
    },
    default: () => {
      res.status(406).send();
    },
  });
};
