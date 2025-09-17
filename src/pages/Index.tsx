import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { fetchProducts } from '../services/api';
import { recommendationEngine } from '../services/recommendations';
import { Header } from '../components/Header';
import { RecommendationBanner } from '../components/RecommendationBanner';
import { ProductGrid } from '../components/ProductGrid';
import { ProductDetail } from '../components/ProductDetail';
import { Product } from '../types/product';
import { useToast } from '../hooks/use-toast';

const Index = () => {
  const { 
    products, 
    setProducts, 
    setLoading, 
    interactions,
    setSelectedProduct,
    selectedProduct 
  } = useStore();
  
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
        
        // Initialize recommendation engine
        await recommendationEngine.initializeModel(fetchedProducts);
        
        // If user has previous interactions, generate recommendations
        if (interactions.length > 0) {
          const scores = recommendationEngine.generateRecommendations(
            fetchedProducts, 
            interactions
          );
          useStore.getState().setRecommendationScores(scores);
        }
        
      } catch (error) {
        console.error('Failed to load products:', error);
        toast({
          title: "Error loading products",
          description: "Please check your connection and try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Train model periodically with new interactions
  useEffect(() => {
    if (interactions.length >= 5 && products.length > 0) {
      recommendationEngine.trainModel(products, interactions);
    }
  }, [interactions.length]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setViewingProduct(product);
  };

  const handleBackToGrid = () => {
    setViewingProduct(null);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {viewingProduct ? (
          <ProductDetail 
            product={viewingProduct} 
            onBack={handleBackToGrid} 
          />
        ) : (
          <>
            <RecommendationBanner />
            <ProductGrid onProductClick={handleProductClick} />
          </>
        )}
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

export default Index;
