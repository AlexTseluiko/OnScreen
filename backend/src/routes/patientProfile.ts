import express, { Response } from 'express';
import { getProfile, updateProfile } from '../controllers/profileController';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', auth, (req: AuthRequest, res: Response) => getProfile(req, res));
router.put('/', auth, (req: AuthRequest, res: Response) => updateProfile(req, res));

export default router;
