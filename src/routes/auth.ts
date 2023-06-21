import express from 'express';
import * as controllers from '../controllers';

export const router = express.Router();
// Auth
router.post('/register', controllers.auth.register);
router.post('/login', controllers.auth.login);
router.post('/invite', controllers.auth.invite);
router.get('/', controllers.auth.getUser);

