import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Header } from '../components/Header';
import { ProductDetail } from '../components/ProductDetail';
import { Product } from '../types/product';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, selectedProduct, setSelectedProduct } = useStore();
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (id) {
      const productId = parseInt(id);
      const product = products.find(p => p.id === productId) || selectedProduct;
      
      if (product) {
        setViewingProduct(product);
        setSelectedProduct(product);
      } else {
        // If product not found, redirect to home
        navigate('/');
      }
    }
  }, [id, products, selectedProduct, navigate, setSelectedProduct]);

  const handleBackToGrid = () => {
    setViewingProduct(null);
    setSelectedProduct(null);
    navigate('/');
  };

  if (!viewingProduct) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <ProductDetail 
          product={viewingProduct} 
          onBack={handleBackToGrid} 
        />
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Powered by TensorFlow.js • ML-Enhanced Shopping Experience
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetailPage;
