import express from 'express';
const router = express.Router();
import paymentController from '../controllers/paymentController.js'; // Ensure the path is correct

router.get('/client_token', paymentController); // Use the imported function directly

export default router;