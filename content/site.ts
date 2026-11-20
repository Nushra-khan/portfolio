/**
 * Everything you'll want to edit lives in this one file.
 * Replace the placeholder text, links and images with your own —
 * the 3D world and the layout update automatically.
 */

export const site = {
  name: 'Nushra',
  title: 'A Little World of My Own',
  role: 'Creative software developer & home cook',
  tagline: 'Curious what’s inside? Ring the bell and come on in!',
  resumeUrl: '/resume.pdf',
  email: 'nushrakhan312@gmail.com',
  location: 'India · open to remote',
  socials: [
    { label: 'GitHub', href: 'https://github.com/Nushra-khan' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/nushra-khan' },
    { label: 'Email', href: 'mailto:nushrakhan312@gmail.com' },
  ],
};

export const about = {
  eyebrow: 'The study',
  heading: 'Hello, I build small things with a lot of care.',
  paragraphs: [
    'I’m a software developer who enjoys the quiet craft of making tools feel effortless — clean interfaces, thoughtful systems, and details most people only notice when they’re missing.',
    'When I’m not at my desk, I’m usually in the kitchen. Cooking taught me most of what I know about iteration: taste, adjust, taste again.',
  ],
  facts: [
    { label: 'Currently', value: 'Building delightful web experiences' },
    { label: 'Focus', value: 'Full-stack · 3D on the web · ML tooling' },
    { label: 'Toolbox', value: 'TypeScript, React, Python, Three.js' },
  ],
};

/** Shown on the study's recognition wall and in the About section. */
export const achievements = [
  {
    id: 'gold-medals',
    title: 'Two gold medals',
    detail: 'Framed on the study wall',
  },
  {
    id: 'best-website',
    title: 'Workshop Winner — Best Website',
    detail: 'No-Code Web Development Workshop, organised by OWASP Sharda',
  },
];

export type Role = {
  id: 'google' | 'owasp' | 'environment';
  title: string;
  org: string;
  dates: string;
  detail: string;
  color: string;
};

/** Each role is a small plaque on the study shelf. */
export const leadership: Role[] = [
  {
    id: 'owasp',
    title: 'Designer Team Lead',
    org: 'OWASP Sharda University',
    dates: 'Nov 2024 – Present',
    detail: 'Leading the design team: UI/UX, visual assets and consistent branding across technical events and initiatives.',
    color: '#2F4F7A',
  },
  {
    id: 'google',
    title: 'Google Student Campus Ambassador',
    org: 'Sharda University',
    dates: 'Aug 2025 – Jan 2026',
    detail: 'Led campus workshops on Google tools and learning resources.',
    color: '#C2683F',
  },
  {
    id: 'environment',
    title: 'Member, Environment Club',
    org: 'Sharda University',
    dates: 'Sep 2023 – Present',
    detail: 'Supporting campus initiatives on environmental awareness and sustainability.',
    color: '#4F6B3A',
  },
];

export type SkillGroup = {
  id: string;
  title: string;
  /** Colour of the jar contents for this group. */
  color: string;
  skills: string[];
};

/** Each skill is a labelled jar on the workshop's apothecary shelf (top shelf first). */
export const skillGroups: SkillGroup[] = [
  { id: 'languages', title: 'Languages', color: '#E7B45A', skills: ['Python', 'JavaScript', 'TypeScript', 'Java', 'Kotlin', 'Dart', 'C', 'SQL', 'HTML', 'CSS'] },
  { id: 'design', title: 'Design', color: '#E58FB0', skills: ['Figma', 'Framer', 'Canva'] },
  { id: 'frontend', title: 'Frontend & Mobile', color: '#7BA7D9', skills: ['Next.js', 'React Native', 'Flutter', 'Expo', 'Android Studio', 'APK / AAB', 'Play Store Deploy'] },
  { id: 'backend', title: 'Backend & APIs', color: '#C2683F', skills: ['Node.js', 'Express.js', 'Django', 'FastAPI', 'REST APIs', 'Server Management'] },
  {
    id: 'payments',
    title: 'Payments & Integrations',
    color: '#9E4A6B',
    skills: ['Razorpay', 'Google Pay (UPI)', 'BillDesk', 'Payment Gateways', 'Payment APIs & Webhooks', 'Transaction Verification'],
  },
  { id: 'data', title: 'Databases', color: '#4F8A8B', skills: ['PostgreSQL', 'MongoDB', 'Supabase', 'Firebase', 'Vector DBs'] },
  { id: 'cloud', title: 'Cloud & Deploy', color: '#9C8AD8', skills: ['Google Cloud', 'Google Auth', 'Vercel', 'Railway'] },
  { id: 'tools', title: 'Dev & AI Tools', color: '#8A9A5B', skills: ['Git', 'GitHub', 'VS Code', 'Cursor', 'Claude', 'Codex', 'Antigravity'] },
  {
    id: 'ai',
    title: 'AI & Machine Learning',
    color: '#3E8E7E',
    skills: ['Machine Learning', 'Generative AI', 'Agentic AI', 'LLMs', 'RAG', 'LangChain', 'LangGraph', 'NLP', 'PyTorch', 'Transformers', 'Embeddings', 'Data Analysis'],
  },
];

/** Stable id for a skill, shared by the 3D jar and the skill chip. */
export const skillId = (name: string) => 'skill:' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** Which groups sit on which shelf, top to bottom. */
export const skillShelves: string[][] = [['languages', 'design'], ['frontend', 'backend', 'payments'], ['data', 'cloud', 'tools'], ['ai']];

export type Experience = {
  id: 'foundrfuse' | 'iiitk';
  role: string;
  org: string;
  dates: string;
  location?: string;
  points: string[];
  link?: { label: string; href: string };
  color: string;
};

/** Shown in the library's reading nook (ID badge + research logbook). */
export const experience: Experience[] = [
  {
    id: 'foundrfuse',
    role: 'Machine Learning Intern',
    org: 'FoundrFuse Pvt. Ltd.',
    dates: 'Apr 2026 – Present',
    points: [
      'Built the FoundrFuse Android app from scratch and shipped it to Google Play (Kotlin, Jetpack Compose, FCM)',
      'AI investor–startup matching and pitch-deck analysis with Python and Django (semantic similarity)',
      'REST APIs, data-validation workflows, testing and release management',
    ],
    link: { label: 'View on Google Play', href: 'https://play.google.com/store/apps/details?id=com.foundrfuse.mobile&hl=en_IN' },
    color: '#2F4F7A',
  },
  {
    id: 'iiitk',
    role: 'Research Intern — MINDS Research Lab',
    org: 'IIIT Kottayam',
    dates: 'May – Jul 2026',
    location: 'Remote',
    points: [
      'Turned patient-monitoring and caregiver needs into mobile app requirements',
      'Designed the architecture and database for medication schedules, location monitoring and emergency alerts',
    ],
    color: '#7A4A2A',
  },
];

export type Project = {
  id: string;
  title: string;
  year: string;
  summary: string;
  stack: string[];
  details: string[];
  github?: string;
  demo?: string;
  /** Text for the demo button (defaults to "Live demo"). */
  demoLabel?: string;
  accent: string;
};

export const projects: Project[] = [
  {
    id: 'foundrfuse',
    title: 'FoundrFuse — Android app',
    year: '2026',
    summary: 'Investor–startup matching app, built from scratch and live on Google Play.',
    stack: ['Kotlin', 'Jetpack Compose', 'FCM', 'Django', 'REST APIs'],
    details: ['AI matching & pitch-deck analysis', 'End-to-end Play Store release'],
    demo: 'https://play.google.com/store/apps/details?id=com.foundrfuse.mobile&hl=en_IN',
    demoLabel: 'Google Play',
    accent: '#2F4F7A',
  },
  {
    id: 'lantern',
    title: 'Lantern',
    year: '2026',
    summary: 'A calm, keyboard-first notes app with offline sync and semantic search.',
    stack: ['Next.js', 'SQLite', 'CRDTs', 'Embeddings'],
    details: ['Local-first sync engine', 'Sub-50 ms search across 10k notes'],
    github: 'https://github.com/your-handle/lantern',
    demo: 'https://lantern.example.com',
    accent: '#E7B45A',
  },
  {
    id: 'sprout',
    title: 'Sprout',
    year: '2025',
    summary: 'Garden planner that suggests companion planting from soil and climate data.',
    stack: ['React', 'FastAPI', 'PostGIS'],
    details: ['Interactive plot editor', 'Weather-aware watering reminders'],
    github: 'https://github.com/your-handle/sprout',
    demo: 'https://sprout.example.com',
    accent: '#7FA35B',
  },
  {
    id: 'mise',
    title: 'Mise',
    year: '2025',
    summary: 'Recipe scaler and kitchen timer that reads ingredient lists from photos.',
    stack: ['TypeScript', 'OCR', 'PWA'],
    details: ['Unit-aware scaling', 'Works fully offline'],
    github: 'https://github.com/your-handle/mise',
    accent: '#C2683F',
  },
  {
    id: 'paperboat',
    title: 'Paper Boat',
    year: '2024',
    summary: 'Tiny WebGL engine for stylised dioramas — the ancestor of this website.',
    stack: ['Three.js', 'GLSL', 'Vite'],
    details: ['Instanced foliage with wind', 'Painterly post-processing'],
    github: 'https://github.com/your-handle/paper-boat',
    demo: 'https://paperboat.example.com',
    accent: '#7BA7D9',
  },
];

export type Research = {
  id: string;
  kind: 'Conference paper' | 'Book chapter';
  status?: 'Accepted' | 'Under review' | 'Published';
  date: string;
  title: string;
  venue: string;
  publisher: string;
  /** Optional link (DOI, publisher page, arXiv…) — add one when it's available. */
  href?: string;
  /** Cover colour of this paper's book on the library table. */
  color: string;
};

/** Each entry becomes a book on the library's display table. */
export const research: Research[] = [
  {
    id: 'mental-health-stacking',
    kind: 'Conference paper',
    status: 'Accepted',
    date: 'Oct 2026',
    title: 'Multiclass Mental Health Classification Using Nested Validation and Stacking Ensemble',
    venue: 'IEEE International Conference on Secure and Intelligent Digital Ecosystems (SIDE’26)',
    publisher: 'Springer Nature · STEAM-H',
    color: '#8C3B3B',
  },
  {
    id: 'diabetic-retinopathy',
    kind: 'Conference paper',
    status: 'Accepted',
    date: 'Oct 2026',
    title: 'Automated Binary Screening of Diabetic Retinopathy Using EfficientNet-B3 with CLAHE and Grad-CAM-Based Explainability',
    venue: '3rd International Conference on Next Generation Communication and Computing',
    publisher: 'Springer',
    color: '#3B5B8C',
  },
  {
    id: 'mental-health-hybrid',
    kind: 'Conference paper',
    status: 'Under review',
    date: 'Nov 2026',
    title: 'Hybrid Ensemble Learning for Binary and Multiclass Classification of Mental Health',
    venue: '8th International Conference on Artificial Intelligence and Speech Technology',
    publisher: 'Springer',
    color: '#6B4A7A',
  },
  {
    id: 'biodiversity-review',
    kind: 'Conference paper',
    status: 'Under review',
    date: '2027',
    title: 'Learning with Limited Data under Privacy Constraints: A Review of Machine Learning for Biodiversity Monitoring',
    venue: 'International Conference on Emerging Smart Technology for Sustainable Development (ESTSD-2027)',
    publisher: '',
    color: '#4F6B3A',
  },
  {
    id: 'hvac-air-purification',
    kind: 'Book chapter',
    date: 'Jul 2026',
    title: 'AI Applications in HVAC Systems for Indoor Air Purification',
    venue: 'Smart Approaches to Air Remediation: AI Applications in Air Pollution Control and Monitoring',
    publisher: 'Bentham Science',
    color: '#9C6B2E',
  },
];

export type Recipe = {
  id: 'dessert' | 'sandwich' | 'noodles' | 'chicken' | 'pasta';
  title: string;
  time: string;
  story: string;
  steps: string[];
};

/** Each id matches a dish on the kitchen island. */
export const recipes: Recipe[] = [
  {
    id: 'dessert',
    title: 'Desserts',
    time: 'Always room for one',
    story: 'Cakes, creams and sweet experiments — the thing friends ask me to bring every time.',
    steps: ['Soft sponge, whipped cream, fresh berries', 'Not too sweet, always pretty', 'Best shared straight from the stand'],
  },
  {
    id: 'sandwich',
    title: 'Loaded Sandwiches',
    time: '15 min',
    story: 'Quick, stacked and toasted just right — my go-to for busy days and long study nights.',
    steps: ['Butter and toast the bread', 'Layer chicken, cheese, lettuce and tomato', 'Press, slice corner to corner'],
  },
  {
    id: 'noodles',
    title: 'Chicken Noodles',
    time: '30 min',
    story: 'A big comforting bowl that disappears the moment it hits the table.',
    steps: ['Stir-fry spiced chicken strips', 'Toss noodles with veggies and sauces', 'Finish with spring onions and a jammy egg'],
  },
  {
    id: 'chicken',
    title: 'Roast Chicken',
    time: '1 h 30 min',
    story: 'Golden, crispy skin and juicy inside — the dish everyone gathers around.',
    steps: ['Marinate with garlic, lemon and herbs', 'Roast with potatoes until golden', 'Rest, carve and serve with lemon'],
  },
  {
    id: 'pasta',
    title: 'White Sauce Pasta',
    time: '25 min',
    story: 'Creamy, cheesy and velvety — the most requested plate in my kitchen.',
    steps: ['Cook butter and flour, whisk in milk', 'Season with garlic, pepper and oregano', 'Fold in pasta and top with cheese'],
  },
];

export const contact = {
  eyebrow: 'The garden, at night',
  heading: 'Leave a letter in the mailbox.',
  body: 'Whether it’s a project, a role, or a recipe swap — I read every message and reply within a couple of days.',
};

export const sections = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'research', label: 'Research' },
  { id: 'cooking', label: 'Cooking' },
  { id: 'contact', label: 'Contact' },
] as const;

export type SectionId = (typeof sections)[number]['id'];
