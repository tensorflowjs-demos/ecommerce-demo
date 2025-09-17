import * as tf from '@tensorflow/tfjs';
import { Product, UserInteraction, RecommendationScore } from '../types/product';

export class RecommendationEngine {
  private model: tf.LayersModel | null = null;
  private isTraining = false;

  async initializeModel(products: Product[]): Promise<void> {
    if (this.model || this.isTraining) return;
    
    this.isTraining = true;
    
    try {
      // First, try to load a saved model
      await this.loadModel();
      
      // If no saved model was loaded, create a new one
      if (!this.model) {
        // Create a simple neural network for recommendations
        const model = tf.sequential({
          layers: [
            tf.layers.dense({ inputShape: [products.length + 4], units: 64, activation: 'relu' }),
            tf.layers.dropout({ rate: 0.2 }),
            tf.layers.dense({ units: 32, activation: 'relu' }),
            tf.layers.dense({ units: products.length, activation: 'softmax' })
          ]
        });

        model.compile({
          optimizer: tf.train.adam(0.001),
          loss: 'categoricalCrossentropy',
          metrics: ['accuracy']
        });

        this.model = model;
        console.log('Created new recommendation model');
      }
    } catch (error) {
      console.error('Failed to initialize recommendation model:', error);
    } finally {
      this.isTraining = false;
    }
  }

  calculateSimilarity(product1: Product, product2: Product): number {
    // Simple content-based similarity
    let similarity = 0;
    
    // Category similarity (most important)
    if (product1.category === product2.category) {
      similarity += 0.4;
    }
    
    // Price similarity (normalize price difference)
    const priceDiff = Math.abs(product1.price - product2.price);
    const maxPrice = Math.max(product1.price, product2.price);
    const priceScore = 1 - (priceDiff / maxPrice);
    similarity += priceScore * 0.3;
    
    // Rating similarity
    const ratingDiff = Math.abs(product1.rating.rate - product2.rating.rate);
    const ratingScore = 1 - (ratingDiff / 5);
    similarity += ratingScore * 0.3;
    
    return Math.min(similarity, 1);
  }

  generateRecommendations(
    products: Product[], 
    interactions: UserInteraction[]
  ): RecommendationScore[] {
    if (interactions.length === 0) {
      return products.map(p => ({ 
        productId: p.id, 
        score: Math.random(), 
        reasons: ['Random recommendation'] 
      }));
    }

    const scores: RecommendationScore[] = [];
    
    // Count interactions per product
    const interactionCounts = new Map<number, number>();
    const categoryPreferences = new Map<string, number>();
    
    interactions.forEach(interaction => {
      const count = interactionCounts.get(interaction.productId) || 0;
      interactionCounts.set(interaction.productId, count + 1);
      
      const product = products.find(p => p.id === interaction.productId);
      if (product) {
        const catCount = categoryPreferences.get(product.category) || 0;
        categoryPreferences.set(product.category, catCount + 1);
      }
    });

    // Generate scores for each product
    products.forEach(product => {
      let score = 0;
      const reasons: string[] = [];

      // Base popularity score
      score += (product.rating.rate / 5) * 0.2;
      
      // User interaction history
      const userInteractions = interactionCounts.get(product.id) || 0;
      if (userInteractions > 0) {
        score += Math.min(userInteractions * 0.3, 0.8);
        reasons.push(`You viewed this ${userInteractions} time(s)`);
      }

      // Category preference
      const categoryScore = categoryPreferences.get(product.category) || 0;
      if (categoryScore > 0) {
        score += Math.min(categoryScore * 0.1, 0.4);
        reasons.push(`You like ${product.category} products`);
      }

      // Similar products to viewed ones
      let maxSimilarity = 0;
      interactions.forEach(interaction => {
        const viewedProduct = products.find(p => p.id === interaction.productId);
        if (viewedProduct && viewedProduct.id !== product.id) {
          const similarity = this.calculateSimilarity(product, viewedProduct);
          maxSimilarity = Math.max(maxSimilarity, similarity);
        }
      });
      
      if (maxSimilarity > 0.5) {
        score += maxSimilarity * 0.3;
        reasons.push('Similar to products you viewed');
      }

      // Add some randomness for discovery
      score += Math.random() * 0.1;

      if (reasons.length === 0) {
        reasons.push('Trending product');
      }

      scores.push({
        productId: product.id,
        score: Math.min(score, 1),
        reasons
      });
    });

    return scores.sort((a, b) => b.score - a.score);
  }

  async trainModel(products: Product[], interactions: UserInteraction[]): Promise<void> {
    if (!this.model || interactions.length < 5) return;

    try {
      // Prepare training data
      const trainingData = this.prepareTrainingData(products, interactions);
      
      if (trainingData.inputs.length === 0) return;

      const xs = tf.tensor2d(trainingData.inputs);
      const ys = tf.tensor2d(trainingData.outputs);

      // Train the model with a few epochs
      await this.model.fit(xs, ys, {
        epochs: 3,
        batchSize: Math.min(32, trainingData.inputs.length),
        verbose: 0
      });

      xs.dispose();
      ys.dispose();

      // Save the trained model automatically
      await this.saveModel();
      console.log('Model trained and saved successfully');
    } catch (error) {
      console.error('Model training failed:', error);
    }
  }

  private prepareTrainingData(products: Product[], interactions: UserInteraction[]) {
    const inputs: number[][] = [];
    const outputs: number[][] = [];

    // Group interactions by session (within 30 minutes)
    const sessions = this.groupInteractionsBySession(interactions);

    sessions.forEach(session => {
      if (session.length < 2) return;

      for (let i = 0; i < session.length - 1; i++) {
        const currentProduct = products.find(p => p.id === session[i].productId);
        const nextProduct = products.find(p => p.id === session[i + 1].productId);

        if (currentProduct && nextProduct) {
          // Create input vector: [product features, user context]
          const input = this.createProductVector(currentProduct, products);
          inputs.push(input);

          // Create output vector: one-hot encoding of next product
          const output = new Array(products.length).fill(0);
          const nextIndex = products.findIndex(p => p.id === nextProduct.id);
          if (nextIndex >= 0) {
            output[nextIndex] = 1;
          }
          outputs.push(output);
        }
      }
    });

    return { inputs, outputs };
  }

  private groupInteractionsBySession(interactions: UserInteraction[]): UserInteraction[][] {
    const sessions: UserInteraction[][] = [];
    let currentSession: UserInteraction[] = [];
    
    const sortedInteractions = [...interactions].sort((a, b) => a.timestamp - b.timestamp);
    
    sortedInteractions.forEach(interaction => {
      if (currentSession.length === 0) {
        currentSession.push(interaction);
      } else {
        const lastInteraction = currentSession[currentSession.length - 1];
        const timeDiff = interaction.timestamp - lastInteraction.timestamp;
        
        // 30 minutes session timeout
        if (timeDiff > 30 * 60 * 1000) {
          if (currentSession.length > 0) {
            sessions.push(currentSession);
          }
          currentSession = [interaction];
        } else {
          currentSession.push(interaction);
        }
      }
    });
    
    if (currentSession.length > 0) {
      sessions.push(currentSession);
    }
    
    return sessions;
  }

  private createProductVector(product: Product, allProducts: Product[]): number[] {
    const vector: number[] = [];
    
    // One-hot encoding for categories
    const categories = [...new Set(allProducts.map(p => p.category))];
    categories.forEach(cat => {
      vector.push(product.category === cat ? 1 : 0);
    });
    
    // Normalized price
    const maxPrice = Math.max(...allProducts.map(p => p.price));
    vector.push(product.price / maxPrice);
    
    // Rating
    vector.push(product.rating.rate / 5);
    
    // Review count (normalized)
    const maxReviews = Math.max(...allProducts.map(p => p.rating.count));
    vector.push(product.rating.count / maxReviews);
    
    // Product popularity rank
    const sortedByRating = [...allProducts].sort((a, b) => b.rating.rate - a.rating.rate);
    const rank = sortedByRating.findIndex(p => p.id === product.id);
    vector.push(rank / allProducts.length);
    
    return vector;
  }

  // Save model to localStorage
  async saveModel() {
    try {
      await this.model!.save('localstorage://recommendation-model');
    } catch (error) {
      console.error('Failed to save model:', error);
    }
  }

  // Load model from localStorage
  async loadModel() {
    try {
      const savedModel = await tf.loadLayersModel('localstorage://recommendation-model');
      if (savedModel) {
        this.model = savedModel;
        console.log('Loaded saved model');
      }
    } catch (error) {
      console.log('No saved model found, using new model');
    }
  }
}

export const recommendationEngine = new RecommendationEngine();