/** Extra pieces some stories carry beyond their text, keyed by the post's slug. */
export interface Flythrough {
  href:  string   // the full-screen page
  title: string
  blurb: string
  cta:   string
}

export const FLYTHROUGHS: Record<string, Flythrough> = {
  'everest-base-camp-2026': {
    href:  '/flythrough/ebc',
    title: 'Fly the route',
    blurb: 'Scroll through the trek in 3D: 13 days, from Lukla to the painted rock at Base Camp.',
    cta:   'Start the flythrough',
  },
}
