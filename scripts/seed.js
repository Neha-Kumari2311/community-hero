const crypto = require('crypto');
globalThis.crypto = crypto;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://nehakumari11331:neha%233816@cluster0.ckrkklj.mongodb.net/community-hero?retryWrites=true&w=majority&appName=Cluster0';

// Schemas (inline for script)
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' },
  region: { type: String, default: '' },
  department: { type: String, default: '' },
  points: { type: Number, default: 0 },
  badges: { type: [String], default: [] },
  issuesReported: { type: Number, default: 0 },
  issuesResolved: { type: Number, default: 0 },
}, { timestamps: true });

const IssueSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  severity: String,
  status: { type: String, default: 'reported' },
  images: { type: [String], default: [] },
  videos: { type: [String], default: [] },
  region: { type: String, default: '' },
  location: {
    address: String,
    lat: Number,
    lng: Number,
  },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  aiAnalysis: {
    category: String,
    severity: String,
    description: String,
    suggested_department: String,
    estimated_impact: String,
    priority_score: Number,
    resolution_steps: [String],
    estimated_resolution_time: String,
  },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now },
  }],
  verifiedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  resolvedVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  assignedTo: { type: String, default: '' },
  resolvedAt: { type: Date, default: null },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Issue = mongoose.model('Issue', IssueSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Issue.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create test users
    const password = await bcrypt.hash('password123', 12);

    const users = await User.create([
      // Regular Users
      {
        name: 'Ansh Neha',
        email: 'ansh@test.com',
        password,
        role: 'user',
        region: 'Delhi',
        points: 220,
        badges: ['First Report', 'Verifier', 'certificate_bronze', 'tree_plant'],
        issuesReported: 12,
        issuesResolved: 5,
      },
      {
        name: 'Rahul Sharma',
        email: 'rahul@test.com',
        password,
        role: 'user',
        region: 'Delhi',
        points: 95,
        badges: ['First Report', 'local_discount'],
        issuesReported: 6,
        issuesResolved: 2,
      },
      {
        name: 'Priya Patel',
        email: 'priya@test.com',
        password,
        role: 'user',
        region: 'Delhi',
        points: 150,
        badges: ['First Report', 'Community Helper', 'certificate_bronze', 'badge_guardian'],
        issuesReported: 8,
        issuesResolved: 4,
      },
      {
        name: 'Amit Kumar',
        email: 'amit@test.com',
        password,
        role: 'user',
        region: 'Delhi',
        points: 55,
        badges: ['First Report'],
        issuesReported: 3,
        issuesResolved: 1,
      },
      {
        name: 'Sneha Gupta',
        email: 'sneha@test.com',
        password,
        role: 'user',
        region: 'Delhi',
        points: 35,
        badges: [],
        issuesReported: 2,
        issuesResolved: 0,
      },
      // Admin Users
      {
        name: 'Admin Officer',
        email: 'admin@municipality.gov',
        password,
        role: 'admin',
        region: 'Delhi',
        department: 'Public Works',
        points: 0,
        badges: ['Admin'],
        issuesReported: 0,
        issuesResolved: 10,
      },
      {
        name: 'Supervisor Singh',
        email: 'supervisor@municipality.gov',
        password,
        role: 'admin',
        region: 'Delhi',
        department: 'Sanitation & Water',
        points: 0,
        badges: ['Admin'],
        issuesReported: 0,
        issuesResolved: 8,
      },
    ]);

    console.log(`👥 Created ${users.length} users (5 citizens + 2 admins)`);

    // Create issues with different statuses, categories, severities
    const issues = await Issue.create([
      {
        title: 'Massive pothole on Ring Road near AIIMS flyover',
        description: 'A huge pothole has formed on the main Ring Road near AIIMS flyover. It is around 3 feet wide and 8 inches deep. Already caused 2 bike accidents this week. Extremely dangerous during night time.',
        category: 'pothole',
        severity: 'critical',
        status: 'verified',
        region: 'Delhi',
        images: ['https://images.unsplash.com/photo-1560782202-154b39d57ef2?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
        location: {
          address: 'Ring Road, Near AIIMS Flyover, New Delhi',
          lat: 28.5672,
          lng: 77.2100,
        },
        reportedBy: users[0]._id,
        aiAnalysis: {
          category: 'pothole',
          severity: 'critical',
          description: 'Large pothole on a high-traffic main road causing accidents',
          suggested_department: 'Public Works Department (PWD)',
          estimated_impact: 'Affects 50,000+ daily commuters, high accident risk',
          priority_score: 9,
          resolution_steps: ['Barricade the area immediately', 'Cut and clean damaged asphalt', 'Fill with hot-mix asphalt', 'Compact and level the surface', 'Mark road for 48hrs curing'],
          estimated_resolution_time: '2-3 days',
        },
        upvotes: [users[1]._id, users[2]._id, users[3]._id, users[4]._id],
        verifiedBy: [users[1]._id, users[2]._id, users[3]._id],
        comments: [
          { user: users[1]._id, text: 'My friend had an accident here yesterday. This needs to be fixed immediately!', createdAt: new Date(Date.now() - 86400000) },
          { user: users[2]._id, text: 'I commute here daily. Very dangerous especially at night when visibility is low.', createdAt: new Date(Date.now() - 43200000) },
          { user: users[4]._id, text: 'Can someone put a warning sign at least until its fixed?', createdAt: new Date(Date.now() - 21600000) },
        ],
      },
      {
        title: 'Streetlights not working on entire Lodhi Road stretch',
        description: 'All streetlights from Lodhi Garden gate to Jor Bagh metro station have been off for over 10 days now. The entire 2km stretch is pitch dark at night. Multiple complaints to MCD but no action.',
        category: 'streetlight',
        severity: 'high',
        status: 'in_progress',
        region: 'Delhi',
        images: ['https://images.unsplash.com/photo-1547769725-b95b3ae93d42?q=80&w=654&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
        location: {
          address: 'Lodhi Road, Near Lodhi Garden, New Delhi',
          lat: 28.5930,
          lng: 77.2190,
        },
        reportedBy: users[1]._id,
        aiAnalysis: {
          category: 'streetlight',
          severity: 'high',
          description: 'Multiple non-functional streetlights on a major road creating safety hazard',
          suggested_department: 'Electricity Department (BSES/NDMC)',
          estimated_impact: 'Safety risk for pedestrians, joggers, and cyclists at night',
          priority_score: 8,
          resolution_steps: ['Inspect electrical panel and wiring', 'Check for cable theft', 'Replace damaged MCBs', 'Replace faulty LED panels', 'Test all lights'],
          estimated_resolution_time: '3-5 days',
        },
        upvotes: [users[0]._id, users[2]._id, users[3]._id],
        verifiedBy: [users[0]._id, users[2]._id, users[4]._id],
        comments: [
          { user: users[0]._id, text: 'I jog here every morning. Its completely dark at 5:30 AM. Scary for women.', createdAt: new Date(Date.now() - 172800000) },
          { user: users[3]._id, text: 'Reported to MCD helpline 1800-11-1111 three times. No response.', createdAt: new Date(Date.now() - 86400000) },
        ],
        assignedTo: 'NDMC Electrical Wing',
      },
      {
        title: 'Garbage dump overflowing near Sarojini Nagar Market',
        description: 'The community garbage collection point near Gate 2 of Sarojini Nagar Market has been overflowing for a week. Stray dogs and cows scatter garbage all over the road. Terrible stench is affecting nearby houses and shops.',
        category: 'waste_management',
        severity: 'high',
        status: 'reported',
        region: 'Delhi',
        images: ['https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&h=600&fit=crop'],
        location: {
          address: 'Sarojini Nagar Market, Gate 2, New Delhi',
          lat: 28.5774,
          lng: 77.1920,
        },
        reportedBy: users[2]._id,
        aiAnalysis: {
          category: 'waste_management',
          severity: 'high',
          description: 'Overflowing garbage point causing hygiene and health hazards',
          suggested_department: 'Municipal Corporation - Sanitation Wing',
          estimated_impact: 'Health risk for 5000+ nearby residents, disease vector breeding',
          priority_score: 8,
          resolution_steps: ['Deploy garbage collection truck', 'Clear and clean the area', 'Spray disinfectant', 'Install larger bins', 'Increase daily pickup schedule'],
          estimated_resolution_time: '1-2 days',
        },
        upvotes: [users[0]._id, users[1]._id],
        verifiedBy: [users[0]._id],
        comments: [
          { user: users[0]._id, text: 'The smell is unbearable! We cant even open our windows.', createdAt: new Date(Date.now() - 48000000) },
        ],
      },
      {
        title: 'Water pipeline burst at Green Park main road',
        description: 'A major water pipeline has burst near Green Park Metro station. Clean water is gushing out and flooding the road. Traffic is heavily affected. This has been going on for 6+ hours with no DJB team in sight.',
        category: 'water_leakage',
        severity: 'critical',
        status: 'reported',
        region: 'Delhi',
        images: ['https://images.unsplash.com/photo-1636333855543-ceaaf263747d?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
        location: {
          address: 'Green Park Main Road, Near Metro Station, New Delhi',
          lat: 28.5596,
          lng: 77.2065,
        },
        reportedBy: users[3]._id,
        aiAnalysis: {
          category: 'water_leakage',
          severity: 'critical',
          description: 'Major water pipeline burst causing water wastage and road flooding',
          suggested_department: 'Delhi Jal Board (DJB)',
          estimated_impact: 'Massive water wastage, road flooding, traffic disruption in 1km radius',
          priority_score: 10,
          resolution_steps: ['Emergency shutdown of water supply to section', 'Excavate to locate burst point', 'Repair/replace pipe section', 'Pressure test', 'Restore road surface'],
          estimated_resolution_time: '1-3 days (emergency)',
        },
        upvotes: [users[0]._id, users[1]._id, users[2]._id, users[4]._id],
        verifiedBy: [users[0]._id, users[1]._id],
        comments: [
          { user: users[0]._id, text: 'Called DJB complaint number. They said team is on the way 3 hours ago!', createdAt: new Date(Date.now() - 10800000) },
          { user: users[1]._id, text: 'Traffic is completely jammed. Water level is rising on road. Please escalate!', createdAt: new Date(Date.now() - 7200000) },
          { user: users[4]._id, text: 'This is such a waste of clean water when half of Delhi doesnt get proper supply.', createdAt: new Date(Date.now() - 3600000) },
        ],
      },
      {
        title: 'Damaged road divider with exposed metal rods at Nehru Place',
        description: 'A vehicle collision has damaged the road divider at Nehru Place roundabout. Sharp iron rods are now exposed at ground level. Extremely dangerous for two-wheelers and pedestrians crossing the road.',
        category: 'road_damage',
        severity: 'medium',
        status: 'reported',
        region: 'Delhi',
        images: ['https://images.unsplash.com/photo-1653420724129-794516c863b8?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
        location: {
          address: 'Nehru Place Roundabout, New Delhi',
          lat: 28.5491,
          lng: 77.2530,
        },
        reportedBy: users[4]._id,
        aiAnalysis: {
          category: 'road_damage',
          severity: 'medium',
          description: 'Damaged road divider with exposed metal rods creating injury hazard',
          suggested_department: 'PWD - Road Maintenance Division',
          estimated_impact: 'Injury risk for two-wheelers and pedestrians, visual obstruction',
          priority_score: 6,
          resolution_steps: ['Place warning barriers around damage', 'Cut exposed rods flush', 'Remove damaged divider section', 'Install new precast divider block', 'Repaint road markings'],
          estimated_resolution_time: '3-5 days',
        },
        upvotes: [users[0]._id],
        verifiedBy: [],
        comments: [],
      },
      {
        title: 'Factory releasing toxic smoke in residential area at Okhla',
        description: 'An unauthorized factory in Okhla Phase 2 industrial area is releasing thick black smoke from its chimney directly into the adjacent residential colony. Residents are experiencing breathing issues. This happens mainly after 10 PM to avoid detection.',
        category: 'pollution',
        severity: 'high',
        status: 'reported',
        region: 'Delhi',
        images: ['https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=600&fit=crop'],
        location: {
          address: 'Okhla Phase 2, Near Residential Colony, New Delhi',
          lat: 28.5330,
          lng: 77.2710,
        },
        reportedBy: users[3]._id,
        aiAnalysis: {
          category: 'pollution',
          severity: 'high',
          description: 'Industrial air pollution affecting residential area at night',
          suggested_department: 'Delhi Pollution Control Committee (DPCC)',
          estimated_impact: 'Health hazard for 3000+ residents, especially children and elderly',
          priority_score: 8,
          resolution_steps: ['Report to DPCC for immediate inspection', 'File complaint on CPCB portal', 'Collect air quality readings', 'Request factory closure notice', 'Follow up with magistrate order'],
          estimated_resolution_time: '7-14 days (legal process)',
        },
        upvotes: [users[0]._id, users[2]._id],
        verifiedBy: [],
        comments: [
          { user: users[2]._id, text: 'My mother has developed chronic cough since this started 2 months ago.', createdAt: new Date(Date.now() - 86400000) },
        ],
      },
    ]);

    console.log(`📋 Created ${issues.length} issues with valid image links`);
    console.log('\n✅ Seed complete! Login credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  CITIZENS:');
    console.log('    ansh@test.com       / password123  (220 pts, Level 5, has redeemed rewards)');
    console.log('    rahul@test.com      / password123  (95 pts, Level 2)');
    console.log('    priya@test.com      / password123  (150 pts, Level 4, has redeemed rewards)');
    console.log('    amit@test.com       / password123  (55 pts, Level 2)');
    console.log('    sneha@test.com      / password123  (35 pts, Level 1, new user)');
    console.log('  ADMINS:');
    console.log('    admin@municipality.gov     / password123  (Public Works dept)');
    console.log('    supervisor@municipality.gov / password123  (Sanitation dept)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n  Issues created: 6 total');
    console.log('    - 2 critical (pothole, water leak)');
    console.log('    - 3 high (streetlight, garbage, pollution)');
    console.log('    - 1 medium (road damage)');
    console.log('    - Statuses: 4 reported, 1 verified, 1 in_progress');
    console.log('    - Categories: pothole, streetlight, waste_management, water_leakage, road_damage, pollution');

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
