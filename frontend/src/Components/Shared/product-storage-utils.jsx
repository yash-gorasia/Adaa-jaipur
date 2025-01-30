const MAX_VIEWED_ITEMS = 5;

export const saveViewedProduct = (productId, categoryId) => {
  try {
    // Retrieve existing viewed products
    const viewedProducts = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
    
    // Remove duplicate if exists
    const filteredProducts = viewedProducts.filter(item => 
      item.productId !== productId
    );
    
    // Add new product to the beginning of the array
    const updatedProducts = [
      { productId, categoryId },
      ...filteredProducts
    ].slice(0, MAX_VIEWED_ITEMS);
    
    // Save back to local storage
    localStorage.setItem('viewedProducts', JSON.stringify(updatedProducts));
  } catch (error) {
    console.error('Error saving viewed product:', error);
  }
};

export const getViewedProducts = () => {
  try {
    return JSON.parse(localStorage.getItem('viewedProducts') || '[]');
  } catch (error) {
    console.error('Error retrieving viewed products:', error);
    return [];
  }
};
