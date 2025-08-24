import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Module } from '../models/Module.js';
import { Quiz } from '../models/Quiz.js';
dotenv.config();
function toModuleDoc(m, creatorId) {
    return {
        title: m.title,
        description: m.description,
        subject: 'Web Development',
        difficulty: m.difficultyLevel === 1 ? 'beginner' : m.difficultyLevel === 2 ? 'intermediate' : 'advanced',
        prerequisites: [],
        learningObjectives: m.content.slice(0, 3).map(s => s.heading),
        content: m.content.map((s, idx) => ({ type: 'text', title: s.heading, content: s.body, order: idx + 1 })),
        estimatedDuration: 30 + (m.difficultyLevel - 1) * 15,
        isActive: true,
        createdBy: creatorId
    };
}
function toQuizDoc(q, moduleId, creatorId) {
    const correct = q.choices[q.correctIndex];
    return {
        title: `${q.moduleId} – Checkpoint`,
        description: q.explanation.substring(0, 120) || 'Module quiz',
        moduleId,
        difficulty: q.difficultyLevel === 1 ? 'beginner' : q.difficultyLevel === 2 ? 'intermediate' : 'advanced',
        timeLimit: 10,
        questions: [
            {
                text: q.question,
                type: 'multiple-choice',
                options: q.choices,
                correctAnswer: correct,
                explanation: q.explanation,
                points: q.difficultyLevel,
                difficulty: q.difficultyLevel === 1 ? 'easy' : q.difficultyLevel === 2 ? 'medium' : 'hard',
                tags: ['module', q.moduleId]
            }
        ],
        passingScore: 70,
        isActive: true,
        createdBy: creatorId
    };
}
async function run() {
    const mongoURI = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/adaptive_elearning';
    await mongoose.connect(mongoURI);
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const modulesPath = path.resolve(__dirname, './data/modules.json');
    const quizzesPath = path.resolve(__dirname, './data/quizzes.json');
    const modulesJson = JSON.parse(fs.readFileSync(modulesPath, 'utf-8'));
    const quizzesJson = JSON.parse(fs.readFileSync(quizzesPath, 'utf-8'));
    // Clear existing content (optional)
    await Module.deleteMany({ subject: 'Web Development' });
    await Quiz.deleteMany({});
    const creatorId = new mongoose.Types.ObjectId();
    // Insert modules
    const moduleIdMap = new Map();
    for (const m of modulesJson) {
        const created = await Module.create(toModuleDoc(m, creatorId));
        moduleIdMap.set(m.id, created._id);
    }
    // Group quizzes per moduleId
    const quizzesByModule = quizzesJson.reduce((acc, q) => {
        acc[q.moduleId] = acc[q.moduleId] || [];
        acc[q.moduleId].push(q);
        return acc;
    }, {});
    // For each module, create a single quiz that includes all its questions
    for (const [modKey, qs] of Object.entries(quizzesByModule)) {
        const modObjectId = moduleIdMap.get(modKey);
        if (!modObjectId)
            continue;
        const questions = qs.map(q => ({
            text: q.question,
            type: 'multiple-choice',
            options: q.choices,
            correctAnswer: q.choices[q.correctIndex],
            explanation: q.explanation,
            points: q.difficultyLevel,
            difficulty: q.difficultyLevel === 1 ? 'easy' : q.difficultyLevel === 2 ? 'medium' : 'hard',
            tags: ['module', modKey]
        }));
        const maxDifficulty = Math.max(...qs.map(q => q.difficultyLevel));
        await Quiz.create({
            title: `${modKey} – Knowledge Check`,
            description: `Assessment for ${modKey}`,
            moduleId: modObjectId,
            difficulty: maxDifficulty === 1 ? 'beginner' : maxDifficulty === 2 ? 'intermediate' : 'advanced',
            timeLimit: 12,
            questions,
            passingScore: 70,
            isActive: true,
            createdBy: creatorId
        });
    }
    console.log('Seeding complete');
    await mongoose.disconnect();
}
run().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seedContent.js.map