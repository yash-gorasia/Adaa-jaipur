import { useState, useCallback } from 'react';

const useImageGallery = (images) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  }, [images.length]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const openLightbox = useCallback(() => {
    setIsLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  return {
    currentImageIndex,
    setCurrentImageIndex,
    isLightboxOpen,
    handlePrevImage,
    handleNextImage,
    openLightbox,
    closeLightbox
  };
};

export default useImageGallery;