import { Response } from 'express';

export const handleError = (res: Response, message: string, error: any) => {
  console.error(message, error);
  res.status(500).json({
    error: message,
    details: error.message,
  });
};
