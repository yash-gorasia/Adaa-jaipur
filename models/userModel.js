import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const cardSchema = new Schema({
    name:{ type: String,  required: true },
    cardNumber: { type: String, required: true }, // Hashed before saving
    expiryDate: { type: String, required: true },
    cvv: { type: String, required: true }, // Hashed before saving
    lastFourDigits: { type: String, required: true }, // For display purposes
});

const upiSchema = new Schema({
    upiId: { type: String, required: true }, // Encrypted before saving
});

const addressSchema = new Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
});

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, default: null },
    gender: { type: String, default: null },
    phone_number: { type: Number, default: null },
    addresses: { type: [addressSchema], default: [] },
    cards: { type: [cardSchema], default: [] }, // Store multiple cards
    upiIds: { type: [upiSchema], default: [] }, // Store multiple UPI IDs
    profileCompleted: { type: Boolean, default: false },
}, {
    timestamps: true,
});

// Hash card details before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('cards')) {
        for (let card of this.cards) {
            card.cardNumber = await bcrypt.hash(card.cardNumber, 10);
            card.cvv = await bcrypt.hash(card.cvv, 10);
        }
    }
    next();
});

const User = mongoose.model('User', userSchema);
export default User;