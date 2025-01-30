import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoute.js";
import productRoutes from "./routes/productRoute.js";
import categoryRoutes from "./routes/categoryRoute.js";
import subcategoryRoutes from "./routes/subcategoryRoute.js";
import orderRoutes from "./routes/orderRoute.js";
import orderItemRoutes from "./routes/orderItemRoute.js";
import cartRoutes from "./routes/cartRoute.js";
import wishlistRoutes from "./routes/wishlistRoute.js";
// import chatRoute from "./routes/chatRoute.js";
import uploadRoutes from "./routes/uploadRoute.js";
import path from "path";
import paymentRoute from "./routes/paymentRoute.js";
dotenv.config();

const port = process.env.PORT || 8000;

connectDB();

const app = express();

app.use(cors({
    origin: "*", // Allow request from frontend
    credentials: true
}));

app.use(express.json());
app.use('/api/payment', paymentRoute);
// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/orderItems', orderItemRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);


app.use("/api/upload", uploadRoutes);

const __dirname = path.resolve()
app.use('/uploads', express.static(path.join(__dirname + '/uploads')));

app.listen(port, () => {
    console.log(`server is running on ${process.env.PORT}`);
})