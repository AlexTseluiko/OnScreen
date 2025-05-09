import { Router, Request, Response } from 'express';
import {
  getFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility,
} from '../controllers/facilityController';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

// Публичные маршруты
router.get('/', (req: Request, res: Response) => getFacilities(req, res));
router.get('/:id', (req: Request<{ id: string }>, res: Response) => getFacilityById(req, res));

// Защищенные маршруты (требуют аутентификации)
router.post('/', auth, (req: AuthRequest, res: Response) => createFacility(req, res));
router.put('/:id', auth, (req: Request<{ id: string }> & AuthRequest, res: Response) =>
  updateFacility(req, res)
);
router.delete('/:id', auth, (req: Request<{ id: string }> & AuthRequest, res: Response) =>
  deleteFacility(req, res)
);

export default router;
