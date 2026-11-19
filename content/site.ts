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
  email: 'hello@yourname.dev',
  location: 'India · open to remote',
  socials: [
    { label: 'GitHub', href: 'https://github.com/your-handle' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/your-handle' },
    { label: 'Email', href: 'mailto:hello@yourname.dev' },
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

export type Project = {
  id: string;
  title: string;
  year: string;
  summary: string;
  stack: string[];
  details: string[];
  github?: string;
  demo?: string;
  accent: string;
};

export const projects: Project[] = [
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
  kind: 'Paper' | 'Award' | 'Interest' | 'Talk';
  title: string;
  venue: string;
  blurb: string;
  href?: string;
  color: string;
};

export const research: Research[] = [
  {
    id: 'r1',
    kind: 'Paper',
    title: 'Efficient Retrieval for On-Device Assistants',
    venue: 'Workshop paper · 2026',
    blurb: 'Compressing embedding indexes so search runs comfortably on a phone.',
    href: 'https://arxiv.org/',
    color: '#8C3B3B',
  },
  {
    id: 'r2',
    kind: 'Award',
    title: 'Best Student Project',
    venue: 'University tech fest · 2025',
    blurb: 'For an accessible campus navigation app used by 3,000+ students.',
    color: '#3B5B8C',
  },
  {
    id: 'r3',
    kind: 'Talk',
    title: 'Making the Web Feel Handmade',
    venue: 'Local JS meetup · 2025',
    blurb: 'On motion, restraint and why small details make software feel warm.',
    href: 'https://youtube.com/',
    color: '#4F6B3A',
  },
  {
    id: 'r4',
    kind: 'Interest',
    title: 'Human-centred ML & Graphics',
    venue: 'Ongoing reading',
    blurb: 'Interpretability, procedural generation and tools for creative people.',
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
