import { Response } from 'express';
import STATUS_CODES from './statusCodes';

export const sendResponse = (
  res: Response,
  success: boolean,
  data: any = null,
  message: string = '',
  statusCode: number = STATUS_CODES.OK
): void => {
  res.status(statusCode).json({
    success,
    message,
    data
  });
};
