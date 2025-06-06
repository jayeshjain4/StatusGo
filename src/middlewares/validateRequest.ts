import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { sendResponse } from '../utils/responseUtils';
import STATUS_CODES from '../utils/statusCodes';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      return sendResponse(
        res,
        false,
        {
          _original: req.body,
          details: error.details
        },
        error.details[0].message, 
        STATUS_CODES.BAD_REQUEST
      );
    }
    
    next();
  };
};
