import React from 'react';
import { motion } from 'framer-motion';
import { FaFacebookF, FaInstagram, FaYoutube, FaPinterest } from 'react-icons/fa';
import logo from '../../Images/logo.png';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <motion.footer
            className="bg-black text-white py-10 px-5 md:px-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h2 className="text-lg font-semibold">Quick Links</h2>
                    <ul className="mt-2 space-y-2">
                        {[
                            { name: "Home", path: "/home" },
                            { name: "About Us", path: "/aboutus" },
                            { name: "All Collections", path: "/collections" },
                            { name: "All Products", path: "/products" }
                        ].map((link, index) => (
                            <li key={index} className="hover:text-gray-400 cursor-pointer">
                                <Link to={link.path}>{link.name}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h2 className="text-lg font-semibold">Policies</h2>
                    <ul className="mt-2 space-y-2">
                        {[
                            { name: "Refund Policy", path: "/refund-policy" },
                            { name: "Shipping Policy", path: "/aboutus" },
                            { name: "Terms of Service", path: "/collections" },
                            { name: "Privacy Policy", path: "/products" }
                        ].map((link, index) => (
                            <li key={index} className="hover:text-gray-400 cursor-pointer">
                                <Link to={link.path}>{link.name}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h2 className="text-lg font-semibold">Contact Info</h2>
                    <p className="mt-2">Phone: +91 98281 70003</p>
                    <p>Address: H-5, RIICO MANSAROVAR INDUSTRIAL AREA, JAIPUR - 302020</p>
                    <p className="mt-4 italic">"Style Yourself With Adaa"</p>
                    <div className="flex space-x-4 mt-4">
                        <a href="https://www.facebook.com/Adaajaipur.official?_rdr"><FaFacebookF className="text-xl cursor-pointer hover:text-gray-400" /></a>
                        <a href="https://www.instagram.com/adaajaipur.official/"><FaInstagram className="text-xl cursor-pointer hover:text-gray-400" /></a>
                        <a href="https://www.youtube.com/channel/UC9Ccd68grj8EgEwHd3d8G_A"><FaYoutube className="text-xl cursor-pointer hover:text-gray-400" /></a>
                        <a href="https://in.pinterest.com/adaajaipur/"><FaPinterest className="text-xl cursor-pointer hover:text-gray-400" /></a>
                    </div>
                </div>
            </div>
            <div>
                <img src={logo} alt="Adaa-Jaipur" className="w-60 mx-auto mt-8" />
            </div>
            <p className="text-center mt-8 text-gray-500">&copy; {new Date().getFullYear()} Adaa-Jaipur. All Rights Reserved.</p>
        </motion.footer>
    );
};

export default Footer;
