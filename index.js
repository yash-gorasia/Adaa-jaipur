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
import uploadRoutes from "./routes/uploadRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const port = process.env.PORT || 8000;

// Fix __dirname issue in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const app = express();

app.use(
    cors({
        origin: "*", // Allow request from frontend
        credentials: true,
    })
);

app.use(express.json());

// Routes
app.use("/api/payment", paymentRoute);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/orderItems", orderItemRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/upload", uploadRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, "frontend", "dist")));

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
