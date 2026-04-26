export const NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Work', href: '#projects' },
  { label: 'Connect', href: '#services' },
  { label: 'Say hi', href: '#contact' },
]

export const SECTIONS = ['hero','about','skills','experience','projects','services','testimonials','contact']

export const TICKER_ITEMS = [
  'npm run portfolio',
  '∞',
  'git push origin main',
  '∞',
  'tokens consumed: ∞',
  '∞',
  'ctrl+z: 0 regrets',
  '∞',
  'yarn build --production',
  '∞',
  'merge conflicts: 300+',
  '∞',
  '404: bugs not found',
  '∞',
  'npm run hire-me',
  '∞',
  'localhost:3000 ♥',
  '∞',
  'git blame → not me',
  '∞',
]

export const TICKER_ITEMS_2 = [
  'react.useState(🔥)',
  '◆',
  'TypeScript: strict mode enabled',
  '◆',
  'figma → code: no cap',
  '◆',
  'pixel perfect or bust',
  '◆',
  'dark mode is a right, not a feature',
  '◆',
  'const bugs = []  // always empty',
  '◆',
  'ship it. 🚀',
  '◆',
  'coffee.then(code)',
  '◆',
]

export const STATS = [
  { key: 'projects.length', value: '40+', sub: 'shipped to prod' },
  { key: 'experience.years', value: '5+', sub: 'in the stack' },
  { key: 'conflicts.resolved', value: '300+', sub: 'merge conflicts' },
  { key: 'tokens.consumed', value: '∞', sub: 'claude-assisted' },
  { key: 'ctrl_z.count', value: '0', sub: 'zero regrets' },
]

export type Skill = { name: string; value: string; comment: string; isNumber?: boolean }

export const SKILLS_GRID = [
  // Web
  { name: 'React', icon: '⚛️', level: 95, color: 'lime', category: 'Web' },
  { name: 'Next.js', icon: '▲', level: 93, color: 'lime', category: 'Web' },
  { name: 'TypeScript', icon: 'TS', level: 90, color: 'lime', category: 'Web' },
  { name: 'Tailwind', icon: '🌬', level: 90, color: 'lime', category: 'Web' },
  { name: '.NET Core', icon: '◈', level: 78, color: 'lime', category: 'Web' },
  { name: 'Redux', icon: '♻', level: 88, color: 'lime', category: 'Web' },
  // Mobile
  { name: 'React Native', icon: '📱', level: 92, color: 'lavender', category: 'Mobile' },
  { name: 'Expo', icon: '⬡', level: 88, color: 'lavender', category: 'Mobile' },
  { name: 'iOS', icon: '', level: 80, color: 'lavender', category: 'Mobile' },
  { name: 'Android', icon: '🤖', level: 80, color: 'lavender', category: 'Mobile' },
  { name: 'Azure', icon: '☁', level: 75, color: 'lavender', category: 'Mobile' },
  { name: 'Ionic', icon: '⚡', level: 72, color: 'lavender', category: 'Mobile' },
  // Design
  { name: 'Figma', icon: '◐', level: 88, color: 'red', category: 'Design' },
  { name: 'Adobe XD', icon: '✦', level: 80, color: 'red', category: 'Design' },
  { name: 'Photoshop', icon: '🖼', level: 75, color: 'red', category: 'Design' },
  { name: 'Illustrator', icon: '✏', level: 70, color: 'red', category: 'Design' },
  { name: 'Procreate', icon: '🎨', level: 68, color: 'red', category: 'Design' },
  { name: 'HTML/CSS', icon: '◻', level: 96, color: 'red', category: 'Design' },
]

export const TECH_JOKES = [
  { text: 'undefined is not a function', lang: 'JS' },
  { text: 'const tokens = Infinity // claude-powered', lang: 'TS' },
  { text: '// TODO: never', lang: '🤫' },
  { text: 'it works on my machine™', lang: 'PROD' },
  { text: 'SELECT * FROM solutions WHERE bug = NULL', lang: 'SQL' },
  { text: 'git commit -m "fix: final FINAL v3"', lang: 'GIT' },
]

export const SKILLS: { web: Skill[]; mobile: Skill[]; design: Skill[] } = {
  web: [
    { name: 'react', value: '"5+ years"', comment: '// battle-tested' },
    { name: 'nextjs', value: '"expert"', comment: '// SSR, ISR, App Router' },
    { name: 'typescript', value: '"strict mode"', comment: '// always' },
    { name: 'redux', value: '"state wizard"', comment: '// global control' },
    { name: 'tailwind', value: '"daily driver"', comment: '// no more CSS files' },
    { name: 'dotnet', value: '"C# / Core"', comment: '// full stack' },
  ],
  mobile: [
    { name: 'reactNative', value: '"5+ years"', comment: '// iOS + Android' },
    { name: 'expo', value: '"managed flow"', comment: '// fast deploys' },
    { name: 'ionic', value: '"angular era"', comment: '// cross-platform' },
    { name: 'azure', value: '"cloud infra"', comment: '// deployed & scaled' },
    { name: 'tokens', value: 'Infinity', comment: '// claude-powered', isNumber: true },
    { name: 'ctrlZ', value: '"never needed"', comment: '// git revert ftw' },
  ],
  design: [
    { name: 'figma', value: '"3+ years"', comment: '// design → code' },
    { name: 'adobeXD', value: '"wireframes"', comment: '// prototyping' },
    { name: 'procreate', value: '"art mode"', comment: '// creative outlet' },
    { name: 'photoshop', value: '"when needed"', comment: '// pixel pusher' },
    { name: 'illustrator', value: '"vectors"', comment: '// logos & icons' },
    { name: 'htmlcss', value: '"semantic"', comment: '// the foundation' },
  ],
}

export const SKILL_LEVELS = [
  { label: 'React / Next.js', pct: 95 },
  { label: 'React Native', pct: 92 },
  { label: 'TypeScript', pct: 90 },
  { label: 'UI/UX Design', pct: 82 },
  { label: '.NET Core', pct: 78 },
]

export const EXPERIENCE = [
  {
    year: '2023',
    role: 'Senior Software Engineer',
    company: 'Current Company',
    current: true,
    tags: ['Next.js', 'React Native', 'TypeScript', 'Azure'],
    points: [
      'Led frontend architecture for 3 production apps serving 50k+ users',
      'Reduced bundle size by 40% via code splitting and lazy loading',
      'Mentored 4 junior developers, introduced component design system',
      'Shipped React Native app to App Store with 4.8★ rating',
    ],
  },
  {
    year: '2022',
    role: 'Software Engineer',
    company: 'Previous Company',
    current: false,
    tags: ['React', '.NET Core', 'Redux', 'Azure'],
    points: [
      'Built full-stack features across React frontend and .NET Core API',
      'Resolved 300+ merge conflicts across a large monorepo codebase',
      'Integrated third-party APIs: payment, mapping, analytics',
      'Collaborated directly with design team bridging Figma to React',
    ],
  },
  {
    year: '2020',
    role: 'Mobile App Developer',
    company: 'Mobile Studio',
    current: false,
    tags: ['React Native', 'Expo', 'Ionic', 'TypeScript'],
    points: [
      'Developed 5+ cross-platform apps for iOS and Android',
      'Built offline-first architecture with local SQLite storage',
      'Integrated push notifications, deep linking, and camera APIs',
      'Shipped Ionic/Angular app with 10k+ active users',
    ],
  },
  {
    year: '2019',
    role: 'Frontend Developer',
    company: 'First Role',
    current: false,
    tags: ['React', 'HTML/CSS', 'JavaScript', 'Bootstrap'],
    points: [
      'Built responsive UIs from Figma and Adobe XD designs',
      'Maintained and extended legacy jQuery codebase',
      'Introduced component-based architecture with React',
      'Delivered 10+ client projects on time',
    ],
  },
]

export const PROJECTS = [
  {
    name: 'Oodle Finance',
    description: 'Car finance app serving thousands across the UK. App Store + Google Play.',
    tags: ['React Native', 'TypeScript', 'Redux', 'Azure'],
    type: 'Mobile App',
    year: '2023',
    mockupGradient: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)',
    mockupAccent: '#82ff1f',
    mockupImage: '/assets/img/portfolio1.jpg',
    link: 'https://apps.apple.com',
  },
  {
    name: 'ACS Life',
    description: 'Hospitality management platform for enterprise clients with real-time dashboards.',
    tags: ['Next.js', 'React', '.NET Core', 'Azure'],
    type: 'Web App',
    year: '2023',
    mockupGradient: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)',
    mockupAccent: '#b8a0ff',
    mockupImage: '/assets/img/portfolio2.jpg',
  },
  {
    name: 'P&O Ferries',
    description: 'Web and mobile apps for one of Europe\'s largest ferry operators.',
    tags: ['React', 'React Native', 'TypeScript'],
    type: 'Web + Mobile',
    year: '2022',
    mockupGradient: 'linear-gradient(135deg, #003049 0%, #023e8a 50%, #0077b6 100%)',
    mockupAccent: '#e02020',
    mockupImage: '/assets/img/portfolio3.jpg',
  },
  {
    name: 'MidiUnderground',
    description: 'Radio station platform — live streaming, show scheduling, listener analytics.',
    tags: ['React', 'React Native', 'Node.js'],
    type: 'Web + Mobile',
    year: '2022',
    mockupGradient: 'linear-gradient(135deg, #1a0000 0%, #2d0000 50%, #3d0000 100%)',
    mockupAccent: '#82ff1f',
    mockupImage: '/assets/img/portfolio4.jpg',
  },
  {
    name: 'Onboarding Hub',
    description: 'Streamlined HR onboarding workflows for enterprise teams.',
    tags: ['Next.js', 'TypeScript', 'Azure'],
    type: 'Web App',
    year: '2021',
    mockupGradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
    mockupAccent: '#b8a0ff',
    mockupImage: '/assets/img/portfolio5.jpg',
  },
  {
    name: 'IFF Research',
    description: 'Data analytics reporting platform for research insight delivery.',
    tags: ['React', '.NET Core', 'TypeScript'],
    type: 'Web App',
    year: '2021',
    mockupGradient: 'linear-gradient(135deg, #050505 0%, #0a1628 50%, #0d2137 100%)',
    mockupAccent: '#e02020',
    mockupImage: '/assets/img/portfolio6.jpg',
  },
  {
    name: 'Murge Eat',
    description: 'Food delivery app — real-time tracking, restaurant management, driver dispatch.',
    tags: ['React Native', 'Expo', 'Redux'],
    type: 'Mobile App',
    year: '2020',
    mockupGradient: 'linear-gradient(135deg, #1a0f00 0%, #2d1a00 50%, #3d2400 100%)',
    mockupAccent: '#82ff1f',
    mockupImage: '/assets/img/portfolio7.png',
  },
]

export const SERVICES = [
  {
    method: 'POST',
    endpoint: '/web-development',
    title: 'Web Development',
    description: 'Full-stack web apps with Next.js, React, and .NET Core. From architecture to deployment.',
    tech: ['Next.js', 'React', 'TypeScript', '.NET Core', 'Azure'],
    icon: '◈',
    accentColor: 'var(--lime)',
  },
  {
    method: 'GET',
    endpoint: '/mobile-apps',
    title: 'Mobile Development',
    description: 'Cross-platform iOS and Android with React Native and Expo. Production-grade, App Store ready.',
    tech: ['React Native', 'Expo', 'Redux', 'TypeScript'],
    icon: '▣',
    accentColor: 'var(--lavender)',
  },
  {
    method: 'PUT',
    endpoint: '/ui-ux-design',
    title: 'UI/UX Design',
    description: 'Design systems, wireframes, and prototypes in Figma. Design that speaks directly to developers.',
    tech: ['Figma', 'Adobe XD', 'Procreate', 'Photoshop'],
    icon: '◐',
    accentColor: 'var(--red)',
  },
]

export const TESTIMONIALS = [
  {
    quote: 'Riaz is energetic and passionate at what he does. Punctual and timely. His technical depth combined with a strong design eye makes him rare — someone who truly bridges both worlds.',
    author: 'Colleague',
    role: 'Senior Engineer',
    avatar: '/assets/img/t1.jpg',
  },
  {
    quote: 'Working with Riaz was a pleasure. He delivered features faster than expected and the code quality was exceptional. He took ownership of the entire frontend and ran with it.',
    author: 'Tech Lead',
    role: 'Engineering Manager',
    avatar: '/assets/img/t2.jpg',
  },
  {
    quote: 'Riaz has an incredible ability to take a vague brief and turn it into a polished product. His React Native work on our app was the cleanest mobile code I have reviewed.',
    author: 'Client',
    role: 'Product Owner',
    avatar: '/assets/img/t3.jpg',
  },
]
