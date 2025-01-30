import axios from 'axios';
import Category from '../models/categoryModel.js';
import Order from '../models/orderModel.js';
import OrderItem from '../models/orderItemModel.js';
import Product from '../models/productModel.js';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const chatController = async (req, res) => {
    const userMessage = req.body.message.toLowerCase();
    const pageContext = req.body.pageContext;

    try {
        let prompt = '';
        const storeContext = "I am an AI assistant for Adaa Jaipur, a premium women's ethnic wear store specializing in kurtas, kurtis, and gowns. I aim to provide helpful information about our products, orders, and services. ";

        switch (pageContext.type) {
            case 'home':
                const categories = await Category.find({}, 'category_name');
                const featuredProducts = await Product.find(
                    { is_active: true },
                    'name CurrentPrice discount description'
                ).limit(5);
                prompt = createGeneralPrompt(userMessage, categories, featuredProducts, storeContext);
                break;

            case 'category':
                const category = await Category.findById(pageContext.categoryId);
                const categoryProducts = await Product.find(
                    { category_id: pageContext.categoryId, is_active: true },
                    'name CurrentPrice discount description color sizes Fabric Pattern type'
                );
                prompt = createCategoryPrompt(userMessage, category, categoryProducts, storeContext);
                break;

            case 'product':
                const product = await Product.findById(pageContext.productId);
                prompt = createProductPrompt(userMessage, product, storeContext);
                break;

            case 'order':
                const order = await Order.findById(pageContext.orderId);
                const orderItems = await OrderItem.find({ order_id: pageContext.orderId })
                    .populate('product_id', 'name image CurrentPrice');
                prompt = createOrderPrompt(userMessage, order, orderItems, storeContext);
                break;
        }

        const response = await getGeminiResponse(prompt);
        res.json({ reply: response });
    } catch (error) {
        console.error('Error in chat controller:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
};

function createGeneralPrompt(userMessage, categories, products, storeContext) {
    const categoryInfo = categories.map(c => c.category_name).join(', ');
    const productHighlights = products.map(p =>
        `${p.name} (₹${p.CurrentPrice}${p.discount ? ` with ${p.discount}% off` : ''})`
    ).join(', ');

    return `${storeContext}
    User question: "${userMessage}"
    Available categories: ${categoryInfo}
    Featured products: ${productHighlights}
    Common topics: Sizing, delivery times, return policy, current sales, style recommendations
    Please provide a helpful and concise response focusing on the user's specific query.`;
}

function createCategoryPrompt(userMessage, category, products, storeContext) {
    const productInfo = products.map(p => ({
        name: p.name,
        price: p.CurrentPrice,
        discount: p.discount,
        fabric: p.Fabric,
        pattern: p.Pattern,
        sizes: p.sizes.map(s => s.size).join('/')
    }));

    return `${storeContext}
    User question: "${userMessage}"
    Category: ${category.category_name}
    Available products: ${JSON.stringify(productInfo)}
    Please provide specific information about products in this category, including details about materials, styles, and available sizes.`;
}

function createProductPrompt(userMessage, product, storeContext) {
    const productInfo = {
        name: product.name,
        price: product.CurrentPrice,
        discount: product.discount,
        description: product.description,
        details: {
            fabric: product.Fabric,
            pattern: product.Pattern,
            type: product.type,
            neck: product.neck,
            sleeve: product.sleeve,
            lengthType: product.lengthType,
            style: product.style
        },
        sizes: product.sizes.map(s => ({
            size: s.size,
            inStock: s.stock > 0
        }))
    };

    return `${storeContext}
    User question: "${userMessage}"
    Product details: ${JSON.stringify(productInfo)}
    Common product queries: Sizing recommendations, material care, styling tips, availability, delivery time
    Please provide specific information about this product based on the user's query.`;
}

function createOrderPrompt(userMessage, order, orderItems, storeContext) {
    const orderInfo = {
        status: order.order_status,
        orderDate: order.ordertime,
        expectedDelivery: order.estimatedDeliveryDate,
        trackingNumber: order.tracking_number,
        items: orderItems.map(item => ({
            product: item.product_id.name,
            quantity: item.quantity,
            size: item.size,
            price: item.price
        })),
        totalAmount: order.total_amount,
        paymentMode: order.paymentmode
    };

    return `${storeContext}
    User question: "${userMessage}"
    Order details: ${JSON.stringify(orderInfo)}
    Common order queries: Delivery status, cancellation, modifications, returns
    Please provide a clear and specific update about this order based on the user's query.`;
}

async function getGeminiResponse(prompt) {
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }]
                }]
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        return response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
            || "I apologize, but I couldn't process your request at the moment.";
    } catch (error) {
        console.error('Gemini API error:', error.response?.data || error.message);
        return "I apologize, but I'm having trouble processing your request right now.";
    }
}

export { chatController };