import { PROJECTS, workSlug } from './data'

/**
 * Case studies are the long form of the project cards on the home page. The
 * facts (name, year, stack, links and the one-line summary) come from
 * PROJECTS; the brief and the build notes live here so the home page stays a
 * card grid and the detail page can say more.
 */
export type CaseStudy = {
  slug: string
  name: string
  year: string
  type: string
  summary: string
  brief: string
  built: string[]
  stack: string[]
  link?: string
  image: string
  accent: string
  gradient: string
}

const DETAILS: Record<string, { brief: string; built: string[] }> = {
  'Oodle Finance': {
    brief:
      'A car finance app used by customers across the UK to check eligibility and manage an agreement, shipped to both app stores.',
    built: [
      'React Native app on Expo, released to the App Store and Google Play',
      'GraphQL data layer typed end to end in TypeScript',
      'Shared application state through Context API',
      'Release build and store submission handled through Expo',
    ],
  },
  'ACS Life': {
    brief:
      'A hospitality management platform for enterprise catering clients, with dashboards that have to stay current while the service is running.',
    built: [
      'Next and React front end over .NET Core services on Azure',
      'Real-time dashboards for live service and order state',
      'TypeScript across the client, C# across the API',
      'Design delivered alongside the build as the product took shape',
    ],
  },
  'Dallah Healthcare': {
    brief:
      'Patient meal ordering for a healthcare provider in Saudi Arabia, where the menu has to respect clinical rules as well as taste.',
    built: [
      'Web and mobile ordering flows for patients and ward staff',
      'HL7 integration so dietary and patient data stays in step with hospital systems',
      'React front end over .NET Core and C# services',
      'Interface design in Adobe XD before implementation',
    ],
  },
  'Millennium Unit 4 Financials by CODA': {
    brief:
      'A connector between a P&O system and Unit4 Financials by CODA, moving financial records between two systems that were never designed to talk.',
    built: [
      '.NET Core console service running as the scheduled integration',
      'SOAP XML mapping between the P&O records and the CODA schema',
      'Failure handling for records that could not be mapped cleanly',
    ],
  },
  'P&O Ferries': {
    brief:
      "Web and mobile applications for one of Europe's largest ferry operators, including passenger information across the crossing.",
    built: [
      'React web app and React Native and Ionic mobile clients from one content model',
      'Scandit barcode scanning for boarding and passenger checks',
      'Sitecore and .NET MVC serving the shared content to every client',
    ],
  },
  MidiUnderground: {
    brief: 'A platform for a radio station: listening live, knowing what is on, and seeing who is listening.',
    built: [
      'Live streaming player on web and mobile',
      'Show scheduling so listeners can plan around the timetable',
      'Listener analytics for the station team',
      'Redux state shared across React and React Native clients',
    ],
  },
  'Onboarding Hub': {
    brief: 'Internal tooling that turns HR onboarding from a checklist in a spreadsheet into a workflow teams can run.',
    built: [
      'Configurable onboarding workflows instead of a fixed form',
      'Next.js and TypeScript front end hosted on Azure',
      'One place for new starters and the teams receiving them',
    ],
  },
  'IFF Research': {
    brief: 'A reporting platform that turns research data into insight the client teams can present themselves.',
    built: [
      'React reporting interface over .NET Core APIs',
      'TypeScript across the client, with report views built for non-technical readers',
      'Data delivery running alongside the existing research process',
    ],
  },
  'Murge Eat': {
    brief: 'A food delivery app covering the whole loop: the customer ordering, the restaurant accepting, the driver delivering.',
    built: [
      'React Native app on Expo for customers and drivers',
      'Real-time order tracking from kitchen to door',
      'Restaurant-side management for menu and incoming orders',
      'Driver dispatch and delivery state in Redux',
    ],
  },
}

export const CASE_STUDIES: CaseStudy[] = PROJECTS.map(p => {
  const detail = DETAILS[p.name]
  return {
    slug: workSlug(p.name),
    name: p.name,
    year: p.year,
    type: p.type,
    summary: p.description,
    brief: detail?.brief ?? p.description,
    built: detail?.built ?? [],
    stack: p.tags,
    link: p.link,
    image: p.mockupImage,
    accent: p.mockupAccent,
    gradient: p.mockupGradient,
  }
}).filter(c => c.built.length > 0)

export function getCaseStudy(slug: string) {
  return CASE_STUDIES.find(c => c.slug === slug)
}

/** The next case study in card order, wrapping at the end. */
export function getNextCaseStudy(slug: string) {
  const i = CASE_STUDIES.findIndex(c => c.slug === slug)
  if (i === -1) return undefined
  return CASE_STUDIES[(i + 1) % CASE_STUDIES.length]
}
