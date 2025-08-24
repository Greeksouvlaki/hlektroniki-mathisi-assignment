// Mock data service for when MongoDB is not available
export const mockUsers = [
  {
    _id: '1',
    email: 'student@test.com',
    firstName: 'John',
    lastName: 'Student',
    role: 'student',
    isActive: true,
    lastLogin: new Date()
  },
  {
    _id: '2',
    email: 'teacher@test.com',
    firstName: 'Jane',
    lastName: 'Teacher',
    role: 'teacher',
    isActive: true,
    lastLogin: new Date()
  }
];

export const mockQuizzes = [
  {
    _id: '1',
    title: 'JavaScript Basics',
    description: 'Test your knowledge of JavaScript fundamentals',
    moduleId: '1',
    difficulty: 'beginner',
    timeLimit: 30,
    questions: [
      {
        _id: '1',
        type: 'multiple-choice',
        question: 'What is JavaScript?',
        options: ['A programming language', 'A markup language', 'A styling language', 'A database'],
        correctAnswer: 0,
        explanation: 'JavaScript is a programming language used for web development.'
      },
      {
        _id: '2',
        type: 'multiple-choice',
        question: 'Which keyword is used to declare a variable in JavaScript?',
        options: ['var', 'let', 'const', 'All of the above'],
        correctAnswer: 3,
        explanation: 'JavaScript supports var, let, and const for variable declaration.'
      }
    ]
  },
  {
    _id: '2',
    title: 'React Fundamentals',
    description: 'Test your React knowledge',
    moduleId: '2',
    difficulty: 'intermediate',
    timeLimit: 45,
    questions: [
      {
        _id: '3',
        type: 'multiple-choice',
        question: 'What is React?',
        options: ['A database', 'A programming language', 'A JavaScript library', 'A CSS framework'],
        correctAnswer: 2,
        explanation: 'React is a JavaScript library for building user interfaces.'
      }
    ]
  }
];

export const mockModules = [
  {
    _id: '1',
    title: 'Introduction to Programming',
    description: 'Learn the basics of programming with JavaScript',
    difficulty: 'beginner',
    estimatedTime: 120,
    topics: ['Variables', 'Functions', 'Control Flow'],
    content: [
      {
        type: 'text',
        title: 'What is Programming?',
        content: 'Programming is the process of creating instructions for computers to follow...'
      }
    ]
  },
  {
    _id: '2',
    title: 'Web Development with React',
    description: 'Build modern web applications with React',
    difficulty: 'intermediate',
    estimatedTime: 180,
    topics: ['Components', 'State', 'Props'],
    content: [
      {
        type: 'text',
        title: 'Introduction to React',
        content: 'React is a JavaScript library for building user interfaces...'
      }
    ]
  }
];

export const mockProgress = [
  {
    _id: '1',
    userId: '1',
    moduleId: '1',
    quizId: '1',
    score: 85,
    percentage: 85,
    timeSpent: 1200,
    completedAt: new Date(),
    responses: [
      { questionId: '1', answer: 0, isCorrect: true },
      { questionId: '2', answer: 3, isCorrect: true }
    ]
  }
];
