import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, X, SendHorizontal, HelpCircle } from 'lucide-react';

// Suggested questions based on page context
const SUGGESTED_QUESTIONS = {
    home: [
        "What are your bestselling items?",
        "Do you have any ongoing sales?",
        "Show me new arrivals",
        "What's trending right now?",
        "Tell me about your return policy"
    ],
    product: [
        "Is this available in my size?",
        "What material is this made of?",
        "Do you have this in other colors?",
        "What's the delivery time?",
        "Is cash on delivery available?"
    ],
    category: [
        "What's the price range in this category?",
        "Show me the latest collection",
        "Do you have party wear?",
        "What sizes are available?",
        "Are there any discounts?"
    ],
    order: [
        "Where is my order?",
        "When will it be delivered?",
        "Can I change my delivery address?",
        "Can I cancel my order?",
        "What's your return policy?"
    ]
};

const FloatingChat = ({ pageType, productId, userId, categoryId, subCategoryId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Add welcome message when chat opens
    useEffect(() => {
        if (isOpen) {
            const welcomeMessage = {
                text: "Hello! I'm your Adaa Assistant. How can I help you today?",
                sender: 'bot'
            };
            setMessages([welcomeMessage]);
        }
    }, [isOpen]);

    const handleSuggestionClick = async (question) => {
        setShowSuggestions(false);
        await handleSubmit(null, question);
    };

    const handleSubmit = async (e, suggestedQuestion = null) => {
        e?.preventDefault();

        const messageText = suggestedQuestion || input;
        if (!messageText.trim()) return;

        setShowSuggestions(false); // Hide suggestions permanently after user asks a question

        const userMessage = { text: messageText, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post('/api/chatbot/chat', {
                message: messageText,
                pageContext: {
                    type: pageType,
                    productId: pageType === 'product' ? productId : null,
                    userId: pageType === 'order' ? userId : null,
                    categoryId: pageType === 'category' ? categoryId : null,
                    subCategoryId: pageType === 'subcategory' ? subCategoryId : null
                }
            });

            setMessages(prev => [...prev, { text: response.data.reply, sender: 'bot' }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                text: "I apologize, but I couldn't process your request at the moment. Please try again.",
                sender: 'bot'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const renderSuggestions = () => {
        const suggestions = SUGGESTED_QUESTIONS[pageType] || SUGGESTED_QUESTIONS.home;

        return (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 font-medium">Suggested questions:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {suggestions.map((question, index) => (
                        <button
                            key={index}
                            onClick={() => handleSuggestionClick(question)}
                            className="text-sm bg-white hover:bg-gray-100 text-gray-700 rounded-full px-3 py-1.5 border border-gray-200 transition-colors duration-200"
                        >
                            {question}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 animate-bounce"
                >
                    <MessageSquare className="w-6 h-6" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white rounded-lg shadow-xl w-80 sm:w-96 h-[600px] flex flex-col border border-gray-200 animate-in fade-in duration-200">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-black text-white rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            <h3 className="font-semibold">Adaa Assistant</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-gray-700 p-1 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg ${message.sender === 'user'
                                            ? 'bg-black text-white rounded-br-none'
                                            : 'bg-gray-100 text-black rounded-bl-none'
                                        }`}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {showSuggestions && !loading && renderSuggestions()}

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-black text-white p-2 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                            >
                                <SendHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default FloatingChat;