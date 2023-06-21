import express from 'express';
import * as controllers from '../controllers';

export const router = express.Router();
router.get('/', controllers.quests.list);
router.post('/', controllers.quests.add);
router.get('/:id', controllers.quests.get);
router.put('/:id', controllers.quests.update);


router.post('/:id/tasks', controllers.quests.addTask);
router.delete('/:id/tasks/:addr', controllers.quests.removeTask);

router.get('/:id/related', controllers.quests.listRelated);
router.post('/:id/related', controllers.quests.relate);

router.post('/:id/members', controllers.quests.addMember);
router.delete('/:id/members/:addr', controllers.quests.removeMember);
