// ============================================
// Database Seeder
// Seeds the database with initial data from
// the Flutter app's JSON asset files
//
// Usage: npm run seed
// ============================================

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Import models
const Person = require('../models/Person.model');
const Event = require('../models/Event.model');
const Quiz = require('../models/Quiz.model');
const Culture = require('../models/Culture.model');
const Story = require('../models/Story.model');
const User = require('../models/User.model');

// Path to Flutter app's data assets
const DATA_DIR = path.join(__dirname, '..', '..', '..', 'flutter_app', 'assets', 'data');

/**
 * Read and parse a JSON file from the Flutter assets.
 */
const readJsonFile = (filename) => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return [];
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
};

/**
 * Seed all collections from Flutter JSON data.
 */
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      Person.deleteMany({}),
      Event.deleteMany({}),
      Quiz.deleteMany({}),
      Culture.deleteMany({}),
      Story.deleteMany({}),
    ]);

    // Read JSON data files
    console.log('📂 Reading Flutter asset data...');
    const personsData = readJsonFile('persons.json');
    const eventsData = readJsonFile('events.json');
    const quizzesData = readJsonFile('quizzes.json');
    const cultureData = readJsonFile('culture.json');

    // Seed persons — use new admin PersonModel fields
    const persons = personsData.map((p) => ({
      name: p.name,
      birthYear: p.birth_year || null,
      deathYear: p.death_year || null,
      shortBio: p.description || p.short_bio || '',
      avatarUrl: p.image_url || p.imageUrl || null,
      tags: p.tags || [],
    }));

    const events = eventsData.map((e) => ({
      eventId: e.event_id,
      title: e.title,
      date: e.date,
      description: e.description,
      personId: e.person_id || null,
    }));

    const quizzes = quizzesData.map((q) => ({
      title: q.title || q.question || 'Quiz',
      description: q.description || '',
      difficulty: q.difficulty || 'easy',
      topic: q.topic || '',
      isPublished: true,
      questions: q.questions || [
        {
          id: `q_${q.quiz_id || Math.floor(Math.random() * 9999)}`,
          question: typeof q.question === 'string' ? q.question : 'Sample question?',
          options:
            Array.isArray(q.options)
              ? q.options.slice(0, 4)
              : typeof q.answers === 'string'
              ? JSON.parse(q.answers).slice(0, 4)
              : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctIndex: q.correct_answer ?? q.correctIndex ?? 0,
          explanation: null,
        },
      ],
    }));

    const culture = cultureData.map((c) => ({
      title: c.title || c.name || 'Untitled',
      description: c.description || '',
      coverImageUrl: c.cover_image_url || c.image_url || c.imageUrl || null,
      order: c.order ?? 0,
    }));

    // Insert data
    console.log('📥 Seeding data...');

    if (persons.length > 0) {
      await Person.insertMany(persons);
      console.log(`   ✅ ${persons.length} persons inserted`);
    }

    if (events.length > 0) {
      await Event.insertMany(events);
      console.log(`   ✅ ${events.length} events inserted`);
    }

    if (quizzes.length > 0) {
      await Quiz.insertMany(quizzes);
      console.log(`   ✅ ${quizzes.length} quizzes inserted`);
    }

    if (culture.length > 0) {
      await Culture.insertMany(culture);
      console.log(`   ✅ ${culture.length} culture items inserted`);
    }

    // Create default admin user if none exists
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'Admin123456',
        role: 'admin',
        displayName: 'System Admin',
        preferredLanguage: 'en',
      });
      console.log('   ✅ Default admin user created (admin@example.com / Admin123456)');
    }

    // Seed sample stories + story quiz
    const sampleQuiz = await Quiz.findOne({ isPublished: true });
    const sampleStories = [
      {
        title: 'The Rise of Temüjin',
        content:
          'Temüjin was born around 1162 CE in the Khentii Mountains. From humble beginnings he forged alliances, defeated rival tribes, and united the nomadic peoples of the Mongolian steppe under one banner. In 1206 he was proclaimed Genghis Khan — Universal Ruler — at the great kurultai on the banks of the Onon River.',
        order: 1,
        xpReward: 100,
        quizId: sampleQuiz?._id || null,
      },
      {
        title: 'The Mongol Conquest of Central Asia',
        content:
          'Between 1219 and 1221, Genghis Khan led his armies westward, shattering the Khwarazmian Empire in a campaign of staggering speed. Cities such as Samarkand, Bukhara, and Urgench fell in rapid succession. The campaigns reshaped the trade routes and political landscape of Central Asia for centuries.',
        order: 2,
        xpReward: 150,
      },
      {
        title: 'Pax Mongolica and the Silk Road',
        content:
          'At its height the Mongol Empire stretched from the Pacific Ocean to Eastern Europe. The Pax Mongolica — Mongol Peace — secured safe passage along the Silk Road, enabling an unprecedented exchange of goods, ideas, religion, and disease across Eurasia. Marco Polo\'s famous journey took place during this era.',
        order: 3,
        xpReward: 200,
      },
    ];

    for (const s of sampleStories) {
      const exists = await Story.findOne({ title: s.title });
      if (!exists) {
        await Story.create(s);
      }
    }
    console.log('   ✅ Sample stories seeded');

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
