import express from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize(ROLES.SUPER_ADMIN), getUsers);
router.post('/', authorize(ROLES.SUPER_ADMIN), createUser);
router.get('/:id', authorize(ROLES.SUPER_ADMIN), getUserById);
router.put('/:id', authorize(ROLES.SUPER_ADMIN), updateUser);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN), deleteUser);

export default router;
