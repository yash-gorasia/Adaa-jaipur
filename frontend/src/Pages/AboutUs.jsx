import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import HeaderImage from '../Images/Aboutus_Bg.png'; 
import Header from '../Components/Shared/Header';
import FoundersShowcase from '../Components/AboutUsPage/FoundersShowcase';

const AboutUs = () => {
  const [isVisible, setIsVisible] = useState({
    founder: false,
    mission: false,
  });

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['founder', 'mission'];
      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          setIsVisible(prev => ({
            ...prev,
            [section]: rect.top <= window.innerHeight * 0.75
          }));
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: 'easeInOut' } }
  };

  return (
    <div className="bg-gradient-to-b from-[#E9F1FF] to-[#F3F6FC]">
      <Header />
      {/* Hero Section */}
      <motion.div 
        className="relative h-[85vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${HeaderImage})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center text-white px-6">
          <motion.h1 
            className="text-5xl sm:text-6xl font-extrabold tracking-wide mb-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Adaa Jaipur
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl max-w-3xl mx-auto mb-8 opacity-80"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Crafting timeless fashion with the perfect blend of tradition and modernity for the modern Indian woman.
          </motion.p>
        </div>
      </motion.div>

      {/* Founder Section */}
      <motion.section 
        id="founder"
        className="py-28 bg-[#F0F4F8] text-center"
        initial="hidden"
        animate={isVisible.founder ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <FoundersShowcase />
      </motion.section>

      {/* Mission Section */}
      <motion.section 
        id="mission"
        className="py-24 bg-[#A0C4FF] text-center text-white"
        initial="hidden"
        animate={isVisible.mission ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-8">Our Mission</h2>
          <p className="text-lg sm:text-xl max-w-xl mx-auto mb-8">
            Our mission is to provide high-quality fashion that blends traditional craftsmanship with modern designs, making luxury accessible to every woman.
          </p>
          <p className="text-2xl italic font-semibold">"STYLE YOURSELF WITH ADAA!"</p>
        </div>
      </motion.section>
    </div>
  );
};

export default AboutUs;
