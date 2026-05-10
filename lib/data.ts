export const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Work', href: '#projects' },
  { label: 'Connect', href: '#connect' },
  { label: 'Testimonials', href: '#testimonials' },
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
  { name: 'React',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',              color: 'lime',     category: 'Web',    colSpan: 2},
  { name: 'Next.js',    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg',             invert: true, color: 'lime', category: 'Web', rowSpan: 2 },
  { name: 'JavaScript',  logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',    color: 'lime',     category: 'Web', colSpan: 2   },
  { name: 'TypeScript',  logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg',    color: 'lime',     category: 'Web'  },
  { name: 'Tailwind',    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg',  color: 'lime',     category: 'Web'  },
  { name: 'Redux',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redux/redux-original.svg',              color: 'lime',     category: 'Web'  },
  { name: '.NET Core',   logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dotnetcore/dotnetcore-original.svg',    color: 'lime',     category: 'Web'  },
  // Mobile
  { name: 'React Native',logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',             color: 'lavender', category: 'Mobile', colSpan: 2 },
  { name: 'Expo',        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/expo/expo-original.svg',                invert: true, color: 'lavender', category: 'Mobile', colSpan: 2 },
  { name: 'iOS',         logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/apple/apple-original.svg',              invert: true, color: 'lavender', category: 'Mobile' },
  { name: 'Android',     logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/android/android-original.svg',         color: 'lavender', category: 'Mobile' },
  { name: 'Azure',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg',             color: 'lavender', category: 'Mobile' },
  { name: 'Ionic',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ionic/ionic-original.svg',             color: 'lavender', category: 'Mobile' },
  // Design
  { name: 'Figma',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg',             color: 'red',      category: 'Design' },
  { name: 'Adobe XD',    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/xd/xd-original.svg',                   color: 'red',      category: 'Design' },
  { name: 'Photoshop',   logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/photoshop/photoshop-original.svg',     color: 'red',      category: 'Design' },
  { name: 'HTML5',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',             color: 'red',      category: 'Design' },
  { name: 'CSS3',        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',               color: 'red',      category: 'Design' },
  { name: 'Illustrator', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/illustrator/illustrator-original.svg', color: 'red',      category: 'Design' },
  // { name: 'Procreate',   logo: 'https://cdn.simpleicons.org/procreate/ffffff',                                                      color: 'red',      category: 'Design' },
]

// ── Experience ────────────────────────────────────────────────────────────────

export const EXPERIENCE = [
  {
    year: '2025',
    role: 'Senior Software Engineer',
    company: 'Feuji',
    current: true,
    tags: ['React', 'Typescript', '.NET Core', 'C#', 'Microservices'],
    points: [
      'Building web & mobile app for Sunny Benefits — a React platform serving employee benefits at scale',
      'Developing and maintaining the admin portal using React, .NET Core, C#, and microservice architecture',
      'Owning full-stack features end-to-end across consumer-facing apps and internal tooling',
      'Collaborating closely with product and design to ship polished, production-ready features fast',
    ],
  },
  {
    year: '2024',
    role: 'Software Engineer',
    company: 'ACS',
    current: false,
    tags: ['React', 'Redux', 'Next', '.NET Core', 'C#', 'Azure'],
    points: [
      'Developed dynamic web applications using React, Next.js, Redux, and Context API, focusing on responsive design and maintainable architecture',
      'Implemented performance optimization techniques such as codesplitting, lazy loading, memoization to significantly improve load times and ensure a smoother, high-performing user experience across web and mobile platforms.',
      'Integrated with HL7 (healthcare) and CODA (financial) systems to enable secure, seamless data exchange across regulated platforms.'
    ],
  },
  {
    year: '2021',
    role: 'Mobile App Developer',
    company: 'ACS',
    current: false,
    tags: ['React Native', 'Expo', 'Redux', 'Ionic', 'Javascript', 'TypeScript'],
    points: [
      'Developed and maintained multiple cross-platform mobile applications using React Native and Redux, delivering consistent performance across iOS and Android.',
      'Designed user interfaces and prototypes in Figma and Adobe XD for select projects, collaborating closely with stakeholders and design teams.',
      'Integrated REST, GraphQL APIs and ensured smooth mobile app performance across devices.'
    ],
  },
  {
    year: '2019',
    role: 'Mobile App Developer',
    company: 'MCT',
    current: false,
    tags: ['React Native', 'Ionic', 'JavaScript', 'Bootstrap'],
    points: [
      'Built hybrid mobile apps using React Native and Redux for B2B and consumer platforms.',
      'Delivered full-stack mobile solutions for a food delivery platform, including order tracking and real-time notifications',
      'Integrated REST APIs and native modules to expand app functionality and enhance user experience.'
    ],
  },
]

// ── Projects ──────────────────────────────────────────────────────────────────

export const PROJECTS = [
  {
    name: 'Oodle Finance',
    description: 'Car finance app serving thousands across the UK. App Store + Google Play.',
    tags: ['React Native', 'Expo', 'TypeScript', 'GraphQL', 'Context API'],
    type: 'Mobile App',
    year: '2024',
    mockupGradient: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)',
    mockupAccent: '#82ff1f',
    mockupImage: '/assets/img/portfolio19.jpeg',
    link: 'https://apps.apple.com/gb/app/oodle-finance/id1488756107',
  },
  {
    name: 'ACS Life',
    description: 'Hospitality management platform for enterprise clients with real-time dashboards.',
    tags: ['Next', 'React', '.NET Core', 'C#', 'Typescript', 'Context API', 'Azure'],
    type: 'Web App',
    year: '2023',
    mockupGradient: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)',
    mockupAccent: '#b8a0ff',
    mockupImage: '/assets/img/portfolio12.png',
    link: 'https://dribbble.com/shots/26065380-ACS-Life-End-to-End-Digital-Catering-Management-Solution',
  },
  {
    name: 'Dallah Healthcare',
    description: 'Dallah healthcare is a leading healthcare provider in Saudi Arabia.',
    tags: ['React', 'HL7', '.Net Core', 'C#', 'TypeScript', 'AbodeXD'],
    type: 'Web + Mobile',
    year: '2022',
    mockupGradient: 'linear-gradient(135deg, #003049 0%, #023e8a 50%, #0077b6 100%)',
    mockupAccent: '#e02020',
    mockupImage: '/assets/img/portfolio14.png',
    link: 'https://dribbble.com/shots/26065206-Dallah-Hospitals-Patient-Meal-Ordering',
  },
  {
    name: 'Millennium Unit 4 Financials by CODA',
    description: 'Console app for connecting P&O system with Unit4 Financials by CODA',
    tags: ['CODA', '.Net Core', 'C#', 'Console App', 'SOAP XML'],
    type: 'Console App',
    year: '2022',
    mockupGradient: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)',
    mockupAccent: '#82ff1f',
    mockupImage: '/assets/img/portfolio18.png',
    link: 'https://millenniumconsulting.com/unit4financialsbycoda/',
  },
  {
    name: 'P&O Ferries',
    description: 'Web and mobile apps for one of Europe\'s largest ferry operators.',
    tags: ['React', 'React Native', 'Ionic', 'Scandit', 'TypeScript', 'Sitecore', '.Net MVC'],
    type: 'Web + Mobile',
    year: '2022',
    mockupGradient: 'linear-gradient(135deg, #003049 0%, #023e8a 50%, #0077b6 100%)',
    mockupAccent: '#e02020',
    mockupImage: '/assets/img/portfolio9.png',
    link: 'https://dribbble.com/shots/26048546-P-0-Ferries-Advanced-Passenger-Information',
  },
  {
    name: 'MidiUnderground',
    description: 'Radio station platform — live streaming, show scheduling, listener analytics.',
    tags: ['React', 'React Native', 'Redux'],
    type: 'Web + Mobile',
    year: '2022',
    mockupGradient: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)',
    mockupAccent: '#b8a0ff',
    mockupImage: '/assets/img/portfolio7.png',
    link: 'https://dribbble.com/shots/26054127-MIDI-Underground',
  },
  {
    name: 'Onboarding Hub',
    description: 'Streamlined HR onboarding workflows for enterprise teams.',
    tags: ['Next.js', 'TypeScript', 'Azure'],
    type: 'Web App',
    year: '2021',
    mockupGradient: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)',
    mockupAccent: '#b8a0ff',
    mockupImage: '/assets/img/portfolio15.jpg',
    link: 'https://dribbble.com/shots/26065000-Onboarding-Hub',
  },
  {
    name: 'IFF Research',
    description: 'Data analytics reporting platform for research insight delivery.',
    tags: ['React', '.NET Core', 'TypeScript'],
    type: 'Web App',
    year: '2021',
    mockupGradient: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)',
    mockupAccent: '#82ff1f',
    mockupImage: '/assets/img/portfolio17.png',
    link: 'https://www.iffresearch.com/',
  },
  {
    name: 'Murge Eat',
    description: 'Food delivery app — real-time tracking, restaurant management, driver dispatch.',
    tags: ['React Native', 'Expo', 'Redux'],
    type: 'Mobile App',
    year: '2020',
     mockupGradient: 'linear-gradient(135deg, #003049 0%, #023e8a 50%, #0077b6 100%)',
    mockupAccent: '#e02020',
    mockupImage: '/assets/img/portfolio16.jpg',
    link: 'https://dribbble.com/shots/26048749-Murge-Eat-Mobile-App'
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
