/**
 * Seed Script - Run once to set up initial data
 * Usage: node seed.js
 * Make sure MONGO_URI is set in .env
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Category = require('./models/Category');
const Post = require('./models/Post');

const categories = [
  { name: 'Nutrition', description: 'Healthy eating, diets, superfoods, and meal planning.', color: '#10b981' },
  { name: 'Fitness', description: 'Workouts, exercise tips, strength training, and cardio.', color: '#3b82f6' },
  { name: 'Mental Health', description: 'Stress management, mindfulness, anxiety, and well-being.', color: '#8b5cf6' },
  { name: 'Lifestyle', description: 'Healthy habits, sleep, productivity, and work-life balance.', color: '#f59e0b' },
  { name: 'Weight Management', description: 'Healthy weight loss and maintenance strategies.', color: '#ef4444' },
  { name: 'Preventive Health', description: 'Disease prevention, screenings, and proactive health.', color: '#06b6d4' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@healthblog.com' });
    let admin;
    if (!adminExists) {
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@healthblog.com',
        password: 'Admin@123',
        role: 'admin',
        bio: 'Platform administrator and health content curator.'
      });
      console.log('✅ Admin user created: admin@healthblog.com / Admin@123');
    } else {
      admin = adminExists;
      console.log('ℹ️  Admin user already exists');
    }

    // Create categories
    const createdCats = [];
    for (const cat of categories) {
      const existing = await Category.findOne({ name: cat.name });
      if (!existing) {
        const created = await Category.create(cat);
        createdCats.push(created);
        console.log(`✅ Category created: ${cat.name}`);
      } else {
        createdCats.push(existing);
      }
    }

    // Create sample posts
    const samplePosts = [
      {
        title: '10 Science-Backed Nutrition Tips for Optimal Health',
        content: `<h2>The Foundation of Good Nutrition</h2>
<p>Good nutrition is the cornerstone of a healthy life. But with so much conflicting information out there, it can be hard to know what to believe. Here are 10 evidence-backed nutrition tips that will help you build a healthier relationship with food.</p>
<h2>1. Eat a Rainbow of Vegetables</h2>
<p>Different colored vegetables contain different phytonutrients. Aim to include at least 5 different colored vegetables in your daily meals. Each color represents a unique set of antioxidants and vitamins.</p>
<h2>2. Prioritize Protein at Every Meal</h2>
<p>Protein is essential for muscle repair, immune function, and satiety. Including quality protein sources like lean meats, legumes, eggs, or dairy at every meal helps maintain stable blood sugar levels.</p>
<h2>3. Don't Fear Healthy Fats</h2>
<p>Avocados, nuts, olive oil, and fatty fish are packed with omega-3 fatty acids and monounsaturated fats that support brain health, hormone production, and cardiovascular health.</p>
<blockquote><strong>Pro Tip:</strong> Focus on food quality, not just calories. Whole, minimally processed foods should form the base of your diet.</blockquote>
<h2>4. Stay Hydrated</h2>
<p>Water makes up about 60% of your body. Drinking adequate water (typically 2-3 liters daily) supports metabolism, digestion, and cognitive function.</p>`,
        excerpt: 'Discover the 10 evidence-based nutrition strategies that leading health experts recommend for optimal health and longevity.',
        status: 'published',
        featured: true,
        tags: ['nutrition', 'healthy eating', 'diet tips']
      },
      {
        title: 'The Complete Guide to Starting a Fitness Routine',
        content: `<h2>Why Starting Matters More Than Being Perfect</h2>
<p>One of the biggest barriers to fitness is the idea that you need to have the perfect plan before you start. The truth is that starting imperfectly is infinitely better than not starting at all.</p>
<h2>Week 1-2: Build the Foundation</h2>
<p>Begin with 3 days per week of 20-30 minute sessions. Focus on bodyweight exercises: push-ups, squats, lunges, and planks. These compound movements work multiple muscle groups and are ideal for beginners.</p>
<h2>Week 3-4: Add Intensity</h2>
<p>Once you're comfortable with the basics, start adding resistance. This could mean using dumbbells, resistance bands, or increasing reps and sets.</p>
<blockquote>The best workout is the one you'll actually do consistently. Don't let perfect be the enemy of good.</blockquote>
<h2>The Role of Rest and Recovery</h2>
<p>Muscles grow during rest, not during exercise. Ensure you're getting 7-9 hours of sleep and taking at least 1-2 rest days per week.</p>`,
        excerpt: 'Everything you need to know to build a sustainable fitness routine from scratch, backed by exercise science.',
        status: 'published',
        featured: true,
        tags: ['fitness', 'exercise', 'beginners', 'workout']
      },
      {
        title: '5 Mindfulness Practices to Reduce Stress Today',
        content: `<h2>The Science Behind Mindfulness</h2>
<p>Mindfulness is no longer just a spiritual practice—it's backed by decades of neuroscience research. Regular mindfulness practice has been shown to reduce cortisol levels, lower blood pressure, and improve emotional regulation.</p>
<h2>1. Box Breathing (4-4-4-4)</h2>
<p>Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 4-8 times. This technique is used by Navy SEALs and elite athletes to manage stress in high-pressure situations.</p>
<h2>2. Body Scan Meditation</h2>
<p>Lie down or sit comfortably and mentally scan from head to toe, noticing sensations without judgment. This practice helps release physical tension and improves mind-body awareness.</p>
<h2>3. Gratitude Journaling</h2>
<p>Writing 3 specific things you're grateful for each day rewires the brain toward positivity over time. Research shows this practice can significantly improve subjective wellbeing.</p>`,
        excerpt: 'Practical mindfulness techniques backed by neuroscience that you can start using today to manage stress and improve mental clarity.',
        status: 'published',
        featured: false,
        tags: ['mental health', 'mindfulness', 'stress', 'meditation']
      }
    ];

    for (let i = 0; i < samplePosts.length; i++) {
      const postData = samplePosts[i];
      const existing = await Post.findOne({ title: postData.title });
      if (!existing) {
        await Post.create({
          ...postData,
          author: admin._id,
          category: createdCats[i]._id
        });
        console.log(`✅ Post created: ${postData.title.substring(0, 40)}...`);
      }
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('📧 Admin login: admin@healthblog.com');
    console.log('🔑 Admin password: Admin@123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
