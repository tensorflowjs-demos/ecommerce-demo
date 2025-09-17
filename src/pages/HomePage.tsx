import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { recommendationEngine } from '../services/recommendations';
import { Header } from '../components/Header';
import { RecommendationBanner } from '../components/RecommendationBanner';
import { ProductGrid } from '../components/ProductGrid';
import { Product } from '../types/product';
import { useToast } from '../hooks/use-toast';
import { useProducts } from '../hooks/useProducts';

const HomePage = () => {
  const { 
    setProducts, 
    interactions,
    setSelectedProduct 
  } = useStore();
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // React Query for server state management
  const {
    data: products,
    isLoading,
    error,
    isSuccess
  } = useProducts();

  // Handle success case
  useEffect(() => {
    if (products) {
      setProducts(products);
    }
  }, [products, setProducts]);

  // Handle error case
  useEffect(() => {
    if (error) {
      console.error('Failed to load products:', error);
      toast({
        title: "Error loading products",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Initialize recommendation engine when products are loaded
  useEffect(() => {
    const initializeRecommendations = async () => {
      if (products && products.length > 0) {
        try {
          // Initialize recommendation engine
          await recommendationEngine.initializeModel(products);
          
          // If user has previous interactions, generate recommendations
          if (interactions.length > 0) {
            const scores = recommendationEngine.generateRecommendations(
              products, 
              interactions
            );
            useStore.getState().setRecommendationScores(scores);
          }
        } catch (error) {
          console.error('Failed to initialize recommendations:', error);
        }
      }
    };

    if (isSuccess) {
      initializeRecommendations();
    }
  }, [products, interactions, isSuccess]);

  // Train model periodically with new interactions
  useEffect(() => {
    if (interactions.length >= 5 && products && products.length > 0) {
      recommendationEngine.trainModel(products, interactions);
    }
  }, [interactions.length, products]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    navigate(`/product/${product.id}`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading products...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <RecommendationBanner />
        <ProductGrid onProductClick={handleProductClick} />
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

export default HomePage;
