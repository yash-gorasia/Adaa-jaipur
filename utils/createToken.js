import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET,
        { expiresIn: '30d' });

    // set JWT as an http-only cookie    
    res.cookie('JWT', token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict', // Prevent CSRF attacks
    });

    return token;

};

export default generateToken;