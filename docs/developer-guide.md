# Εγχειρίδιο Προγραμματιστή - Adaptive E-Learning Platform

## 📋 Περιεχόμενα
1. [Επισκόπηση Αρχιτεκτονικής](#επισκόπηση-αρχιτεκτονικής)
2. [Εγκατάσταση και Ρύθμιση](#εγκατάσταση-και-ρύθμιση)
3. [Δομή Project](#δομή-project)
4. [Backend API](#backend-api)
5. [Frontend Architecture](#frontend-architecture)
6. [Database Schema](#database-schema)
7. [Authentication System](#authentication-system)
8. [Adaptive Learning Algorithm](#adaptive-learning-algorithm)
9. [Testing](#testing)
10. [Deployment](#deployment)

## 🏗️ Επισκόπηση Αρχιτεκτονικής

### Technology Stack
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcrypt
- **State Management**: Zustand
- **Build Tools**: Vite, TypeScript, ESLint

### Architecture Pattern
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Express)     │◄──►│   (MongoDB)     │
│   Port: 5173    │    │   Port: 3000    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Εγκατάσταση και Ρύθμιση

### Προαπαιτούμενα
- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm ή yarn

### Εγκατάσταση
```bash
# Clone το repository
git clone <repository-url>
cd Ηλεκτρονική\ Μάθηση

# Εγκατάσταση dependencies
cd server && npm install
cd ../client && npm install
cd ../shared && npm install
```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/adaptive_elearning
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Adaptive E-Learning Platform
```

### Εκκίνηση Development Servers
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## 📁 Δομή Project

```
Ηλεκτρονική Μάθηση/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── pages/         # Page Components
│   │   ├── services/      # API Services
│   │   ├── store/         # State Management
│   │   ├── types/         # TypeScript Types
│   │   └── utils/         # Utility Functions
│   ├── public/            # Static Assets
│   └── package.json
├── server/                # Backend Express Application
│   ├── src/
│   │   ├── controllers/   # Route Controllers
│   │   ├── middleware/    # Express Middleware
│   │   ├── models/        # Mongoose Models
│   │   ├── routes/        # API Routes
│   │   ├── services/      # Business Logic
│   │   ├── types/         # TypeScript Types
│   │   └── utils/         # Utility Functions
│   ├── scripts/           # Database Seeding
│   └── package.json
├── shared/                # Shared Types
├── docs/                  # Documentation
└── docker/                # Docker Configuration
```

## 🔧 Backend API

### API Endpoints

#### Authentication
```typescript
POST /api/auth/register    // User registration
POST /api/auth/login       // User login
GET  /api/auth/profile     // Get user profile
PUT  /api/auth/profile     // Update user profile
```

#### Modules
```typescript
GET    /api/modules        // Get all modules
GET    /api/modules/:id    // Get specific module
POST   /api/modules        // Create module (admin only)
PUT    /api/modules/:id    // Update module (admin only)
DELETE /api/modules/:id    // Delete module (admin only)
```

#### Quizzes
```typescript
GET    /api/quizzes        // Get all quizzes
GET    /api/quizzes/:id    // Get specific quiz
POST   /api/quizzes        // Create quiz (admin only)
PUT    /api/quizzes/:id    // Update quiz (admin only)
DELETE /api/quizzes/:id    // Delete quiz (admin only)
POST   /api/quizzes/:id/submit  // Submit quiz answers
```

#### Progress
```typescript
GET    /api/progress       // Get user progress
GET    /api/progress/analytics  // Get progress analytics
POST   /api/progress       // Update progress
```

#### Adaptive Learning
```typescript
GET    /api/adaptive/recommendations  // Get personalized recommendations
POST   /api/adaptive/feedback        // Submit learning feedback
```

### Middleware Stack
```typescript
// server/src/index.ts
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(morgan('combined'));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

## ⚛️ Frontend Architecture

### Component Structure
```typescript
// Layout Components
Layout.tsx          // Main layout wrapper
Navbar.tsx          // Navigation bar
Sidebar.tsx         // Sidebar navigation
ProtectedRoute.tsx  // Route protection

// Page Components
DashboardPage.tsx   // Main dashboard
LoginPage.tsx       // Authentication
ModulesPage.tsx     // Learning modules
QuizzesPage.tsx     // Quiz listing
QuizPage.tsx        // Individual quiz
ProgressPage.tsx    // Progress tracking
RecommendationsPage.tsx // Personalized recommendations
```

### State Management (Zustand)
```typescript
// store/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
}
```

### API Service Layer
```typescript
// services/api.ts
class ApiClient {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await axios.get(`${this.baseURL}${endpoint}`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await axios.post(`${this.baseURL}${endpoint}`, data, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }
}
```

## 🗄️ Database Schema

### User Model
```typescript
interface User {
  _id: ObjectId;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  preferences: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    learningStyle: 'visual' | 'auditory' | 'kinesthetic';
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Module Model
```typescript
interface Module {
  _id: ObjectId;
  title: string;
  description: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  estimatedDuration: number; // minutes
  prerequisites: ObjectId[];
  learningObjectives: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Quiz Model
```typescript
interface Quiz {
  _id: ObjectId;
  title: string;
  description: string;
  moduleId: ObjectId;
  questions: Question[];
  timeLimit: number; // minutes
  passingScore: number; // percentage
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Question {
  _id: ObjectId;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}
```

### Progress Model
```typescript
interface Progress {
  _id: ObjectId;
  userId: ObjectId;
  moduleId: ObjectId;
  quizId?: ObjectId;
  status: 'not-started' | 'in-progress' | 'completed';
  score?: number;
  timeSpent: number; // seconds
  completedAt?: Date;
  answers?: QuizAnswer[];
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔐 Authentication System

### JWT Implementation
```typescript
// middleware/auth.ts
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};
```

### Password Hashing
```typescript
// controllers/authController.ts
export const registerUser = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, role } = req.body;
  
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const user = new User({
    email,
    password: hashedPassword,
    profile: { firstName, lastName },
    role: role || 'student'
  });
  
  await user.save();
  
  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  
  res.status(201).json({ token, user: user.toJSON() });
};
```

## 🧠 Adaptive Learning Algorithm

### Recommendation Engine
```typescript
// services/adaptiveService.ts
export class AdaptiveService {
  async getRecommendations(userId: string): Promise<Recommendation[]> {
    const user = await User.findById(userId);
    const userProgress = await Progress.find({ userId });
    
    // Calculate user proficiency
    const proficiency = this.calculateProficiency(userProgress);
    
    // Get modules based on difficulty and learning style
    const modules = await Module.find({
      difficulty: this.getRecommendedDifficulty(proficiency),
      category: { $in: this.getPreferredCategories(userProgress) }
    });
    
    // Apply collaborative filtering
    const collaborativeRecommendations = await this.getCollaborativeRecommendations(userId);
    
    return this.rankRecommendations(modules, collaborativeRecommendations, user.preferences);
  }

  private calculateProficiency(progress: Progress[]): number {
    const completedQuizzes = progress.filter(p => p.quizId && p.status === 'completed');
    const averageScore = completedQuizzes.reduce((sum, p) => sum + (p.score || 0), 0) / completedQuizzes.length;
    return Math.min(averageScore / 100, 1);
  }
}
```

### Learning Path Generation
```typescript
export class LearningPathService {
  async generatePath(userId: string, targetModule: string): Promise<Module[]> {
    const userProgress = await Progress.find({ userId });
    const completedModules = userProgress
      .filter(p => p.status === 'completed')
      .map(p => p.moduleId.toString());
    
    const allModules = await Module.find();
    const graph = this.buildPrerequisiteGraph(allModules);
    
    return this.findOptimalPath(graph, completedModules, targetModule);
  }
}
```

## 🧪 Testing

### Backend Testing
```typescript
// tests/auth.test.ts
describe('Authentication', () => {
  test('should register new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
  });
});
```

### Frontend Testing
```typescript
// tests/LoginPage.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../src/pages/LoginPage';

test('should handle login form submission', () => {
  render(<LoginPage />);
  
  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/password/i);
  const submitButton = screen.getByRole('button', { name: /login/i });
  
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.change(passwordInput, { target: { value: 'password123' } });
  fireEvent.click(submitButton);
  
  // Assert expected behavior
});
```

### Running Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test

# Coverage
npm run test:coverage
```

## 🚀 Deployment

### Docker Configuration
```dockerfile
# server/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password

  backend:
    build: ./server
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
    environment:
      MONGODB_URI: mongodb://admin:password@mongodb:27017/adaptive_elearning
      JWT_SECRET: your_production_jwt_secret

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

### Production Deployment
```bash
# Build and deploy
docker-compose up -d

# Environment variables for production
NODE_ENV=production
MONGODB_URI=mongodb://production-db-url
JWT_SECRET=strong_production_secret
RATE_LIMIT_MAX_REQUESTS=1000
```

## 📊 Monitoring and Logging

### Winston Logger Configuration
```typescript
// utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'adaptive-elearning' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Performance Monitoring
```typescript
// middleware/performance.ts
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request processed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });
  
  next();
};
```

## 🔧 Development Workflow

### Code Quality Tools
```json
// package.json scripts
{
  "scripts": {
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Git Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## 📚 API Documentation

### Swagger Configuration
```typescript
// server/src/index.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Adaptive E-Learning API',
      version: '1.0.0',
      description: 'API documentation for adaptive e-learning platform'
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      }
    ]
  },
  apis: ['./src/routes/*.ts']
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

---

## 🎯 Συμπέρασμα

Αυτή η εφαρμογή παρέχει ένα πλήρες adaptive e-learning platform με:

- **Modular Architecture**: Χωρισμένη σε frontend, backend, και shared components
- **Type Safety**: Πλήρες TypeScript support
- **Scalable Design**: RESTful API με proper middleware stack
- **Adaptive Learning**: Προηγμένος αλγόριθμος προτάσεων
- **Security**: JWT authentication με password hashing
- **Testing**: Comprehensive test suite
- **Documentation**: API documentation με Swagger
- **Deployment Ready**: Docker configuration για production

Η εφαρμογή είναι έτοιμη για παραγωγή και μπορεί να επεκταθεί με επιπλέον features όπως real-time collaboration, advanced analytics, και mobile support. 