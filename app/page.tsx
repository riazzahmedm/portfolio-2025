'use client'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Nav from '@/components/layout/Nav'
import SideNav from '@/components/layout/SideNav'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Skills from '@/components/sections/Skills'
import Experience from '@/components/sections/Experience'
import Projects from '@/components/sections/Projects'
import Connect from '@/components/sections/Connect'
import Testimonials from '@/components/sections/Testimonials'
import Contact from '@/components/sections/Contact'
import SmoothScroll from '@/components/providers/SmoothScroll'
import Loader from '@/components/ui/Loader'
export default function Home() {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      <AnimatePresence mode="wait">
        {!loaded && <Loader key="loader" onComplete={() => setLoaded(true)} />}
      </AnimatePresence>
    <SmoothScroll>

      <Nav />
      <SideNav />

      <main className="snap-container">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Connect />
        <Testimonials />
        <Contact />
      </main>
    </SmoothScroll>
    </>
  )
}
