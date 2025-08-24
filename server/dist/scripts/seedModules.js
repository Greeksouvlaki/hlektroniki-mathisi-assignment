import mongoose from 'mongoose';
import { Module } from '../models/Module.js';
import dotenv from 'dotenv';
dotenv.config();
const sampleModules = [
    {
        title: 'Introduction to JavaScript',
        description: 'Learn the basics of JavaScript programming language',
        subject: 'Programming',
        difficulty: 'beginner',
        learningObjectives: [
            'Understand basic JavaScript syntax',
            'Learn about variables and data types',
            'Master control flow statements'
        ],
        content: [
            {
                type: 'text',
                title: 'What is JavaScript?',
                content: 'JavaScript is a programming language that enables interactive web pages.',
                order: 1
            },
            {
                type: 'text',
                title: 'JavaScript Basics',
                content: 'Learn about variables, functions, and control flow in JavaScript.',
                order: 2
            }
        ],
        prerequisites: [],
        estimatedDuration: 30,
        isActive: true,
        createdBy: new mongoose.Types.ObjectId()
    },
    {
        title: 'React Fundamentals',
        description: 'Master the fundamentals of React development',
        subject: 'Web Development',
        difficulty: 'intermediate',
        learningObjectives: [
            'Understand React components and JSX',
            'Learn about props and state management',
            'Master React hooks for functional components'
        ],
        content: [
            {
                type: 'text',
                title: 'Introduction to React',
                content: 'React is a JavaScript library for building user interfaces.',
                order: 1
            },
            {
                type: 'text',
                title: 'Your First Component',
                content: 'Learn how to create and use React components.',
                order: 2
            }
        ],
        prerequisites: [],
        estimatedDuration: 45,
        isActive: true,
        createdBy: new mongoose.Types.ObjectId()
    },
    {
        title: 'Advanced JavaScript Concepts',
        description: 'Deep dive into advanced JavaScript features',
        subject: 'Programming',
        difficulty: 'advanced',
        learningObjectives: [
            'Master JavaScript closures and scope',
            'Understand async/await and promises',
            'Learn advanced JavaScript patterns'
        ],
        content: [
            {
                type: 'text',
                title: 'Closures and Scope',
                content: 'Understanding JavaScript closures and scope.',
                order: 1
            },
            {
                type: 'text',
                title: 'Async Programming',
                content: 'Learn about promises, async/await, and asynchronous programming.',
                order: 2
            }
        ],
        prerequisites: [],
        estimatedDuration: 60,
        isActive: true,
        createdBy: new mongoose.Types.ObjectId()
    }
];
async function seedModules() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env['MONGODB_URI'] || 'mongodb://localhost:27017/adaptive-learning');
        console.log('Connected to MongoDB');
        // Clear existing modules
        await Module.deleteMany({});
        console.log('Cleared existing modules');
        // Insert sample modules
        const insertedModules = await Module.insertMany(sampleModules);
        console.log(`Inserted ${insertedModules.length} modules`);
        console.log('Module seeding completed successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding modules:', error);
        process.exit(1);
    }
}
seedModules();
//# sourceMappingURL=seedModules.js.map