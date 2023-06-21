import express from 'express';
import * as controllers from '../controllers';

export const router = express.Router();
router.get('/:id', controllers.tasks.get);
router.put('/:id', controllers.tasks.update);
router.post('/:id/members', controllers.tasks.addMember);
router.delete('/:id/members/:addr', controllers.tasks.removeMember);
router.post('/:id/copy', controllers.tasks.makeCopy);
