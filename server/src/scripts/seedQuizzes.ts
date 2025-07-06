import mongoose from 'mongoose';
import { Quiz } from '../models/Quiz';
import dotenv from 'dotenv';

dotenv.config();

const sampleQuizzes = [
  {
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of basic JavaScript concepts',
    moduleId: new mongoose.Types.ObjectId(), // We'll create a dummy module ID
    difficulty: 'beginner',
    questions: [
      {
        text: 'What is the correct way to declare a variable in JavaScript?',
        type: 'multiple-choice',
        options: ['var x = 5;', 'variable x = 5;', 'v x = 5;', 'declare x = 5;'],
        correctAnswer: 'var x = 5;',
        explanation: 'The "var" keyword is used to declare variables in JavaScript.',
        difficulty: 'easy',
        points: 1,
        tags: ['variables', 'declaration']
      },
      {
        text: 'Which method is used to add an element to the end of an array?',
        type: 'multiple-choice',
        options: ['push()', 'pop()', 'shift()', 'unshift()'],
        correctAnswer: 'push()',
        explanation: 'The push() method adds one or more elements to the end of an array.',
        difficulty: 'easy',
        points: 1,
        tags: ['arrays', 'methods']
      },
      {
        text: 'What is the result of 2 + "2" in JavaScript?',
        type: 'multiple-choice',
        options: ['4', '22', 'NaN', 'Error'],
        correctAnswer: '22',
        explanation: 'JavaScript performs type coercion, converting the number to a string and concatenating.',
        difficulty: 'medium',
        points: 2,
        tags: ['type-coercion', 'operators']
      }
    ],
    timeLimit: 10, // 10 minutes (in minutes, not seconds)
    passingScore: 70,
    isActive: true,
    createdBy: new mongoose.Types.ObjectId() // We'll use a dummy user ID
  },
  {
    title: 'React Basics',
    description: 'Learn the fundamentals of React development',
    moduleId: new mongoose.Types.ObjectId(),
    difficulty: 'intermediate',
    questions: [
      {
        text: 'What is a React component?',
        type: 'multiple-choice',
        options: [
          'A JavaScript function that returns HTML',
          'A CSS class',
          'A database table',
          'A server-side script'
        ],
        correctAnswer: 'A JavaScript function that returns HTML',
        explanation: 'React components are JavaScript functions that return HTML-like JSX.',
        difficulty: 'medium',
        points: 2,
        tags: ['components', 'jsx']
      },
      {
        text: 'What hook is used to manage state in functional components?',
        type: 'multiple-choice',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correctAnswer: 'useState',
        explanation: 'useState is the primary hook for managing state in functional components.',
        difficulty: 'medium',
        points: 2,
        tags: ['hooks', 'state']
      },
      {
        text: 'What is the purpose of the useEffect hook?',
        type: 'multiple-choice',
        options: [
          'To manage state',
          'To perform side effects',
          'To create context',
          'To optimize performance'
        ],
        correctAnswer: 'To perform side effects',
        explanation: 'useEffect is used for side effects like data fetching, subscriptions, or DOM manipulation.',
        difficulty: 'hard',
        points: 3,
        tags: ['hooks', 'side-effects']
      }
    ],
    timeLimit: 15, // 15 minutes
    passingScore: 75,
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    title: 'Advanced JavaScript Concepts',
    description: 'Test your knowledge of advanced JavaScript features',
    moduleId: new mongoose.Types.ObjectId(),
    difficulty: 'advanced',
    questions: [
      {
        text: 'What is closure in JavaScript?',
        type: 'multiple-choice',
        options: [
          'A function that has access to variables in its outer scope',
          'A way to close browser tabs',
          'A method to end loops',
          'A type of variable declaration'
        ],
        correctAnswer: 'A function that has access to variables in its outer scope',
        explanation: 'A closure is a function that has access to variables in its outer (enclosing) scope.',
        difficulty: 'hard',
        points: 4,
        tags: ['closures', 'scope']
      },
      {
        text: 'What is the difference between let, const, and var?',
        type: 'multiple-choice',
        options: [
          'They are all the same',
          'let and const are block-scoped, var is function-scoped',
          'const is mutable, let and var are immutable',
          'var is the newest, let and const are deprecated'
        ],
        correctAnswer: 'let and const are block-scoped, var is function-scoped',
        explanation: 'let and const are block-scoped and have temporal dead zone, while var is function-scoped.',
        difficulty: 'hard',
        points: 3,
        tags: ['variables', 'scope', 'es6']
      },
      {
        text: 'What is the output of: console.log(typeof null)?',
        type: 'multiple-choice',
        options: ['null', 'undefined', 'object', 'number'],
        correctAnswer: 'object',
        explanation: 'This is a known JavaScript quirk - typeof null returns "object".',
        difficulty: 'hard',
        points: 4,
        tags: ['typeof', 'quirks']
      }
    ],
    timeLimit: 20, // 20 minutes
    passingScore: 80,
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    title: 'Mathematics Fundamentals',
    description: 'Basic mathematics concepts and problem solving',
    moduleId: new mongoose.Types.ObjectId(),
    difficulty: 'beginner',
    questions: [
      {
        text: 'What is 15 + 27?',
        type: 'multiple-choice',
        options: ['40', '42', '41', '43'],
        correctAnswer: '42',
        explanation: '15 + 27 = 42',
        difficulty: 'easy',
        points: 1,
        tags: ['addition', 'basic-math']
      },
      {
        text: 'What is 8 × 7?',
        type: 'multiple-choice',
        options: ['54', '56', '58', '60'],
        correctAnswer: '56',
        explanation: '8 × 7 = 56',
        difficulty: 'easy',
        points: 1,
        tags: ['multiplication', 'basic-math']
      },
      {
        text: 'What is the square root of 64?',
        type: 'multiple-choice',
        options: ['6', '7', '8', '9'],
        correctAnswer: '8',
        explanation: '8 × 8 = 64, so the square root of 64 is 8.',
        difficulty: 'medium',
        points: 2,
        tags: ['square-roots', 'basic-math']
      }
    ],
    timeLimit: 10, // 10 minutes
    passingScore: 70,
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  }
];

async function seedQuizzes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/adaptive-learning');
    console.log('Connected to MongoDB');

    // Clear existing quizzes
    await Quiz.deleteMany({});
    console.log('Cleared existing quizzes');

    // Insert sample quizzes
    const insertedQuizzes = await Quiz.insertMany(sampleQuizzes);
    console.log(`Inserted ${insertedQuizzes.length} quizzes`);

    console.log('Quiz seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding quizzes:', error);
    process.exit(1);
  }
}

seedQuizzes(); 