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
import { createServer } from "@vercel/node"; // Needed for Vercel

dotenv.config();

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const app = express();
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// API Routes
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

// Serve Frontend for Production
const frontendPath = path.join(__dirname, "frontend", "dist");
app.use(express.static(frontendPath));
app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// Export the app for Vercel
export default createServer(app);
