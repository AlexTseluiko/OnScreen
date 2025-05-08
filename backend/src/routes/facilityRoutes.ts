import { Router } from 'express';
import {
  getFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility,
} from '../controllers/facilityController';
import { auth } from '../middleware/auth';

const router = Router();

// Публичные маршруты
router.get('/', getFacilities);
router.get('/:id', getFacilityById);

// Защищенные маршруты (требуют аутентификации)
router.post('/', auth, createFacility);
router.put('/:id', auth, updateFacility);
router.delete('/:id', auth, deleteFacility);

export default router; 