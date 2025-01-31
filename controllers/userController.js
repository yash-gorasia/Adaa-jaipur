import bcrypt from 'bcryptjs';
import generateToken from '../utils/createToken.js';
import User from '../models/userModel.js';

// Register a new user
const registerUser = async (req, res) => {
    try {
        const { name, email, password, age, gender, phone_number, addresses, profileCompleted } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            age,
            gender,
            phone_number,
            addresses, // multiple addresses array
            profileCompleted
        });

        // Save the user to the database
        await newUser.save();
        generateToken(res, newUser._id);

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Login a user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        generateToken(res, existingUser._id);
        res.status(200).json({ message: 'User logged in successfully', user: existingUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Logout a user
const logoutUser = async (req, res) => {
    try {
        res.cookie('JWT', '', {
            httpOnly: true,
            expires: new Date(0)
        });
        res.status(200).json({ message: 'User logged out successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Update a user (including multiple addresses)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        console.log("Received request body:", req.body);
        // Define allowed fields for update
        const allowedUpdates = ['name', 'age', 'gender', 'phone_number', 'profileCompleted'];
        const isValidUpdate = Object.keys(updates).every(field => allowedUpdates.includes(field));

        // if (!isValidUpdate) {
        //     return res.status(400).json({ message: 'Invalid updates' });
        // }
        // Check if the user exists
        const user = await User.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            message: "User updated successfully",
            user,
        });
    } catch (err) {
        console.log("error", err);
        console.error("Error updating user:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// Fetch user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (err) {
        console.error("Error fetching user by ID:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// Add a new address for a user
const addAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { street, city, state, postalCode, country } = req.body;

        if (!street || !city || !state || !postalCode || !country) {
            return res.status(400).json({ message: 'All address fields are required' });
        }

        const newAddress = { street, city, state, postalCode, country };

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.addresses.push(newAddress);
        await user.save();

        res.status(200).json({ message: 'Address added successfully', addresses: user.addresses });
    } catch (err) {
        console.error("Error adding address:", err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Remove an address for a user
const removeAddress = async (req, res) => {
    try {
        const { id, addressId } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const addressExists = user.addresses.some(address => address._id.toString() === addressId);
        if (!addressExists) {
            return res.status(404).json({ message: 'Address not found' });
        }

        user.addresses = user.addresses.filter(address => address._id.toString() !== addressId);
        await user.save();

        res.status(200).json({ message: 'Address removed successfully', addresses: user.addresses });
    } catch (err) {
        console.error("Error removing address:", err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Add a new card for a user
const addCard = async (req, res) => {
    try {
        const { id } = req.params;
        const { cardType, lastFour, expirationDate, token } = req.body;

        // Validate required fields
        if (!cardType || !lastFour || !expirationDate || !token) {
            return res.status(400).json({ message: 'All card fields are required' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the card already exists
        const cardExists = user.cards.some(card => card.lastFour === lastFour);
        if (cardExists) {
            return res.status(400).json({ message: 'Card already exists' });
        }

        // Save the card details
        const newCard = {
            cardType,
            lastFour,
            expirationDate,
            token
        };

        user.cards.push(newCard);
        await user.save();

        res.status(200).json({ message: 'Card added successfully', cards: user.cards });
    } catch (err) {
        console.error('Error adding card:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
// Add a new UPI ID for a user
const addUPI = async (req, res) => {
    try {
        const { id } = req.params;
        const { upiId, saveUPI } = req.body;

        // Validate UPI ID format
        const upiRegex = /^[\w.-]+@[\w.-]+$/;
        if (!upiId || !upiRegex.test(upiId)) {
            return res.status(400).json({ message: 'Invalid UPI ID format' });
        }

        const newUPI = { upiId };

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (saveUPI) {
            user.upiIds.push(newUPI);
        }

        await user.save();

        res.status(200).json({ message: 'UPI ID added successfully', upiIds: user.upiIds });
    } catch (err) {
        console.error('Error adding UPI ID:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
const removeUPI = async (req, res) => {
    const { userId, upiId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove the UPI ID with the specified _id
        user.upiIds = user.upiIds.filter((upi) => upi._id.toString() !== upiId);
        await user.save();

        res.status(200).json({ message: 'UPI ID removed successfully', user });
    } catch (err) {
        console.error('Error removing UPI ID:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};
// Remove a card for a user
const removeCard = async (req, res) => {
    const { userId, cardId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove the card with the specified _id
        user.cards = user.cards.filter((card) => card._id.toString() !== cardId);
        await user.save();

        res.status(200).json({ message: 'Card removed successfully', user });
    } catch (err) {
        console.error('Error removing card:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};
export {
    registerUser,
    loginUser,
    getUserById,
    logoutUser,
    updateUser,
    addAddress,
    removeAddress,
    addCard,
    addUPI,
    removeUPI,
    removeCard
};