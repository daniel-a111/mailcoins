import express from 'express';

import * as accounts from './accounts';
import * as actions from './actions';
import * as auth from './auth';
import * as quests from './quests';
import * as tasks from './tasks';
import * as vm from './vm';

const router = express.Router();

router.use('/auth', auth.router);
router.use('/api/quests', quests.router);
router.use('/api/tasks', tasks.router);
router.use('/api/actions', actions.router);
router.use('/api/accounts', accounts.router);
router.use('/api/vm', vm.router);

export = router;
