import express from 'express';
import { getTranslationAction } from '../controllers/translationController.js';

const router = express.Router();

router.get('/:lng', getTranslationAction);        // /translation/ua → ns = common
router.get('/:lng/:ns', getTranslationAction);    // /translation/ua/auth
export default router;
