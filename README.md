# 🎓 Adaptive E-Learning Platform

Μια σύγχρονη πλατφόρμα προσαρμοστικής ηλεκτρονικής μάθησης που προσαρμόζεται στις ανάγκες κάθε μαθητή.

## 🌟 Χαρακτηριστικά

- **🔐 Ασφαλής Authentication** με JWT
- **🧠 Προσαρμοστικός Αλγόριθμος** προτάσεων εκμάθησης
- **📊 Παρακολούθηση Προόδου** με αναλυτικά στατιστικά
- **🧪 Διαδραστικά Quizzes** με αυτόματη βαθμολόγηση
- **📚 Διαχείριση Modules** εκμάθησης
- **🎯 Προσωπικοποιημένες Προτάσεις** βάσει προόδου
- **📱 Responsive Design** για όλες τις συσκευές
- **⚡ Real-time Updates** με WebSocket
- **🔍 Αναζήτηση και Φιλτράρισμα** περιεχομένου

## 🏗️ Αρχιτεκτονική

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Express)     │◄──►│   (MongoDB)     │
│   Port: 5173    │    │   Port: 3000    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Γρήγορη Εκκίνηση

### Προαπαιτούμενα

- **Node.js** >= 18.0.0
- **MongoDB** >= 5.0
- **npm** ή **yarn**

### Εγκατάσταση

1. **Clone το repository**
   ```bash
   git clone <repository-url>
   cd Ηλεκτρονική\ Μάθηση
   ```

2. **Εγκατάσταση dependencies**
   ```bash
   # Backend
   cd server && npm install
   
   # Frontend
   cd ../client && npm install
   
   # Shared types
   cd ../shared && npm install
   ```

3. **Ρύθμιση Environment Variables**

   **Backend** (`server/.env`):
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/adaptive_elearning
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=7d
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

   **Frontend** (`client/.env`):
   ```env
    VITE_API_URL=http://localhost:3000/api
   VITE_APP_NAME=Adaptive E-Learning Platform
   ```

4. **Εκκίνηση Servers**

   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd client
   npm run dev
   ```

5. **Πρόσβαση στην Εφαρμογή**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api-docs

6. **Testing**
   - See `test-app.md` for detailed testing instructions
   - The app uses mock data when MongoDB is not available

## 👥 Test Accounts

### Student Account
- **Email:** `student@test.com`
- **Password:** `password123`

### Teacher Account
- **Email:** `teacher@test.com`
- **Password:** `password123`

### Admin Account
- **Email:** `admin@test.com`
- **Password:** `password123`

## 📁 Δομή Project

```
Ηλεκτρονική Μάθηση/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── pages/         # Page Components
│   │   ├── services/      # API Services
│   │   ├── store/         # State Management (Zustand)
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
│   ├── developer-guide.md # Εγχειρίδιο Προγραμματιστή
│   ├── user-guide.md      # Εγχειρίδιο Χρήστη
│   └── faq.md            # Συχνές Ερωτήσεις
├── docker/                # Docker Configuration
├── docker-compose.yml     # Docker Compose Setup
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Modules
- `GET /api/modules` - Get all modules
- `GET /api/modules/:id` - Get specific module
- `POST /api/modules` - Create module (admin only)
- `PUT /api/modules/:id` - Update module (admin only)
- `DELETE /api/modules/:id` - Delete module (admin only)

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get specific quiz
- `POST /api/quizzes` - Create quiz (admin only)
- `PUT /api/quizzes/:id` - Update quiz (admin only)
- `DELETE /api/quizzes/:id` - Delete quiz (admin only)
- `POST /api/quizzes/:id/submit` - Submit quiz answers

### Progress
- `GET /api/progress` - Get user progress
- `GET /api/progress/analytics` - Get progress analytics
- `POST /api/progress` - Update progress

### Adaptive Learning
- `GET /api/adaptive/recommendations` - Get personalized recommendations
- `POST /api/adaptive/feedback` - Submit learning feedback

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd client
npm test
npm run test:coverage
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Database Seeding

### Seed Test Data
```bash
cd server
npm run seed:users
npm run seed:modules
npm run seed:quizzes
npm run seed:progress
```

## 🔧 Development Scripts

### Backend
```bash
cd server
npm run dev          # Development server
npm run build        # Build for production
npm run start        # Production server
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
npm run format       # Format code
npm run type-check   # TypeScript check
```

### Frontend
```bash
cd client
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
npm run format       # Format code
npm run type-check   # TypeScript check
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Winston** - Logging
- **Jest** - Testing

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Routing
- **Axios** - HTTP client
- **React Testing Library** - Testing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container setup
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks

## 📚 Documentation

- **[Εγχειρίδιο Προγραμματιστή](docs/developer-guide.md)** - Τεχνική τεκμηρίωση
- **[Εγχειρίδιο Χρήστη](docs/user-guide.md)** - Οδηγίες χρήσης
- **[API Documentation](http://localhost:3000/api-docs)** - Swagger documentation

## 🤝 Contributing

1. Fork το repository
2. Δημιουργήστε ένα feature branch (`git checkout -b feature/amazing-feature`)
3. Commit τις αλλαγές (`git commit -m 'Add amazing feature'`)
4. Push στο branch (`git push origin feature/amazing-feature`)
5. Ανοίξτε ένα Pull Request

## 📝 License

Αυτό το project είναι υπό την άδεια MIT. Δείτε το αρχείο [LICENSE](LICENSE) για περισσότερες λεπτομέρειες.

## 👨‍💻 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- React team για το φανταστικό framework
- Express.js team για το backend framework
- MongoDB team για τη βάση δεδομένων
- Tailwind CSS team για το styling framework

## 📞 Support

Για ερωτήσεις και υποστήριξη:

- 📧 Email: support@adaptive-elearning.com
- 📖 Documentation: [docs/](docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/adaptive-elearning/issues)

---

**Καλή εκμάθηση! 🚀** 