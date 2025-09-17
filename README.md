# 🛍️ AI Shop - TensorFlow.js Ecommerce Demo

A lightweight, intelligent ecommerce demo that uses **TensorFlow.js** to provide real-time, personalized product recommendations. Built with React and Vite for optimal performance.

![AI Shop Demo](https://via.placeholder.com/800x400/667eea/FFFFFF?text=AI+Shop+Demo)

## ✨ Features

### 🧠 Machine Learning Powered
- **Real-time Recommendations**: TensorFlow.js neural network learns from user interactions
- **Dynamic Product Reordering**: Homepage products automatically reorder based on your preferences
- **Intelligent Similarity**: Products are recommended based on category, features, and user behavior
- **Persistent Learning**: Model weights are saved locally and improve over time

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Smooth Animations**: Elegant transitions and loading states
- **Product Detail Modals**: Rich product information with related product suggestions
- **User Statistics**: Track your interaction patterns and preferences

### ⚡ Performance Optimized
- **Lightweight Bundle**: < 2MB total application size
- **Fast Loading**: Vite-powered development and optimized production builds
- **Efficient ML Inference**: < 100ms recommendation processing
- **Smart Caching**: Product data and model weights cached for better performance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (compatible with Node.js 20.9.0)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd tensorflow-ecommerce
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

3. **Open your browser:**
Navigate to `http://localhost:5173`

## 🔧 How It Works

### Machine Learning Architecture

The application uses a **feedforward neural network** built with TensorFlow.js:

```
Input Layer (Product Features) → Hidden Layers → Output (Recommendation Score)
```

**Input Features:**
- Category encoding (one-hot)
- Price normalization
- Rating scores
- Feature flags (premium, wireless, etc.)

**Training Process:**
- **Online Learning**: Model updates after each user interaction
- **Positive/Negative Sampling**: Clicked products = positive, non-clicked = negative
- **Collaborative Filtering**: Similar user preference patterns

### User Interaction Flow

1. **Initial State**: Products displayed in default order (by rating)
2. **User Clicks**: Product click triggers ML model update
3. **Recommendation Generation**: TensorFlow.js processes user preferences
4. **Dynamic Reordering**: Homepage products reorder based on predictions
5. **Continuous Learning**: Each interaction improves future recommendations

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ProductCard.jsx   # Individual product display
│   ├── ProductDetail.jsx # Product modal with details
│   ├── HomePage.jsx      # Main product grid
│   └── Header.jsx        # Navigation and stats
├── services/            # Data and utility services
│   ├── productService.js # Fake Store API integration
│   └── userTracker.js    # Interaction tracking
├── ml/                  # Machine learning logic
│   └── recommendationModel.js # TensorFlow.js model
├── hooks/               # React hooks
│   └── useRecommendations.js # ML integration hook
└── App.jsx             # Main application component
```

## 🎯 Key Technologies

- **Frontend**: React 18, Vite
- **Machine Learning**: TensorFlow.js
- **Data Source**: Fake Store API
- **Styling**: Vanilla CSS with modern design patterns
- **State Management**: React Context + Custom Hooks

## 🧪 Try the Demo

### Test the Recommendation System:

1. **Browse Products**: Notice the initial product order
2. **Click on Products**: Open product details to view information
3. **Observe Changes**: Return to homepage - products have reordered!
4. **Continue Clicking**: More interactions = better recommendations
5. **Check Stats**: Click the "📊 Stats" button to see your interaction data
6. **Reset Data**: Use "🔄 Reset Data" to start fresh

### Expected Behavior:
- Products similar to clicked items move to the top
- Categories you prefer appear more frequently
- Recently viewed products get priority boost
- ML model learns your preferences over time

## 🎨 Customization

### Add New Product Features:
```javascript
// In productService.js
extractFeatures(category, description) {
  // Add your custom feature detection logic
  const features = [category];
  // ... existing code
  return features;
}
```

### Modify ML Model:
```javascript
// In recommendationModel.js
createModel(numProducts, numCategories) {
  // Customize the neural network architecture
  const model = tf.sequential({
    layers: [
      // Add/modify layers here
    ]
  });
  return model;
}
```

## 🐛 Troubleshooting

### Common Issues:

1. **Node.js Version Error**: Ensure you're using Node.js 18+ or downgrade Vite
2. **TensorFlow.js Loading**: Check browser console for WebGL support
3. **API Timeouts**: Fake Store API occasionally slow - refresh if needed
4. **LocalStorage Full**: Clear browser data if model can't save

### Development Commands:
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
```

## 🌟 Future Enhancements

- **User Authentication**: Save preferences across devices
- **Product Filtering**: Category and price filters
- **Shopping Cart**: Full ecommerce functionality
- **A/B Testing**: Compare recommendation algorithms
- **Analytics Dashboard**: Detailed ML model performance metrics
- **Social Features**: User reviews and ratings

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ using React, TensorFlow.js, and modern web technologies.**

# 🧠 Guia Educativo: TensorFlow.js no E-commerce Demo

## 📋 Visão Geral

Este documento explica cada API do TensorFlow.js utilizada no projeto de recomendações, com justificativas educativas e exemplos práticos.

## 🔧 APIs do TensorFlow.js Utilizadas

### 1. **tf.sequential()** - Criação de Modelo Sequencial

```typescript
const model = tf.sequential({
  layers: [...]
});
```

**Por que usar:**
- Modelo sequencial é ideal para redes feedforward simples
- Camadas são empilhadas em ordem linear
- Perfeito para iniciantes em deep learning
- Arquitetura clara e fácil de entender

**Alternativas:**
- `tf.model()` para arquiteturas mais complexas (não usado aqui por simplicidade)

### 2. **tf.layers.dense()** - Camadas Densas (Fully Connected)

```typescript
tf.layers.dense({ 
  inputShape: [products.length + 4], 
  units: 64, 
  activation: 'relu',
  name: 'camada_entrada'
})
```

**Parâmetros explicados:**
- `inputShape`: dimensão da entrada [número_de_características]
- `units`: número de neurônios na camada (64 = boa capacidade sem overfitting)
- `activation: 'relu'`: função ReLU = max(0, x), previne gradiente negativo
- `name`: identificação para debug e visualização

**Por que Dense:**
- Conecta todos os neurônios de entrada com todos de saída
- Ideal para aprender relações complexas entre características
- Padrão para sistemas de recomendação

### 3. **tf.layers.dropout()** - Regularização

```typescript
tf.layers.dropout({ 
  rate: 0.2,
  name: 'dropout_regularizacao'
})
```

**Por que usar:**
- **Previne overfitting**: "desliga" 20% dos neurônios aleatoriamente
- **Generalização**: força o modelo a não depender de neurônios específicos
- **Robustez**: melhora performance em dados não vistos
- **Padrão da indústria**: rate 0.2-0.5 é comum

### 4. **Funções de Ativação**

#### **ReLU (Rectified Linear Unit)**
```typescript
activation: 'relu' // max(0, x)
```
- **Vantagens**: resolve problema do gradiente que desaparece
- **Quando usar**: camadas ocultas, padrão moderno
- **Características**: simples, eficiente, não-linear

#### **Softmax**
```typescript
activation: 'softmax'
```
- **Propósito**: converte logits em probabilidades (soma = 1)
- **Uso**: camada de saída para classificação multiclasse
- **Output**: distribuição de probabilidade sobre produtos

### 5. **model.compile()** - Configuração de Treinamento

```typescript
model.compile({
  optimizer: tf.train.adam(0.001),
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy']
});
```

#### **Otimizador Adam**
- **Por que Adam**: combina momentum + RMSprop
- **Learning Rate 0.001**: balanço entre velocidade e estabilidade
- **Adaptativo**: ajusta taxa de aprendizado automaticamente
- **Padrão da indústria**: funciona bem na maioria dos casos

#### **Categorical Crossentropy**
- **Para que**: classificação multiclasse (qual produto recomendar)
- **Como funciona**: penaliza previsões incorretas logaritmicamente
- **Adequado**: quando temos rótulos one-hot encoding

### 6. **tf.tensor2d()** - Criação de Tensors

```typescript
const xs = tf.tensor2d(trainingData.inputs);   // Features
const ys = tf.tensor2d(trainingData.outputs);  // Labels
```

**Por que 2D:**
- Primeira dimensão: número de exemplos (batch size)
- Segunda dimensão: número de características
- Formato padrão para dados tabulares
- Compatível com camadas Dense

### 7. **model.fit()** - Treinamento

```typescript
await this.model.fit(xs, ys, {
  epochs: 3,
  batchSize: Math.min(32, trainingData.inputs.length),
  verbose: 0,
  shuffle: true
});
```

**Parâmetros otimizados:**
- `epochs: 3`: poucas épocas para aprendizado incremental
- `batchSize: 32`: balanço entre eficiência e atualização frequente
- `shuffle: true`: evita viés de ordem dos dados
- `verbose: 0`: sem logs (performance no navegador)

### 8. **Gerenciamento de Memória**

```typescript
xs.dispose();
ys.dispose();
```

**Crítico no navegador:**
- **dispose()**: libera memória GPU/CPU imediatamente
- **Sem dispose()**: vazamentos de memória graves
- **Boa prática**: dispose após cada uso de tensor
- **Performance**: mantém aplicação responsiva

### 9. **model.save() / tf.loadLayersModel()** - Persistência

```typescript
// Salvar
await this.model.save('localstorage://recommendation-model');

// Carregar
const model = await tf.loadLayersModel('localstorage://recommendation-model');
```

**Benefícios:**
- **Persistência local**: dados não saem do navegador
- **Continuidade**: modelo aprende entre sessões
- **Performance**: evita retreinamento do zero
- **URL especial**: 'localstorage://' é específica do TensorFlow.js

### 10. **tf.ready()** - Inicialização

```typescript
tf.ready().then(() => {
  console.log('TensorFlow.js is ready!');
});
```

**Por que usar:**
- **Inicialização**: garante que backend está pronto (WebGL, CPU, etc.)
- **Detecção de suporte**: verifica capacidades do navegador
- **Boa prática**: aguardar antes de criar modelos

## 🎯 Fluxo Completo do Machine Learning

### 1. **Preparação dos Dados**
```typescript
// One-hot encoding para categorias
const categories = [...new Set(allProducts.map(p => p.category))];
categories.forEach(cat => {
  vector.push(product.category === cat ? 1 : 0);
});

// Normalização de valores numéricos (0-1)
const normalizedPrice = product.price / maxPrice;
```

### 2. **Arquitetura da Rede**
```
Entrada (produtos + contexto) → Dense(64, ReLU) → Dropout(0.2) → Dense(32, ReLU) → Saída(softmax)
```

### 3. **Treinamento Online**
- Sessões temporais (30 min timeout)
- Sequências produto_atual → próximo_produto
- Mini-batches para eficiência
- Salvamento automático

### 4. **Inferência**
- Combinação de ML + regras heurísticas
- Score base + boosts por comportamento
- Ranking final por score decrescente

## 🏗️ Decisões Arquiteturais

### **Por que Rede Neural Simples?**
- **Educativo**: fácil de entender e explicar
- **Eficiente**: roda no navegador sem problemas
- **Suficiente**: dados limitados não justificam modelos complexos
- **Rápido**: inferência < 100ms

### **Por que Online Learning?**
- **Tempo real**: adaptação imediata ao comportamento
- **Personalização**: cada usuário tem modelo único
- **Prático**: funciona com poucos dados iniciais
- **Engajamento**: usuário vê melhorias imediatas

### **Por que localStorage?**
- **Privacidade**: dados não saem do dispositivo
- **Performance**: sem latência de rede
- **Simplicidade**: sem necessidade de backend
- **Demonstração**: ideal para POC educativo

## 🔍 Conceitos de Machine Learning Aplicados

### **1. Feature Engineering**
- Normalização de escalas diferentes
- One-hot encoding para categóricas
- Ranking relativo para ordenação

### **2. Regularização**
- Dropout para prevenir overfitting
- Learning rate baixo para estabilidade
- Poucas épocas para não memorizar

### **3. Avaliação**
- Loss como métrica de otimização
- Scores combinados (ML + heurísticas)
- Feedback implícito (cliques)

## 📚 Recursos para Aprofundamento

1. **Documentação Oficial**: https://js.tensorflow.org/
2. **Tutoriais**: https://js.tensorflow.org/tutorials/
3. **Exemplos**: https://github.com/tensorflow/tfjs-examples
4. **Conceitos ML**: https://developers.google.com/machine-learning/crash-course

---

*Este projeto demonstra como implementar ML no navegador de forma educativa e prática. Cada escolha técnica foi feita pensando na clareza conceitual e facilidade de aprendizado.*
