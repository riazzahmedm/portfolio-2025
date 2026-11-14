/** Extra pieces some stories carry beyond their text, keyed by the post's slug. */
export interface Flythrough {
  href:  string   // the full-screen page
  title: string
  blurb: string
  cta:   string
  image?: string  // a preview picture for the card
}

export const FLYTHROUGHS: Record<string, Flythrough> = {
  'everest-base-camp-2026': {
    href:  '/flythrough/ebc',
    title: 'Fly the trail',
    blurb: 'Scroll the Everest Base Camp trail in 3D: nine days on the trail, from Lukla to the painted rock at Base Camp and back.',
    cta:   'Start the flythrough',
    image: '/flythrough/ebc-preview.jpg',
  },
}
