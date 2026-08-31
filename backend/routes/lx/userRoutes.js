// DEV-ONLY routes — role/user switcher + current actor. Not part of handoff.
import express from 'express';
import { getAllUsersController, getMeController } from '../../controllers/lx/userController.js';

const router = express.Router();

router.get('/all', getAllUsersController);
router.get('/me', getMeController);

export default router;
