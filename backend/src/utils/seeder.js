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
    ]);

    // Read JSON data files
    console.log('📂 Reading Flutter asset data...');
    const personsData = readJsonFile('persons.json');
    const eventsData = readJsonFile('events.json');
    const quizzesData = readJsonFile('quizzes.json');
    const cultureData = readJsonFile('culture.json');

    // Transform data to match Mongoose models
    const persons = personsData.map((p) => ({
      personId: p.person_id,
      name: p.name,
      birthDate: p.birth_date || null,
      deathDate: p.death_date || null,
      description: p.description,
      imageUrl: p.image_url || null,
    }));

    const events = eventsData.map((e) => ({
      eventId: e.event_id,
      title: e.title,
      date: e.date,
      description: e.description,
      personId: e.person_id || null,
    }));

    const quizzes = quizzesData.map((q) => ({
      quizId: q.quiz_id,
      question: q.question,
      answers: typeof q.answers === 'string' ? q.answers : JSON.stringify(q.answers),
      correctAnswer: q.correct_answer,
    }));

    const culture = cultureData.map((c) => ({
      title: c.title || c.name || 'Untitled',
      description: c.description || '',
      imageUrl: c.image_url || c.imageUrl || null,
      category: c.category || 'general',
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
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@mongolhistory.com',
        password: 'admin123456',
        role: 'admin',
      });
      console.log('   ✅ Default admin user created (admin@mongolhistory.com / admin123456)');
    }

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
