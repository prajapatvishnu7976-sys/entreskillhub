// ============================================
// EntreSkillHub - Database Seeder (v2)
// Populates DB with Skills, Ideas, Roadmaps, Mentors, Resources
// ============================================

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Skill = require('../models/Skill');
const BusinessIdea = require('../models/BusinessIdea');
const Roadmap = require('../models/Roadmap');
const LearningResource = require('../models/LearningResource');
const Mentor = require('../models/Mentor');

// ============================================
// SKILLS DATA (12 skills)
// ============================================
const skillsData = [
  {
    name: 'Baking & Pastry',
    description: 'The art and science of creating delicious baked goods including cakes, pastries, breads, and desserts. Perfect for starting a home bakery business.',
    shortDescription: 'Master the art of baking cakes, breads, and pastries',
    category: 'Food & Catering',
    subCategory: 'Bakery',
    icon: '🧁',
    color: '#f97316',
    difficultyLevel: 'beginner',
    tags: ['baking', 'pastry', 'cake', 'bread', 'home business'],
    businessPotential: { score: 9, demand: 'high', marketSize: 'local', seasonality: 'year_round' },
    earningPotential: { monthly: { min: 15000, max: 100000 } },
    targetAudience: ['women', 'housewives', 'youth'],
    isFeatured: true,
    isTrending: true,
    popularity: 850,
  },
  {
    name: 'Digital Marketing',
    description: 'Learn social media marketing, SEO, content creation, email marketing, and paid advertising. High-demand skill for the digital economy.',
    shortDescription: 'Master social media, SEO, and online advertising',
    category: 'Digital & IT Skills',
    subCategory: 'Marketing',
    icon: '📱',
    color: '#3b82f6',
    difficultyLevel: 'intermediate',
    tags: ['digital marketing', 'social media', 'seo', 'content', 'ads'],
    businessPotential: { score: 10, demand: 'very_high', marketSize: 'international', seasonality: 'year_round' },
    earningPotential: { monthly: { min: 25000, max: 200000 } },
    targetAudience: ['youth', 'students'],
    isFeatured: true,
    isTrending: true,
    popularity: 1200,
  },
  {
    name: 'Photography',
    description: 'Capture stunning photos with professional techniques. From weddings to product photography, this skill opens multiple business avenues.',
    shortDescription: 'Professional photography for events and products',
    category: 'Photography & Videography',
    icon: '📸',
    color: '#8b5cf6',
    difficultyLevel: 'intermediate',
    tags: ['photography', 'wedding', 'product', 'portrait'],
    businessPotential: { score: 8, demand: 'high', marketSize: 'regional' },
    earningPotential: { monthly: { min: 20000, max: 150000 } },
    isFeatured: true,
    popularity: 720,
  },
  {
    name: 'Tailoring & Fashion Design',
    description: 'Create custom clothing, alterations, and fashion pieces. A timeless skill with steady demand and multiple business opportunities.',
    shortDescription: 'Design and create custom clothing',
    category: 'Tailoring & Fashion',
    icon: '✂️',
    color: '#ec4899',
    difficultyLevel: 'beginner',
    tags: ['tailoring', 'fashion', 'stitching', 'design'],
    businessPotential: { score: 8, demand: 'high', marketSize: 'local' },
    earningPotential: { monthly: { min: 12000, max: 80000 } },
    targetAudience: ['women'],
    isTrending: true,
    popularity: 680,
  },
  {
    name: 'Content Writing',
    description: 'Write engaging content for blogs, websites, social media, and marketing materials. Great for remote work and freelancing.',
    shortDescription: 'Create engaging content for websites and blogs',
    category: 'Writing & Content',
    icon: '✍️',
    color: '#f59e0b',
    difficultyLevel: 'beginner',
    tags: ['writing', 'content', 'blog', 'copywriting'],
    businessPotential: { score: 9, demand: 'very_high', marketSize: 'international' },
    earningPotential: { monthly: { min: 15000, max: 150000 } },
    isFeatured: true,
    popularity: 890,
  },
  {
    name: 'Web Development',
    description: 'Build websites and web applications using HTML, CSS, JavaScript, and modern frameworks. High-demand tech skill.',
    shortDescription: 'Build modern websites and web applications',
    category: 'Digital & IT Skills',
    icon: '💻',
    color: '#06b6d4',
    difficultyLevel: 'intermediate',
    tags: ['coding', 'web', 'html', 'css', 'javascript'],
    businessPotential: { score: 10, demand: 'very_high', marketSize: 'international' },
    earningPotential: { monthly: { min: 30000, max: 300000 } },
    isFeatured: true,
    isTrending: true,
    popularity: 1500,
  },
  {
    name: 'Beauty & Makeup',
    description: 'Professional makeup artistry for weddings, events, and photoshoots. Includes skincare and beauty consulting.',
    shortDescription: 'Professional makeup and beauty services',
    category: 'Beauty & Wellness',
    icon: '💄',
    color: '#ec4899',
    difficultyLevel: 'beginner',
    tags: ['makeup', 'beauty', 'skincare', 'bridal'],
    businessPotential: { score: 8, demand: 'high' },
    earningPotential: { monthly: { min: 18000, max: 120000 } },
    targetAudience: ['women'],
    popularity: 640,
  },
  {
    name: 'Handmade Crafts',
    description: 'Create beautiful handmade products - jewelry, home decor, gifts. Perfect for online sales through Etsy, Amazon Handmade.',
    shortDescription: 'Create and sell unique handmade products',
    category: 'Handicrafts & Artisan',
    icon: '🎨',
    color: '#a855f7',
    difficultyLevel: 'beginner',
    tags: ['crafts', 'handmade', 'diy', 'jewelry'],
    businessPotential: { score: 7, demand: 'medium' },
    earningPotential: { monthly: { min: 8000, max: 60000 } },
    popularity: 520,
  },
  {
    name: 'Fitness Training',
    description: 'Become a certified fitness trainer offering personal training, group classes, or online coaching programs.',
    shortDescription: 'Personal training and fitness coaching',
    category: 'Fitness & Sports',
    icon: '💪',
    color: '#ef4444',
    difficultyLevel: 'intermediate',
    tags: ['fitness', 'training', 'yoga', 'health'],
    businessPotential: { score: 8, demand: 'high' },
    earningPotential: { monthly: { min: 20000, max: 150000 } },
    popularity: 580,
  },
  {
    name: 'Cooking & Catering',
    description: 'Professional cooking skills for catering services, tiffin services, or restaurant business.',
    shortDescription: 'Professional cooking for catering business',
    category: 'Food & Catering',
    icon: '🍳',
    color: '#f97316',
    difficultyLevel: 'beginner',
    tags: ['cooking', 'catering', 'tiffin', 'food'],
    businessPotential: { score: 9, demand: 'high' },
    earningPotential: { monthly: { min: 20000, max: 200000 } },
    isTrending: true,
    popularity: 780,
  },
  {
    name: 'Graphic Design',
    description: 'Create logos, branding, marketing materials, and digital assets using tools like Photoshop, Illustrator, and Canva.',
    shortDescription: 'Design logos, branding and marketing materials',
    category: 'Digital & IT Skills',
    icon: '🎨',
    color: '#8b5cf6',
    difficultyLevel: 'intermediate',
    tags: ['design', 'graphic', 'logo', 'branding'],
    businessPotential: { score: 9, demand: 'very_high' },
    earningPotential: { monthly: { min: 20000, max: 180000 } },
    isFeatured: true,
    popularity: 950,
  },
  {
    name: 'Tutoring & Teaching',
    description: 'Teach students academic subjects, languages, or skills online or offline. High demand for quality educators.',
    shortDescription: 'Teach students online or offline',
    category: 'Tutoring & Education',
    icon: '📚',
    color: '#10b981',
    difficultyLevel: 'beginner',
    tags: ['teaching', 'tutoring', 'education', 'online'],
    businessPotential: { score: 9, demand: 'high' },
    earningPotential: { monthly: { min: 15000, max: 120000 } },
    popularity: 690,
  },
];

// ============================================
// BUSINESS IDEAS (15 ideas)
// ============================================
const businessIdeasData = [
  {
    title: 'Home Bakery Business',
    tagline: 'Sweet success from your kitchen',
    description: 'Start a home-based bakery specializing in custom cakes, cookies, and pastries. With low startup costs and high margins, this business is perfect for baking enthusiasts.',
    shortDescription: 'Start a profitable home bakery specializing in custom cakes and pastries',
    category: 'Food Business',
    icon: '🧁',
    tags: ['home business', 'baking', 'food', 'low investment'],
    investment: { minimum: 15000, maximum: 50000, breakdown: [
      { item: 'Basic Oven', cost: 15000, isOneTime: true },
      { item: 'Baking Tools & Utensils', cost: 8000, isOneTime: true },
      { item: 'Initial Ingredients', cost: 5000, isOneTime: false },
      { item: 'Packaging Materials', cost: 3000, isOneTime: false },
      { item: 'Marketing & Photography', cost: 5000, isOneTime: false },
    ]},
    revenue: { monthly: { min: 20000, max: 80000, realistic: 40000 }, profitMargin: 60, breakEvenTime: { months: 3 }},
    difficulty: 'easy',
    timeToStart: { duration: 30, unit: 'days' },
    isFeatured: true, isTrending: true, isBeginnerFriendly: true, isLowInvestment: true,
  },
  {
    title: 'Digital Marketing Agency',
    tagline: 'Grow businesses in the digital age',
    description: 'Start a digital marketing agency helping small businesses grow their online presence. Offer services like social media management, SEO, content marketing, and paid advertising.',
    shortDescription: 'Help businesses grow online with SEO, social media, and content marketing',
    category: 'Online Business',
    icon: '📱',
    tags: ['digital', 'marketing', 'agency', 'high growth'],
    investment: { minimum: 25000, maximum: 100000 },
    revenue: { monthly: { min: 50000, max: 300000, realistic: 100000 }, profitMargin: 70 },
    difficulty: 'medium',
    timeToStart: { duration: 45, unit: 'days' },
    isFeatured: true, isTrending: true,
  },
  {
    title: 'Tiffin Service Business',
    tagline: 'Homemade meals delivered fresh',
    description: 'Provide healthy, homemade meals to working professionals, students, and bachelors. Focus on quality, hygiene, and variety.',
    shortDescription: 'Deliver homemade meals to working professionals',
    category: 'Food Business',
    icon: '🍱',
    tags: ['tiffin', 'food delivery', 'daily income'],
    investment: { minimum: 20000, maximum: 60000 },
    revenue: { monthly: { min: 30000, max: 100000, realistic: 60000 }, profitMargin: 40 },
    difficulty: 'easy',
    isBeginnerFriendly: true, isLowInvestment: true,
  },
  {
    title: 'Freelance Web Development',
    tagline: 'Code your way to freedom',
    description: 'Build websites and web applications for clients globally. Start with small projects on Fiverr and Upwork.',
    shortDescription: 'Build websites and applications for clients worldwide',
    category: 'Freelancing',
    icon: '💻',
    tags: ['coding', 'web development', 'freelance', 'high income'],
    investment: { minimum: 30000, maximum: 80000 },
    revenue: { monthly: { min: 50000, max: 500000, realistic: 150000 }, profitMargin: 85 },
    difficulty: 'hard',
    isFeatured: true,
  },
  {
    title: 'Custom Tailoring Boutique',
    tagline: 'Fashion designed for you',
    description: 'Open a boutique offering custom stitching and design services. Focus on ethnic wear, bridal outfits.',
    shortDescription: 'Custom stitching for ethnic and wedding wear',
    category: 'Product Business',
    icon: '✂️',
    tags: ['tailoring', 'fashion', 'boutique', 'women'],
    investment: { minimum: 30000, maximum: 100000 },
    revenue: { monthly: { min: 25000, max: 100000, realistic: 45000 }, profitMargin: 50 },
    difficulty: 'easy',
    isBeginnerFriendly: true,
  },
  {
    title: 'Wedding Photography Business',
    tagline: 'Capture memories that last forever',
    description: 'Start a wedding and event photography business. High-demand niche with excellent income potential.',
    shortDescription: 'Wedding, event, and portrait photography',
    category: 'Creative Business',
    icon: '📸',
    tags: ['photography', 'wedding', 'events', 'creative'],
    investment: { minimum: 80000, maximum: 300000 },
    revenue: { monthly: { min: 40000, max: 300000, realistic: 100000 }, profitMargin: 70 },
    difficulty: 'medium',
    isFeatured: true,
  },
  {
    title: 'Online Tutoring Business',
    tagline: 'Teach and earn from anywhere',
    description: 'Teach students online through platforms like Zoom. Specialize in specific subjects or competitive exams.',
    shortDescription: 'Teach students online in your area of expertise',
    category: 'Educational Service',
    icon: '📚',
    tags: ['tutoring', 'online', 'education', 'flexible'],
    investment: { minimum: 5000, maximum: 30000 },
    revenue: { monthly: { min: 20000, max: 100000, realistic: 40000 }, profitMargin: 90 },
    difficulty: 'very_easy',
    isBeginnerFriendly: true, isLowInvestment: true,
  },
  {
    title: 'Handmade Jewelry Business',
    tagline: 'Wear your creativity',
    description: 'Design and sell unique handmade jewelry through Instagram, Etsy, and local exhibitions.',
    shortDescription: 'Design and sell unique handmade jewelry online',
    category: 'Creative Business',
    icon: '💎',
    tags: ['handmade', 'jewelry', 'creative', 'online'],
    investment: { minimum: 8000, maximum: 25000 },
    revenue: { monthly: { min: 10000, max: 60000, realistic: 25000 }, profitMargin: 55 },
    difficulty: 'easy',
    isBeginnerFriendly: true, isLowInvestment: true,
  },
  {
    title: 'Beauty Salon at Home',
    tagline: 'Bring beauty to their doorstep',
    description: 'Offer home-based beauty services including makeup, hair styling, and skincare.',
    shortDescription: 'Home-based makeup and beauty services',
    category: 'Service Business',
    icon: '💄',
    tags: ['beauty', 'makeup', 'salon', 'home service'],
    investment: { minimum: 20000, maximum: 60000 },
    revenue: { monthly: { min: 20000, max: 80000, realistic: 40000 } },
    difficulty: 'easy',
    isBeginnerFriendly: true,
  },
  {
    title: 'Content Writing Agency',
    tagline: 'Words that convert',
    description: 'Provide high-quality content writing services for blogs, websites, and marketing materials.',
    shortDescription: 'Professional content writing for businesses',
    category: 'Freelancing',
    icon: '✍️',
    tags: ['writing', 'content', 'freelance', 'remote'],
    investment: { minimum: 10000, maximum: 30000 },
    revenue: { monthly: { min: 25000, max: 150000, realistic: 60000 }, profitMargin: 90 },
    difficulty: 'easy',
    isBeginnerFriendly: true, isLowInvestment: true, isFeatured: true,
  },
  {
    title: 'Fitness Coaching Online',
    tagline: 'Transform lives, transform yours',
    description: 'Offer online fitness training and nutrition coaching. Scale with pre-recorded courses.',
    shortDescription: 'Online fitness training and coaching programs',
    category: 'Health & Wellness',
    icon: '💪',
    tags: ['fitness', 'coaching', 'online', 'wellness'],
    investment: { minimum: 15000, maximum: 50000 },
    revenue: { monthly: { min: 30000, max: 200000, realistic: 60000 }, profitMargin: 85 },
    difficulty: 'medium',
    isTrending: true,
  },
  {
    title: 'Graphic Design Studio',
    tagline: 'Visualize your ideas',
    description: 'Provide design services for logos, branding, marketing materials, and social media graphics.',
    shortDescription: 'Logo, branding, and marketing design services',
    category: 'Creative Business',
    icon: '🎨',
    tags: ['design', 'graphics', 'branding', 'creative'],
    investment: { minimum: 40000, maximum: 100000 },
    revenue: { monthly: { min: 40000, max: 200000, realistic: 80000 }, profitMargin: 80 },
    difficulty: 'medium',
    isFeatured: true,
  },
  {
    title: 'Cloud Kitchen Business',
    tagline: 'Restaurant without the overhead',
    description: 'Start a cloud kitchen serving through Swiggy, Zomato, and direct orders.',
    shortDescription: 'Delivery-only restaurant serving specific cuisine',
    category: 'Food Business',
    icon: '🍔',
    tags: ['cloud kitchen', 'food delivery', 'restaurant', 'online'],
    investment: { minimum: 100000, maximum: 300000 },
    revenue: { monthly: { min: 80000, max: 500000, realistic: 150000 }, profitMargin: 35 },
    difficulty: 'hard',
    isTrending: true,
  },
  {
    title: 'YouTube Channel',
    tagline: 'Create content, build community',
    description: 'Start a YouTube channel around your passion. Monetize through ads, sponsorships, and product sales.',
    shortDescription: 'Create video content and monetize through YouTube',
    category: 'Online Business',
    icon: '📹',
    tags: ['youtube', 'content creation', 'video', 'online'],
    investment: { minimum: 20000, maximum: 100000 },
    revenue: { monthly: { min: 10000, max: 500000, realistic: 50000 }, profitMargin: 80 },
    difficulty: 'medium',
    isTrending: true,
  },
  {
    title: 'Handmade Soap & Candle Business',
    tagline: 'Natural products, healthy living',
    description: 'Create organic soaps, candles, and skincare products. Market through Instagram and exhibitions.',
    shortDescription: 'Handmade organic soaps and candles',
    category: 'Product Business',
    icon: '🕯️',
    tags: ['handmade', 'organic', 'natural', 'skincare'],
    investment: { minimum: 15000, maximum: 50000 },
    revenue: { monthly: { min: 15000, max: 80000, realistic: 30000 }, profitMargin: 55 },
    difficulty: 'easy',
    isBeginnerFriendly: true, isLowInvestment: true,
  },
];

// ============================================
// MENTORS DATA (10 mentors with user accounts)
// ============================================
const mentorsData = [
  {
    user: {
      name: 'Priya Sharma',
      email: 'priya.sharma@entreskillhub.com',
      profileImage: { url: 'https://i.pravatar.cc/300?img=48', publicId: null },
    },
    mentor: {
      title: 'Home Bakery Expert & Business Coach',
      tagline: 'Helping bakers turn passion into 7-figure businesses',
      professionalBio: 'With 12+ years of experience running my own successful home bakery empire, I have helped over 200 aspiring bakers launch and scale their businesses. From my humble start in a 10x10 kitchen to owning 3 bakery outlets, I bring practical insights and proven strategies. I specialize in helping women entrepreneurs balance family and business.',
      shortBio: 'Bakery entrepreneur with 12+ years experience',
      totalExperience: 12,
      expertise: [
        { area: 'Baking Business Setup', yearsOfExperience: 12, proficiencyLevel: 'expert' },
        { area: 'Product Pricing & Marketing', yearsOfExperience: 8, proficiencyLevel: 'expert' },
        { area: 'Social Media for Food Business', yearsOfExperience: 6, proficiencyLevel: 'advanced' },
      ],
      expertiseCategories: ['Food & Catering', 'Marketing', 'Business Strategy'],
      industries: ['Food & Beverage', 'Retail'],
      specializations: ['Cake Design', 'Instagram Marketing', 'Order Management'],
      workExperience: [
        {
          company: 'Priyas Cake Studio',
          position: 'Founder & CEO',
          startDate: new Date('2014-01-01'),
          isCurrent: true,
          description: 'Built and scaled a home bakery to 3 outlets with 20+ employees',
        },
      ],
      education: [
        { degree: 'Advanced Diploma in Pastry Arts', field: 'Culinary Arts', institution: 'IHM Mumbai', yearOfCompletion: 2013 },
      ],
      certifications: [
        { name: 'FSSAI Certified', issuingOrganization: 'FSSAI India' },
        { name: 'Le Cordon Bleu Basic Patisserie', issuingOrganization: 'Le Cordon Bleu' },
      ],
      mentorshipTypes: ['one_on_one', 'q_and_a', 'strategy_session'],
      mentorshipMode: ['online', 'in_person'],
      mentorshipStyle: 'coaching',
      preferredMenteeLevel: ['beginner', 'intermediate'],
      languages: [
        { language: 'English', proficiency: 'fluent' },
        { language: 'Hindi', proficiency: 'native' },
        { language: 'Marathi', proficiency: 'fluent' },
      ],
      location: { country: 'India', state: 'Maharashtra', city: 'Mumbai', isRemote: true },
      availability: {
        isAvailable: true,
        workingDays: [
          { day: 'monday', slots: [{ startTime: '10:00', endTime: '18:00' }] },
          { day: 'tuesday', slots: [{ startTime: '10:00', endTime: '18:00' }] },
          { day: 'wednesday', slots: [{ startTime: '10:00', endTime: '18:00' }] },
          { day: 'thursday', slots: [{ startTime: '10:00', endTime: '18:00' }] },
          { day: 'friday', slots: [{ startTime: '10:00', endTime: '18:00' }] },
        ],
        timezone: 'Asia/Kolkata',
        responseTime: 'within_hour',
        maxSessionsPerWeek: 15,
      },
      pricing: {
        sessionRates: [
          { duration: 30, price: 999, type: 'individual' },
          { duration: 60, price: 1799, type: 'individual' },
        ],
        firstSessionFree: true,
        currency: 'INR',
      },
      isFeatured: true,
      isTopMentor: true,
      mentorLevel: 'expert',
      stats: {
        totalSessions: 285,
        completedSessions: 275,
        totalMentees: 187,
        totalHours: 320,
        totalEarnings: 285000,
        responseRate: 98,
        profileViews: 3200,
        profileCompletion: 95,
      },
      rating: {
        average: 4.9,
        total: 156,
        distribution: { five: 140, four: 12, three: 3, two: 1, one: 0 },
      },
    },
  },
  {
    user: {
      name: 'Rahul Verma',
      email: 'rahul.verma@entreskillhub.com',
      profileImage: { url: 'https://i.pravatar.cc/300?img=12', publicId: null },
    },
    mentor: {
      title: 'Digital Marketing Expert & Growth Hacker',
      tagline: 'Scaling businesses from 0 to 10Cr with digital marketing',
      professionalBio: 'Former Head of Marketing at 3 unicorns. I have generated over 500Cr in revenue through digital marketing for various brands. Now helping small businesses and startups master SEO, social media, and paid ads. My frameworks have been featured in Forbes and YourStory.',
      shortBio: 'Ex-Unicorn Marketing Head, Growth Hacker',
      totalExperience: 15,
      expertise: [
        { area: 'Facebook & Google Ads', yearsOfExperience: 12, proficiencyLevel: 'expert' },
        { area: 'SEO & Content Marketing', yearsOfExperience: 10, proficiencyLevel: 'expert' },
        { area: 'Growth Hacking', yearsOfExperience: 8, proficiencyLevel: 'expert' },
      ],
      expertiseCategories: ['Marketing', 'Digital & IT Skills', 'Business Strategy'],
      industries: ['E-commerce', 'SaaS', 'Retail'],
      specializations: ['Performance Marketing', 'Brand Strategy', 'Analytics'],
      workExperience: [
        {
          company: 'Growth Ninja Consulting',
          position: 'Founder',
          startDate: new Date('2020-06-01'),
          isCurrent: true,
        },
      ],
      education: [
        { degree: 'MBA in Marketing', field: 'Marketing', institution: 'IIM Bangalore', yearOfCompletion: 2010 },
      ],
      certifications: [
        { name: 'Google Ads Certified', issuingOrganization: 'Google' },
        { name: 'Facebook Blueprint Certified', issuingOrganization: 'Meta' },
      ],
      mentorshipTypes: ['one_on_one', 'strategy_session', 'workshop'],
      mentorshipMode: ['online'],
      languages: [
        { language: 'English', proficiency: 'native' },
        { language: 'Hindi', proficiency: 'native' },
      ],
      location: { country: 'India', state: 'Karnataka', city: 'Bangalore', isRemote: true },
      availability: {
        isAvailable: true,
        workingDays: [
          { day: 'monday', slots: [{ startTime: '18:00', endTime: '22:00' }] },
          { day: 'wednesday', slots: [{ startTime: '18:00', endTime: '22:00' }] },
          { day: 'friday', slots: [{ startTime: '18:00', endTime: '22:00' }] },
          { day: 'saturday', slots: [{ startTime: '10:00', endTime: '18:00' }] },
        ],
        timezone: 'Asia/Kolkata',
        maxSessionsPerWeek: 10,
      },
      pricing: {
        sessionRates: [
          { duration: 60, price: 2999, type: 'individual' },
          { duration: 90, price: 4499, type: 'individual' },
        ],
        currency: 'INR',
      },
      isFeatured: true,
      isTopMentor: true,
      mentorLevel: 'master',
      stats: {
        totalSessions: 450, completedSessions: 435, totalMentees: 267,
        totalHours: 520, totalEarnings: 850000, responseRate: 95,
        profileViews: 5600, profileCompletion: 98,
      },
      rating: { average: 4.8, total: 234, distribution: { five: 205, four: 20, three: 6, two: 2, one: 1 } },
    },
  },
  {
    user: {
      name: 'Anita Reddy',
      email: 'anita.reddy@entreskillhub.com',
      profileImage: { url: 'https://i.pravatar.cc/300?img=45', publicId: null },
    },
    mentor: {
      title: 'Fashion Boutique Owner & Business Consultant',
      tagline: 'From home tailoring to fashion empire',
      professionalBio: 'I started my journey as a home tailor 15 years ago and built a successful fashion boutique chain with 5 outlets across South India. I mentor aspiring fashion entrepreneurs and help them navigate everything from design to distribution. Featured in Vogue India.',
      shortBio: '15 years in fashion, boutique chain owner',
      totalExperience: 15,
      expertise: [
        { area: 'Fashion Business Setup', yearsOfExperience: 15, proficiencyLevel: 'expert' },
        { area: 'Ethnic Wear Design', yearsOfExperience: 12, proficiencyLevel: 'expert' },
      ],
      expertiseCategories: ['Tailoring & Fashion', 'Business Strategy', 'Marketing'],
      industries: ['Fashion', 'Retail'],
      workExperience: [
        { company: 'Anitas Fashion Studio', position: 'Founder & Creative Director', startDate: new Date('2010-03-01'), isCurrent: true },
      ],
      education: [
        { degree: 'B.Sc Fashion Design', field: 'Fashion', institution: 'NIFT Bangalore', yearOfCompletion: 2008 },
      ],
      mentorshipTypes: ['one_on_one', 'group_session'],
      mentorshipMode: ['online', 'in_person'],
      languages: [
        { language: 'English', proficiency: 'fluent' },
        { language: 'Hindi', proficiency: 'fluent' },
        { language: 'Telugu', proficiency: 'native' },
        { language: 'Tamil', proficiency: 'conversational' },
      ],
      location: { country: 'India', state: 'Telangana', city: 'Hyderabad', isRemote: true },
      availability: { isAvailable: true, timezone: 'Asia/Kolkata', maxSessionsPerWeek: 12 },
      pricing: {
        sessionRates: [{ duration: 60, price: 1499, type: 'individual' }],
        firstSessionFree: true,
        currency: 'INR',
      },
      isFeatured: true,
      mentorLevel: 'senior',
      stats: { totalSessions: 156, completedSessions: 148, totalMentees: 89, totalHours: 175, totalEarnings: 195000, profileCompletion: 92 },
      rating: { average: 4.7, total: 78, distribution: { five: 62, four: 12, three: 3, two: 1, one: 0 } },
    },
  },
  {
    user: {
      name: 'Vikas Mehta',
      email: 'vikas.mehta@entreskillhub.com',
      profileImage: { url: 'https://i.pravatar.cc/300?img=33', publicId: null },
    },
    mentor: {
      title: 'Serial Tech Entrepreneur & Web Dev Coach',
      tagline: 'Helping developers become entrepreneurs',
      professionalBio: 'Built and sold 3 tech startups. Currently CTO advisor for 10+ companies. I help developers transition from freelancing to running their own agencies. Full-stack expert with 15 years in the trenches.',
      shortBio: 'Serial entrepreneur, CTO advisor',
      totalExperience: 15,
      expertise: [
        { area: 'Web Development', yearsOfExperience: 15, proficiencyLevel: 'expert' },
        { area: 'Startup Fundraising', yearsOfExperience: 8, proficiencyLevel: 'expert' },
      ],
      expertiseCategories: ['Digital & IT Skills', 'Business Strategy'],
      industries: ['Technology', 'SaaS'],
      workExperience: [
        { company: 'TechAdvisor Ventures', position: 'Founder', startDate: new Date('2019-01-01'), isCurrent: true },
      ],
      education: [
        { degree: 'B.Tech Computer Science', field: 'Computer Science', institution: 'IIT Delhi', yearOfCompletion: 2008 },
      ],
      mentorshipTypes: ['one_on_one', 'code_review', 'strategy_session'],
      mentorshipMode: ['online'],
      languages: [
        { language: 'English', proficiency: 'fluent' },
        { language: 'Hindi', proficiency: 'native' },
      ],
      location: { country: 'India', state: 'Delhi', city: 'New Delhi', isRemote: true },
      availability: { isAvailable: true, timezone: 'Asia/Kolkata', maxSessionsPerWeek: 8 },
      pricing: {
        sessionRates: [{ duration: 60, price: 3999, type: 'individual' }],
        currency: 'INR',
      },
      isTopMentor: true,
      mentorLevel: 'master',
      stats: { totalSessions: 380, completedSessions: 372, totalMentees: 198, totalHours: 425, totalEarnings: 1250000, profileCompletion: 100 },
      rating: { average: 4.9, total: 189, distribution: { five: 175, four: 10, three: 3, two: 1, one: 0 } },
    },
  },
  {
    user: {
      name: 'Sneha Iyer',
      email: 'sneha.iyer@entreskillhub.com',
      profileImage: { url: 'https://i.pravatar.cc/300?img=44', publicId: null },
    },
    mentor: {
      title: 'Content Writing Expert & Freelance Coach',
      tagline: 'Earn 6-figures from content writing',
      professionalBio: 'From 5000/month to 5L/month as a content writer. I have written for 200+ brands including Zomato, Swiggy, and Byjus. I teach my proven system to help writers build sustainable freelance businesses.',
      shortBio: 'Top content writer, freelance coach',
      totalExperience: 10,
      expertise: [
        { area: 'Content Writing', yearsOfExperience: 10, proficiencyLevel: 'expert' },
        { area: 'Freelancing on Upwork/Fiverr', yearsOfExperience: 8, proficiencyLevel: 'expert' },
      ],
      expertiseCategories: ['Writing & Content', 'Digital & IT Skills'],
      workExperience: [
        { company: 'Write & Earn Academy', position: 'Founder', startDate: new Date('2018-05-01'), isCurrent: true },
      ],
      education: [{ degree: 'Masters in English Literature', institution: 'Delhi University', yearOfCompletion: 2013 }],
      mentorshipTypes: ['one_on_one', 'group_session', 'q_and_a'],
      mentorshipMode: ['online'],
      languages: [
        { language: 'English', proficiency: 'native' },
        { language: 'Hindi', proficiency: 'fluent' },
        { language: 'Tamil', proficiency: 'native' },
      ],
      location: { country: 'India', state: 'Tamil Nadu', city: 'Chennai', isRemote: true },
      availability: { isAvailable: true, timezone: 'Asia/Kolkata', maxSessionsPerWeek: 15 },
      pricing: {
        sessionRates: [{ duration: 45, price: 799, type: 'individual' }],
        firstSessionFree: true,
        currency: 'INR',
      },
      isFeatured: true,
      mentorLevel: 'senior',
      stats: { totalSessions: 245, completedSessions: 238, totalMentees: 156, totalHours: 285, totalEarnings: 195000, profileCompletion: 94 },
      rating: { average: 4.8, total: 134, distribution: { five: 118, four: 12, three: 3, two: 1, one: 0 } },
    },
  },
  {
    user: {
      name: 'Karan Malhotra',
      email: 'karan.malhotra@entreskillhub.com',
      profileImage: { url: 'https://i.pravatar.cc/300?img=14', publicId: null },
    },
    mentor: {
      title: 'Wedding Photographer & Business Coach',
      tagline: 'Built a 1Cr photography business',
      professionalBio: 'From shooting for 5000 to charging 5L per wedding. I mentor photographers on building premium brands, pricing, and client acquisition. Shot 500+ weddings across India.',
      shortBio: 'Premium wedding photographer',
      totalExperience: 12,
      expertise: [
        { area: 'Wedding Photography', yearsOfExperience: 12, proficiencyLevel: 'expert' },
        { area: 'Photography Business', yearsOfExperience: 10, proficiencyLevel: 'expert' },
      ],
      expertiseCategories: ['Photography & Videography', 'Business Strategy', 'Marketing'],
      workExperience: [
        { company: 'Karan Malhotra Photography', position: 'Founder', startDate: new Date('2013-01-01'), isCurrent: true },
      ],
      education: [{ degree: 'Diploma in Photography', institution: 'Light & Life Academy', yearOfCompletion: 2012 }],
      mentorshipTypes: ['one_on_one', 'workshop'],
      mentorshipMode: ['online', 'in_person'],
      languages: [
        { language: 'English', proficiency: 'fluent' },
        { language: 'Hindi', proficiency: 'native' },
        { language: 'Punjabi', proficiency: 'native' },
      ],
      location: { country: 'India', state: 'Punjab', city: 'Chandigarh', willingToTravel: true },
      availability: { isAvailable: true, timezone: 'Asia/Kolkata', maxSessionsPerWeek: 8 },
      pricing: {
        sessionRates: [{ duration: 60, price: 2499, type: 'individual' }],
        currency: 'INR',
      },
      mentorLevel: 'expert',
      stats: { totalSessions: 178, completedSessions: 170, totalMentees: 112, totalHours: 195, totalEarnings: 425000, profileCompletion: 90 },
      rating: { average: 4.7, total: 89, distribution: { five: 72, four: 13, three: 3, two: 1, one: 0 } },
    },
  },
  {
    user: {
      name: 'Meera Nair',
      email: 'meera.nair@entreskillhub.com',
      profileImage: { url: 'https://i.pravatar.cc/300?img=47', publicId: null },
    },
    mentor: {
      title: 'Handmade Business Expert & Etsy Coach',
      tagline: 'Turn your crafts into cash on Etsy',
      professionalBio: 'Built a 6-figure business selling handmade jewelry on Etsy and Amazon. I teach crafters how to price, photograph, and market their products effectively for global audiences.',
      shortBio: 'Etsy expert, handmade business coach',
      totalExperience: 8,
      expertise: [
        { area: 'Handmade Business', yearsOfExperience: 8, proficiencyLevel: 'expert' },
        { area: 'Etsy & E-commerce', yearsOfExperience: 7, proficiencyLevel: 'expert' },
      ],
      expertiseCategories: ['Handicrafts & Artisan', 'Marketing'],
      workExperience: [
        { company: 'Meeras Handmade Studio', position: 'Founder', startDate: new Date('2016-08-01'), isCurrent: true },
      ],
      mentorshipTypes: ['one_on_one', 'group_session'],
      mentorshipMode: ['online'],
      languages: [
        { language: 'English', proficiency: 'fluent' },
        { language: 'Malayalam', proficiency: 'native' },
        { language: 'Hindi', proficiency: 'conversational' },
      ],
      location: { country: 'India', state: 'Kerala', city: 'Kochi', isRemote: true },
      availability: { isAvailable: true, timezone: 'Asia/Kolkata' },
      pricing: {
        isFree: false,
        sessionRates: [{ duration: 45, price: 599, type: 'individual' }],
        firstSessionFree: true,
        currency: 'INR',
      },
      mentorLevel: 'senior',
      stats: { totalSessions: 89, completedSessions: 85, totalMentees: 54, totalHours: 92, totalEarnings: 65000, profileCompletion: 88 },
      rating: { average: 4.6, total: 42, distribution: { five: 32, four: 8, three: 2, two: 0, one: 0 } },
    },
  },
  {
    user: {
      name: 'Ravi Krishnan',
      email: 'ravi.krishnan@entreskillhub.com',
      profileImage: { url: 'https://i.pravatar.cc/300?img=68', publicId: null },
    },
    mentor: {
      title: 'Fitness Business Expert',
      tagline: 'Building profitable online fitness empires',
      professionalBio: 'Certified fitness trainer with 50K+ online students. I run a successful online fitness coaching business earning 15L+ per month. I mentor trainers on building online courses and coaching programs.',
      shortBio: 'Online fitness business expert',
      totalExperience: 10,
      expertise: [
        { area: 'Fitness Training', yearsOfExperience: 10, proficiencyLevel: 'expert' },
        { area: 'Online Course Creation', yearsOfExperience: 5, proficiencyLevel: 'expert' },
      ],
      expertiseCategories: ['Fitness & Sports', 'Digital & IT Skills'],
      workExperience: [
        { company: 'FitPro Academy', position: 'Founder & Head Coach', startDate: new Date('2015-01-01'), isCurrent: true },
      ],
      certifications: [
        { name: 'ACE Certified Personal Trainer', issuingOrganization: 'ACE Fitness' },
      ],
      mentorshipTypes: ['one_on_one'],
      mentorshipMode: ['online'],
      languages: [
        { language: 'English', proficiency: 'fluent' },
        { language: 'Hindi', proficiency: 'fluent' },
      ],
      location: { country: 'India', state: 'Maharashtra', city: 'Pune', isRemote: true },
      availability: { isAvailable: true, timezone: 'Asia/Kolkata' },
      pricing: {
        sessionRates: [{ duration: 60, price: 1999, type: 'individual' }],
        currency: 'INR',
      },
      mentorLevel: 'senior',
      stats: { totalSessions: 134, completedSessions: 128, totalMentees: 89, totalHours: 156, totalEarnings: 265000, profileCompletion: 87 },
      rating: { average: 4.7, total: 68, distribution: { five: 55, four: 10, three: 2, two: 1, one: 0 } },
    },
  },
  {
    user: {
      name: 'Divya Menon',
      email: 'divya.menon@entreskillhub.com',
      profileImage: { url: 'https://i.pravatar.cc/300?img=41', publicId: null },
    },
    mentor: {
      title: 'Graphic Design Studio Owner',
      tagline: 'From freelance designer to design agency',
      professionalBio: 'Founded a successful design studio with 15+ designers working with brands like Nykaa, Zomato. I mentor designers on scaling from freelance to agency model.',
      shortBio: 'Design agency founder',
      totalExperience: 11,
      expertise: [
        { area: 'Graphic Design', yearsOfExperience: 11, proficiencyLevel: 'expert' },
        { area: 'Brand Identity', yearsOfExperience: 9, proficiencyLevel: 'expert' },
      ],
      expertiseCategories: ['Digital & IT Skills', 'Business Strategy'],
      workExperience: [
        { company: 'Pixel Perfect Studio', position: 'Founder & Creative Director', startDate: new Date('2014-06-01'), isCurrent: true },
      ],
      mentorshipTypes: ['one_on_one', 'workshop'],
      mentorshipMode: ['online'],
      languages: [
        { language: 'English', proficiency: 'native' },
        { language: 'Hindi', proficiency: 'fluent' },
      ],
      location: { country: 'India', state: 'Karnataka', city: 'Bangalore', isRemote: true },
      availability: { isAvailable: true, timezone: 'Asia/Kolkata' },
      pricing: {
        sessionRates: [{ duration: 60, price: 1799, type: 'individual' }],
        currency: 'INR',
      },
      isFeatured: true,
      mentorLevel: 'senior',
      stats: { totalSessions: 112, completedSessions: 108, totalMentees: 76, totalHours: 128, totalEarnings: 175000, profileCompletion: 91 },
      rating: { average: 4.8, total: 56, distribution: { five: 48, four: 6, three: 1, two: 1, one: 0 } },
    },
  },
  {
    user: {
      name: 'Amit Bhatt',
      email: 'amit.bhatt@entreskillhub.com',
      profileImage: { url: 'https://i.pravatar.cc/300?img=52', publicId: null },
    },
    mentor: {
      title: 'Cloud Kitchen & Food Business Expert',
      tagline: 'Scaling food businesses to 1Cr+ annually',
      professionalBio: 'Founded 3 cloud kitchen brands serving 10,000+ orders monthly through Swiggy & Zomato. Expert in food business economics, menu engineering, and delivery optimization.',
      shortBio: 'Cloud kitchen founder x3',
      totalExperience: 9,
      expertise: [
        { area: 'Cloud Kitchen Setup', yearsOfExperience: 6, proficiencyLevel: 'expert' },
        { area: 'Food Business Operations', yearsOfExperience: 9, proficiencyLevel: 'expert' },
      ],
      expertiseCategories: ['Food & Catering', 'Business Strategy', 'Operations'],
      workExperience: [
        { company: 'FoodTech Ventures', position: 'Founder', startDate: new Date('2018-03-01'), isCurrent: true },
      ],
      mentorshipTypes: ['one_on_one', 'strategy_session'],
      mentorshipMode: ['online'],
      languages: [
        { language: 'English', proficiency: 'fluent' },
        { language: 'Hindi', proficiency: 'native' },
        { language: 'Gujarati', proficiency: 'native' },
      ],
      location: { country: 'India', state: 'Gujarat', city: 'Ahmedabad', isRemote: true },
      availability: { isAvailable: true, timezone: 'Asia/Kolkata' },
      pricing: {
        sessionRates: [{ duration: 60, price: 2499, type: 'individual' }],
        currency: 'INR',
      },
      mentorLevel: 'expert',
      stats: { totalSessions: 145, completedSessions: 140, totalMentees: 92, totalHours: 168, totalEarnings: 345000, profileCompletion: 89 },
      rating: { average: 4.7, total: 72, distribution: { five: 58, four: 11, three: 2, two: 1, one: 0 } },
    },
  },
];

// ============================================
// LEARNING RESOURCES (12 resources)
// ============================================
const resourcesData = [
  {
    title: 'Ultimate Guide to Starting a Home Bakery',
    subtitle: 'Everything you need to know from day 1',
    description: 'A comprehensive guide covering equipment, recipes, pricing, marketing, and legal requirements for starting a home bakery business in India. Learn from case studies of successful bakers.',
    shortDescription: 'Complete step-by-step guide for home bakery startup',
    resourceType: 'guide',
    category: 'Business Basics',
    difficulty: 'beginner',
    thumbnail: { url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', publicId: null },
    author: { name: 'Priya Sharma', credentials: 'Home Bakery Expert' },
    duration: { value: 45, unit: 'minutes' },
    access: 'free',
    isFeatured: true,
    isTrending: true,
    tags: ['bakery', 'home business', 'guide'],
    keyTakeaways: [
      'Complete equipment checklist with prices',
      'How to price your baked goods for profit',
      'Marketing strategies that actually work',
      'Legal & FSSAI requirements explained',
    ],
    stats: { viewCount: 3450, completionCount: 890, likeCount: 456 },
    rating: { average: 4.8, total: 234 },
  },
  {
    title: 'Digital Marketing Masterclass',
    subtitle: 'From zero to hero in 30 days',
    description: 'Learn the complete digital marketing framework including SEO, social media, content marketing, email marketing, and paid advertising. Practical examples and case studies included.',
    shortDescription: 'Complete digital marketing course for beginners',
    resourceType: 'course',
    category: 'Marketing',
    difficulty: 'intermediate',
    thumbnail: { url: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800', publicId: null },
    author: { name: 'Rahul Verma', credentials: 'Ex-Unicorn CMO' },
    duration: { value: 12, unit: 'hours' },
    access: 'free',
    isFeatured: true,
    isTrending: true,
    tags: ['digital marketing', 'seo', 'social media'],
    keyTakeaways: [
      'Build a complete marketing funnel',
      'Master Google Ads and Facebook Ads',
      'SEO strategies that rank websites',
      'Content marketing that converts',
    ],
    stats: { viewCount: 5670, completionCount: 1230, likeCount: 890 },
    rating: { average: 4.9, total: 456 },
  },
  {
    title: 'Business Plan Template for Small Businesses',
    subtitle: 'Ready-to-use professional template',
    description: 'Professional business plan template with 20+ sections including executive summary, market analysis, financial projections, and marketing strategy. Fully customizable.',
    shortDescription: 'Professional business plan template - ready to use',
    resourceType: 'template',
    category: 'Business Basics',
    difficulty: 'beginner',
    thumbnail: { url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800', publicId: null },
    author: { name: 'EntreSkillHub Team', credentials: 'Business Experts' },
    duration: { value: 30, unit: 'minutes' },
    access: 'free',
    isFeatured: true,
    tags: ['business plan', 'template', 'startup'],
    stats: { viewCount: 8900, downloadCount: 3400, likeCount: 1200 },
    rating: { average: 4.7, total: 567 },
  },
  {
    title: 'Instagram Marketing for Food Business',
    subtitle: 'Grow your bakery/food business on Instagram',
    description: 'Learn how to use Instagram to grow your food business. Content strategy, hashtags, reels, stories, and paid promotions - all covered in this practical video course.',
    shortDescription: 'Master Instagram to grow your food business',
    resourceType: 'video',
    category: 'Marketing',
    difficulty: 'beginner',
    thumbnail: { url: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=800', publicId: null },
    author: { name: 'Priya Sharma', credentials: 'Instagram Expert' },
    duration: { value: 90, unit: 'minutes' },
    access: 'free',
    isTrending: true,
    tags: ['instagram', 'food business', 'marketing'],
    content: { videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', videoProvider: 'youtube' },
    stats: { viewCount: 4560, completionCount: 890, likeCount: 678 },
    rating: { average: 4.7, total: 189 },
  },
  {
    title: 'Legal Checklist for New Businesses',
    subtitle: 'Everything legal you need to know',
    description: 'Comprehensive checklist covering business registration, GST, FSSAI, MSME registration, trademarks, and other legal requirements for Indian entrepreneurs.',
    shortDescription: 'Complete legal checklist for Indian businesses',
    resourceType: 'checklist',
    category: 'Legal & Compliance',
    difficulty: 'beginner',
    thumbnail: { url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800', publicId: null },
    author: { name: 'Legal Team', credentials: 'Business Lawyers' },
    duration: { value: 20, unit: 'minutes' },
    access: 'free',
    isFeatured: true,
    tags: ['legal', 'compliance', 'registration'],
    content: {
      checklistItems: [
        { item: 'Choose business structure (Proprietorship/LLP/Pvt Ltd)', isRequired: true },
        { item: 'Register on Udyam portal (MSME)', isRequired: true },
        { item: 'Get PAN card for business', isRequired: true },
        { item: 'Open current bank account', isRequired: true },
        { item: 'Register for GST (if turnover > 20L)', isRequired: false },
        { item: 'Get FSSAI license (for food business)', isRequired: false },
        { item: 'Trademark your brand name', isRequired: false },
        { item: 'Setup accounting software', isRequired: true },
      ],
    },
    stats: { viewCount: 6780, completionCount: 2340, likeCount: 890 },
    rating: { average: 4.8, total: 345 },
  },
  {
    title: 'How to Price Your Products for Maximum Profit',
    subtitle: 'The pricing framework used by top businesses',
    description: 'Learn the exact pricing framework used by successful businesses. Cover cost calculation, competitor analysis, value-based pricing, and psychological pricing strategies.',
    shortDescription: 'Master pricing to maximize your profits',
    resourceType: 'article',
    category: 'Finance',
    difficulty: 'intermediate',
    thumbnail: { url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800', publicId: null },
    author: { name: 'Business Coach Team', credentials: 'Finance Experts' },
    duration: { value: 15, unit: 'minutes' },
    access: 'free',
    tags: ['pricing', 'finance', 'strategy'],
    stats: { viewCount: 3450, likeCount: 456, commentCount: 89 },
    rating: { average: 4.6, total: 178 },
  },
  {
    title: 'Freelancing on Upwork: Zero to 1L Per Month',
    subtitle: 'Complete guide to Upwork success',
    description: 'Step-by-step guide to landing high-paying clients on Upwork. Profile optimization, proposal writing, pricing strategy, and client management - all included.',
    shortDescription: 'Master Upwork to earn 1L+ monthly',
    resourceType: 'course',
    category: 'Business Basics',
    difficulty: 'intermediate',
    thumbnail: { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800', publicId: null },
    author: { name: 'Sneha Iyer', credentials: 'Top Rated Freelancer' },
    duration: { value: 8, unit: 'hours' },
    access: 'free',
    isFeatured: true,
    tags: ['freelancing', 'upwork', 'remote work'],
    stats: { viewCount: 4890, completionCount: 1100, likeCount: 720 },
    rating: { average: 4.8, total: 234 },
  },
  {
    title: 'Social Media Content Calendar Template',
    subtitle: 'Plan 30 days of content in 1 hour',
    description: 'Professional social media content calendar template with post ideas, hashtag research, best times to post, and analytics tracking. Excel + Google Sheets versions.',
    shortDescription: 'Plan your social media content like a pro',
    resourceType: 'template',
    category: 'Marketing',
    difficulty: 'beginner',
    thumbnail: { url: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800', publicId: null },
    author: { name: 'Marketing Team', credentials: 'Social Media Experts' },
    duration: { value: 10, unit: 'minutes' },
    access: 'free',
    tags: ['social media', 'content calendar', 'template'],
    stats: { viewCount: 5670, downloadCount: 2100, likeCount: 890 },
    rating: { average: 4.7, total: 289 },
  },
  {
    title: 'Photography Business: Pricing Guide',
    subtitle: 'How to price photography services',
    description: 'Detailed pricing guide for wedding, portrait, product, and event photography. Includes market rates by city, packaging strategies, and negotiation tips.',
    shortDescription: 'Professional pricing guide for photographers',
    resourceType: 'guide',
    category: 'Finance',
    difficulty: 'intermediate',
    thumbnail: { url: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800', publicId: null },
    author: { name: 'Karan Malhotra', credentials: 'Pro Photographer' },
    duration: { value: 25, unit: 'minutes' },
    access: 'free',
    tags: ['photography', 'pricing', 'business'],
    stats: { viewCount: 2340, likeCount: 234, commentCount: 45 },
    rating: { average: 4.6, total: 89 },
  },
  {
    title: 'Beginner\'s Guide to Web Development',
    subtitle: 'Start your coding journey today',
    description: 'Complete beginner guide covering HTML, CSS, JavaScript basics. Perfect for anyone wanting to build a career in web development or freelancing.',
    shortDescription: 'Complete web development guide for beginners',
    resourceType: 'guide',
    category: 'Technology',
    difficulty: 'beginner',
    thumbnail: { url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800', publicId: null },
    author: { name: 'Vikas Mehta', credentials: 'Tech Entrepreneur' },
    duration: { value: 3, unit: 'hours' },
    access: 'free',
    isFeatured: true,
    tags: ['web development', 'coding', 'html', 'css'],
    stats: { viewCount: 7890, completionCount: 1560, likeCount: 1200 },
    rating: { average: 4.9, total: 456 },
  },
  {
    title: 'Customer Acquisition Playbook',
    subtitle: '10 proven strategies to get first 100 customers',
    description: 'Learn 10 tested strategies to get your first 100 customers without spending on ads. Perfect for bootstrapped businesses and solopreneurs.',
    shortDescription: 'Get your first 100 customers - proven strategies',
    resourceType: 'ebook',
    category: 'Marketing',
    difficulty: 'intermediate',
    thumbnail: { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', publicId: null },
    author: { name: 'Growth Team', credentials: 'Growth Marketers' },
    duration: { value: 45, unit: 'minutes' },
    access: 'free',
    isTrending: true,
    tags: ['customer acquisition', 'growth', 'marketing'],
    stats: { viewCount: 4560, downloadCount: 1890, likeCount: 780 },
    rating: { average: 4.7, total: 234 },
  },
  {
    title: 'Financial Management for Small Business',
    subtitle: 'Master your business finances',
    description: 'Learn essential financial management skills - bookkeeping, cash flow management, budgeting, tax planning, and profit optimization for small business owners.',
    shortDescription: 'Master finance for your small business',
    resourceType: 'course',
    category: 'Finance',
    difficulty: 'intermediate',
    thumbnail: { url: 'https://images.unsplash.com/photo-1554224155-1696413565d3?w=800', publicId: null },
    author: { name: 'CA Team', credentials: 'Chartered Accountants' },
    duration: { value: 6, unit: 'hours' },
    access: 'free',
    isFeatured: true,
    tags: ['finance', 'accounting', 'business'],
    stats: { viewCount: 3890, completionCount: 780, likeCount: 567 },
    rating: { average: 4.8, total: 234 },
  },
];

// ============================================
// SEED FUNCTION
// ============================================
const seedDatabase = async () => {
  try {
    console.log('');
    console.log('🌱 Starting database seeding...');
    console.log('');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const shouldDestroy = process.argv.includes('--destroy');

    if (shouldDestroy) {
      console.log('🗑️  Destroying existing data...');
      await User.deleteMany({ role: { $ne: 'superadmin' } });
      await Skill.deleteMany({});
      await BusinessIdea.deleteMany({});
      await Roadmap.deleteMany({});
      await LearningResource.deleteMany({});
      await Mentor.deleteMany({});
      console.log('✅ Data destroyed successfully!');
      process.exit(0);
    }

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Skill.deleteMany({});
    await BusinessIdea.deleteMany({});
    await Roadmap.deleteMany({});
    await LearningResource.deleteMany({});
    await Mentor.deleteMany({});
    await User.deleteMany({ email: /@entreskillhub.com$/, role: { $ne: 'superadmin' } });

    // Create Admin
    let adminUser = await User.findOne({ email: 'admin@entreskillhub.com' });
    if (!adminUser) {
      console.log('👤 Creating admin user...');
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@entreskillhub.com',
        password: 'Admin@1234',
        role: 'superadmin',
        isEmailVerified: true,
        isActive: true,
      });
      console.log('✅ Admin created');
    }

    // Create Test User
    let testUser = await User.findOne({ email: 'test@entreskillhub.com' });
    if (!testUser) {
      console.log('👤 Creating test user...');
      testUser = await User.create({
        name: 'Test User',
        email: 'test@entreskillhub.com',
        password: 'Test@1234',
        role: 'user',
        isEmailVerified: true,
        isActive: true,
        entrepreneurshipStage: 'exploring',
        interests: ['Cooking', 'Photography', 'Technology'],
      });
      console.log('✅ Test user created');
    }

    // Seed Skills
    console.log('');
    console.log('📚 Seeding skills...');
    const createdSkills = [];
    for (const skillData of skillsData) {
      const skill = await Skill.create({
        ...skillData,
        createdBy: adminUser._id,
        status: 'approved',
      });
      createdSkills.push(skill);
    }
    console.log(`✅ Created ${createdSkills.length} skills`);

    // Seed Business Ideas
    console.log('');
    console.log('💼 Seeding business ideas...');
    const createdIdeas = [];
    for (const ideaData of businessIdeasData) {
      const relatedSkillIds = createdSkills
        .filter((s) => ideaData.tags.some((t) => (s.tags || []).includes(t)))
        .slice(0, 3)
        .map((s) => ({ skill: s._id, importance: 'important', minimumLevel: 'beginner' }));

      const idea = await BusinessIdea.create({
        ...ideaData,
        requiredSkills: relatedSkillIds,
        createdBy: adminUser._id,
        status: 'approved',
        approvedBy: adminUser._id,
        approvedAt: new Date(),
      });
      createdIdeas.push(idea);
    }
    console.log(`✅ Created ${createdIdeas.length} business ideas`);

    // Seed Mentors
    console.log('');
    console.log('👨‍🏫 Seeding mentors...');
    const createdMentors = [];
    for (const mentorInfo of mentorsData) {
      // Create user
      const user = await User.create({
        ...mentorInfo.user,
        password: 'Mentor@1234',
        role: 'mentor',
        isEmailVerified: true,
        isActive: true,
      });

      // Create mentor profile
      const mentor = await Mentor.create({
        user: user._id,
        ...mentorInfo.mentor,
        verification: {
          status: 'verified',
          verifiedAt: new Date(),
          verifiedBy: adminUser._id,
        },
        status: 'active',
        isActive: true,
      });
      createdMentors.push(mentor);
    }
    console.log(`✅ Created ${createdMentors.length} mentors`);

    // Seed Learning Resources
    console.log('');
    console.log('📖 Seeding learning resources...');
    const createdResources = [];
    for (const resourceData of resourcesData) {
      const resource = await LearningResource.create({
        ...resourceData,
        uploadedBy: adminUser._id,
        uploaderRole: 'admin',
        status: 'approved',
        approvedBy: adminUser._id,
        approvedAt: new Date(),
        publishedAt: new Date(),
        isActive: true,
      });
      createdResources.push(resource);
    }
    console.log(`✅ Created ${createdResources.length} learning resources`);

    // Create Sample Roadmap
    console.log('');
    console.log('🗺️  Creating sample roadmap...');
    const bakeryIdea = createdIdeas.find((i) => i.title === 'Home Bakery Business');

    if (bakeryIdea) {
      const roadmap = await Roadmap.create({
        title: 'Launch Your Home Bakery in 30 Days',
        subtitle: 'From baking hobbyist to profitable business owner',
        description: 'A complete step-by-step guide to launching your home bakery business. Learn everything from perfecting recipes to marketing your products and delivering orders.',
        shortDescription: 'Complete 30-day roadmap to launch your home bakery',
        businessIdea: bakeryIdea._id,
        category: 'Food Business',
        difficulty: 'easy',
        estimatedDuration: { total: 30, unit: 'days' },
        totalInvestment: { minimum: 15000, maximum: 50000 },
        tags: ['bakery', 'home business', 'food'],
        steps: [
          {
            stepNumber: 1,
            title: 'Skill Assessment & Recipe Development',
            description: 'Evaluate your baking skills and finalize 5-10 signature recipes that will be your specialty.',
            shortDescription: 'Perfect your recipes and identify your niche',
            phase: 'idea_validation',
            estimatedDuration: { value: 5, unit: 'days' },
            priority: 'high',
            tasks: [
              { title: 'List all baking recipes you know well' },
              { title: 'Select 5-10 signature items' },
              { title: 'Practice each recipe 3 times' },
              { title: 'Get feedback from family & friends' },
            ],
            tips: [
              { tip: 'Focus on quality over quantity', icon: '⭐' },
              { tip: 'Standardize your recipes with measurements', icon: '📏' },
            ],
          },
          {
            stepNumber: 2,
            title: 'Setup Your Home Kitchen',
            description: 'Organize your kitchen space for professional baking. Invest in essential equipment.',
            shortDescription: 'Setup professional-grade home kitchen',
            phase: 'infrastructure',
            estimatedDuration: { value: 5, unit: 'days' },
            estimatedCost: { amount: 25000 },
            priority: 'critical',
            tasks: [
              { title: 'Buy a convection oven' },
              { title: 'Get stand mixer and baking tools' },
              { title: 'Organize storage for ingredients' },
              { title: 'Deep clean and sanitize kitchen' },
            ],
          },
          {
            stepNumber: 3,
            title: 'Legal & Registration',
            description: 'Register your business, get FSSAI license, and understand legal requirements.',
            shortDescription: 'Complete legal registrations',
            phase: 'legal_setup',
            estimatedDuration: { value: 7, unit: 'days' },
            estimatedCost: { amount: 5000 },
            priority: 'critical',
            tasks: [
              { title: 'Apply for FSSAI Basic Registration' },
              { title: 'Register on Udyam portal (MSME)' },
              { title: 'Open a business bank account' },
            ],
          },
          {
            stepNumber: 4,
            title: 'Branding & Photography',
            description: 'Create a memorable brand identity - name, logo, packaging.',
            shortDescription: 'Build brand identity with great photos',
            phase: 'branding',
            estimatedDuration: { value: 5, unit: 'days' },
            estimatedCost: { amount: 10000 },
            tasks: [
              { title: 'Choose a memorable business name' },
              { title: 'Design or get a logo' },
              { title: 'Design packaging labels' },
              { title: 'Take Instagram-worthy product photos' },
            ],
          },
          {
            stepNumber: 5,
            title: 'Set Pricing & Menu',
            description: 'Calculate costs, set profitable prices, and create an attractive menu.',
            shortDescription: 'Price your products for profit',
            phase: 'planning',
            estimatedDuration: { value: 2, unit: 'days' },
            tasks: [
              { title: 'Calculate cost of each recipe' },
              { title: 'Set 40-60% profit margin' },
              { title: 'Create menu with photos' },
            ],
          },
          {
            stepNumber: 6,
            title: 'Launch Social Media Presence',
            description: 'Create Instagram, Facebook, and WhatsApp Business accounts.',
            shortDescription: 'Build strong social media presence',
            phase: 'marketing',
            estimatedDuration: { value: 3, unit: 'days' },
            tasks: [
              { title: 'Create Instagram business account' },
              { title: 'Post 10-15 quality photos' },
              { title: 'Setup WhatsApp Business' },
              { title: 'Announce launch to friends & family' },
            ],
          },
          {
            stepNumber: 7,
            title: 'Get Your First Orders',
            description: 'Start with soft launch - free samples, family orders, and word-of-mouth marketing.',
            shortDescription: 'Get your first paying customers',
            phase: 'launch',
            estimatedDuration: { value: 3, unit: 'days' },
            priority: 'critical',
            tasks: [
              { title: 'Give free samples to 20 people' },
              { title: 'Post special launch offers' },
              { title: 'Take pre-orders for weekend' },
              { title: 'Deliver with a thank-you note' },
            ],
            tips: [
              { tip: 'Ask happy customers for reviews', icon: '⭐' },
            ],
          },
        ],
        expectedOutcomes: [
          'Fully operational home bakery',
          'Legal compliance and food safety',
          'Strong social media presence',
          'Loyal customer base of 20-30 regulars',
        ],
        learningObjectives: [
          { objective: 'Master baking business operations' },
          { objective: 'Learn food safety and hygiene' },
          { objective: 'Develop marketing skills' },
        ],
        createdBy: adminUser._id,
        status: 'approved',
        isFeatured: true,
      });

      bakeryIdea.roadmap = roadmap._id;
      await bakeryIdea.save();
      console.log('✅ Created sample roadmap');
    }

    // Summary
    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║        🎉 DATABASE SEEDED SUCCESSFULLY! 🎉          ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log(`║  📚 Skills: ${String(createdSkills.length).padEnd(41)}║`);
    console.log(`║  💼 Business Ideas: ${String(createdIdeas.length).padEnd(33)}║`);
    console.log(`║  🗺️  Roadmaps: 1                                       ║`);
    console.log(`║  👨‍🏫 Mentors: ${String(createdMentors.length).padEnd(40)}║`);
    console.log(`║  📖 Resources: ${String(createdResources.length).padEnd(39)}║`);
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log('║  🔐 ADMIN: admin@entreskillhub.com / Admin@1234     ║');
    console.log('║  🔐 USER: test@entreskillhub.com / Test@1234        ║');
    console.log('║  🔐 MENTORS: <name>@entreskillhub.com / Mentor@1234 ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedDatabase();