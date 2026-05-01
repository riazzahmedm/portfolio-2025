export const NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Work', href: '#projects' },
  { label: 'Connect', href: '#connect' },
  { label: 'Say hi', href: '#contact' },
]

export const SECTIONS = ['hero','about','skills','experience','projects','connect','testimonials','contact']

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

export const TECH_JOKES = [
  { text: 'Dark mode is a right, not a feature', lang: 'BATMAN' },
  { text: 'git blame → it was the Joker', lang: 'GIT' },
  { text: '// TODO: sleep', lang: 'BRUCE' },
  { text: 'it works on my machine™', lang: 'PROD' },
  { text: 'undefined is not a function', lang: 'JS' },
  { text: 'Why do we fall sir? To fix the merge conflict.', lang: 'ALFRED' },
]

// ── About ─────────────────────────────────────────────────────────────────────

export const ABOUT_BIG_TEXT =
  'SHIPS BEFORE MONDAY · REACT IS HOME · NO LOREM IPSUM IN GOTHAM · BUILT THINGS PEOPLE ACTUALLY USE · DARK MODE OR NOTHING · '

export const ABOUT_TICKER = [
  'GIT COMMIT -M "FINAL FINALLY v4"', '<>', 'DESIGN IS NEVER DONE', '</>', 'REACT NATIVE SURVIVOR', '{}',
  'THE NIGHT IS DARKEST BEFORE DEPLOY', '!==', 'THE GAP BETWEEN GOOD AND GREAT', ';', 'MOBILE FIRST ALWAYS', '===',
  'CHENNAI → GOTHAM → GLOBAL', '*', 'NAMED MY VARIABLES WELL (MOSTLY)', '||',
]

// ── Skills ────────────────────────────────────────────────────────────────────

export type BentoSkill = {
  name: string
  logo: string
  invert?: boolean
  color: 'lime' | 'lavender' | 'red'
  category: 'Web' | 'Mobile' | 'Design'
  colSpan?: number
  rowSpan?: number
}

export const BENTO_SKILLS: BentoSkill[] = [
  // Web
  { name: 'React',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',              color: 'lime',     category: 'Web',    colSpan: 2, rowSpan: 2 },
  { name: 'Next.js',    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg',             invert: true, color: 'lime', category: 'Web' },
  { name: 'TypeScript',  logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg',    color: 'lime',     category: 'Web'  },
  { name: 'Tailwind',    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg',  color: 'lime',     category: 'Web'  },
  { name: 'Redux',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redux/redux-original.svg',              color: 'lime',     category: 'Web'  },
  { name: '.NET Core',   logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dotnetcore/dotnetcore-original.svg',    color: 'lime',     category: 'Web'  },
  // Mobile
  { name: 'React Native',logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',             color: 'lavender', category: 'Mobile', colSpan: 2 },
  { name: 'Expo',        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/expo/expo-original.svg',                invert: true, color: 'lavender', category: 'Mobile' },
  { name: 'iOS',         logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/apple/apple-original.svg',              invert: true, color: 'lavender', category: 'Mobile' },
  { name: 'Android',     logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/android/android-original.svg',         color: 'lavender', category: 'Mobile' },
  { name: 'Azure',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg',             color: 'lavender', category: 'Mobile' },
  { name: 'Ionic',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ionic/ionic-original.svg',             color: 'lavender', category: 'Mobile' },
  // Design
  { name: 'Figma',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg',             color: 'red',      category: 'Design', rowSpan: 2 },
  { name: 'Adobe XD',    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/xd/xd-original.svg',                   color: 'red',      category: 'Design' },
  { name: 'Photoshop',   logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/photoshop/photoshop-original.svg',     color: 'red',      category: 'Design' },
  { name: 'HTML5',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',             color: 'red',      category: 'Design' },
  { name: 'CSS3',        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',               color: 'red',      category: 'Design' },
  { name: 'Illustrator', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/illustrator/illustrator-original.svg', color: 'red',      category: 'Design' },
]

// ── Experience ────────────────────────────────────────────────────────────────

export const EXPERIENCE = [
  {
    year: '2025',
    role: 'Senior Software Engineer',
    company: 'Feuji',
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
    year: '2024',
    role: 'Software Engineer',
    company: 'ACS',
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
    year: '2021',
    role: 'Mobile App Developer',
    company: 'ACS',
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
    role: 'Mobile App Developer',
    company: 'MobileCRM Technologies',
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

// ── Projects ──────────────────────────────────────────────────────────────────

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

// ── Testimonials ──────────────────────────────────────────────────────────────

export const FAKE_MESSAGES = [
  { from: 'client_007',  time: '1w ago',  text: 'I would love to get your feedback on this!' },
  { from: 'ex_teammate', time: '2w ago',  text: 'Would you write me a testimonial? I already wrote yours. It was glowing. Just saying.' },
  { from: 'old_manager',  time: '2d ago',  text: 'Hey! Just checking if you got my reference request… and the one before that 🙃' },
  { from: 'homelander',  time: '1mo ago', text: 'We all need you. Please respond.' },
]

// ── Contact ───────────────────────────────────────────────────────────────────

export const TERMINAL_LINES = [
  { type: 'cmd' as const,     text: 'alter-ego --reveal' },
  { type: 'success' as const, text: 'Riaz Ahmed · Your Friendly Neighborhood Dev' },
  { type: 'cmd' as const,     text: 'thwip --locate riaz' },
  { type: 'dim' as const,     text: 'Swinging in from Earth 616, Chennai, India...' },
  { type: 'success' as const, text: '✓ Landed. Available for new missions.' },
  { type: 'cmd' as const,     text: 'cat spidey-sense.json' },
  { type: 'out' as const,     text: '{ "email": "riazzahmedm@gmail.com",' },
  { type: 'out' as const,     text: '  "signal": "tingling — you need a dev",' },
  { type: 'out' as const,     text: '  "status": "mask off, ready to build" }' },
]
