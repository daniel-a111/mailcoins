import express from 'express';
import * as controllers from '../controllers';

export const router = express.Router();

router.post('/prev', controllers.vm.prev);
router.post('/next', controllers.vm.next);

