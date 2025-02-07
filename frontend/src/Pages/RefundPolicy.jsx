import React from "react";
import { motion } from "framer-motion";
import Header from "../Components/Shared/Header";
import Footer from "../Components/Shared/Footer";

const RefundPolicy = () => {
    return (
        <>
            <Header transparent={false} />

            {/* Background Section */}
            <div className="min-h-screen md:py-24 px-4 md:px-10">

                {/* Title Animation */}
                <motion.div
                    className="text-center text-3xl md:text-5xl font-extrabold pt-16 md:pt-24 text-gray-900"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    Refund & Cancellation Policy
                </motion.div>

                {/* Policy Content Section */}
                <motion.div
                    className="max-w-3xl mx-auto bg-white p-6 md:p-12 rounded-3xl shadow-2xl mt-12 transition-transform duration-300 hover:scale-[1.02]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                >
                    <p className="text-gray-800 text-lg md:text-xl leading-relaxed">
                        We assume that you agree to our terms and conditions when placing an order.
                        Once an order is placed, we do not offer any cancellation, exchange, or returns.
                    </p>

                    <p className="mt-6 text-gray-700 text-lg md:text-xl leading-relaxed">
                        However, for any products requiring possible alterations, we will be happy to assist you.
                    </p>

                    <p className="mt-6 text-gray-700 text-lg md:text-xl leading-relaxed">
                        Our packaging is done with utmost care, just like the quality of the products inside.
                        Our team ensures that all products are shipped in perfect condition.
                    </p>

                    <p className="mt-6 text-gray-700 text-lg md:text-xl leading-relaxed">
                        However, if there’s a genuine defect or damage in transit, a replacement will be offered **only**
                        if an uncut unpacking video is shared within **24 hours** of receiving the package.
                        The video must include the **sealed packet with a visible shipment label**.
                    </p>

                    <p className="mt-6 text-gray-700 text-lg md:text-xl leading-relaxed">
                        The returned product should have its original tags and packaging in an unworn, unused state.
                        Upon receiving it, our team will conduct a **quality check** and process the **replacement or refund**.
                    </p>

                    <p className="mt-6 text-gray-700 text-lg md:text-xl leading-relaxed">
                        The store reserves the right to refuse a return if the product is found to be **used or worn** upon arrival.
                        The refund or replacement process may take **12-15 days**, and we appreciate your patience.
                    </p>
                </motion.div>
            </div>

            {/* Footer */}
            <Footer />
        </>
    );
};

export default RefundPolicy;
