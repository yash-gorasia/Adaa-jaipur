import React, { useState, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import about_us from "../Images/about_us.jpg";
import about_us_mob from "../Images/about_us_mob.jpg";
import Header from "../Components/Shared/Header";
import Footer from "../Components/Shared/Footer";
import FindUsOn from "../Components/HomePage/FindUsOn";

const AboutUs = () => {
    const [aboutUs, setAboutUs] = useState("");

    useLayoutEffect(() => {
        const updateImage = () => {
            setAboutUs(window.innerWidth >= 768 ? about_us : about_us_mob);
        };

        updateImage();
        window.addEventListener("resize", updateImage);
        return () => window.removeEventListener("resize", updateImage);
    }, []);

    return (
        <>
            <Header transparent={false} />

            {/* Background Section */}
            <div className="bg-gradient-to-b from-white to-gray-100 min-h-screen md:py-24 px-4 md:px-10">

                {/* Title Animation */}
                <motion.div
                    className="text-center text-2xl md:text-5xl font-bold pt-12 md:pt-20 text-gray-800"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    What We Stand For
                </motion.div>

                {/* Image Section */}
                <motion.div
                    className="w-full md:w-3/4 p-4 md:p-10 mx-auto aspect-w-16 aspect-h-9"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <motion.img
                        src={aboutUs}
                        alt="about us"
                        className="w-full h-full object-cover rounded-2xl shadow-xl hover:scale-105 transition-transform duration-500"
                        whileHover={{ scale: 1.03 }}
                    />
                </motion.div>

                {/* Find Us Section */}
                <motion.div
                    className="mt-10 md:mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                >
                    <FindUsOn />
                </motion.div>
            </div>

            {/* Footer */}
            <Footer />
        </>
    );
};

export default AboutUs;
