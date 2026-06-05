import { Router } from 'express';
import { crearQuejaSchema } from '@mv-quejas/shared';
import { validateBody } from '../middleware/validate.js';
import {
  getQueja,
  getQuejas,
  postQueja,
} from '../controllers/quejas.controller.js';

const router = Router();

router.post('/', validateBody(crearQuejaSchema), postQueja);
router.get('/', getQuejas);
router.get('/:id', getQueja);

export default router;
