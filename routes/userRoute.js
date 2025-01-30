import express from 'express';
import {  removeCard, removeUPI,     addCard , addUPI, registerUser, loginUser, logoutUser, getUserById, updateUser, addAddress, removeAddress } from '../controllers/userController.js';

const router = express.Router();

// Register a new user
router.post('/register', registerUser);
router.put('/addcard/:id', addCard);
router.put('/addupi/:id', addUPI);// User login
router.post('/login', loginUser);

// User logout
router.post('/logout', logoutUser);

// Update user details
router.put('/update/:id', updateUser);

// Get user by ID
router.get('/getuserbyid/:id', getUserById);

// Add a new address for the user
router.post('/addaddress/:id', addAddress);

// Remove an address from the user's list of addresses
router.delete('/removeaddress/:id/:addressId', removeAddress);
router.delete('/removeupi/:userId/:upiId',removeUPI);
router.delete('/removecard/:userId/:cardId',removeCard);
export default router;
