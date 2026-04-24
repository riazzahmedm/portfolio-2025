'use client'
import Nav from '@/components/layout/Nav'
import SideNav from '@/components/layout/SideNav'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Skills from '@/components/sections/Skills'
import Experience from '@/components/sections/Experience'
import Projects from '@/components/sections/Projects'
import Services from '@/components/sections/Services'
import Testimonials from '@/components/sections/Testimonials'
import Contact from '@/components/sections/Contact'
import SmoothScroll from '@/components/providers/SmoothScroll'
import { useCursor } from '@/hooks/useCursor'

export default function Home() {
  useCursor()

  return (
    <SmoothScroll>
      {/* Custom cursor */}
      <div className="cursor" />
      <div className="cursor-ring" />

      <Nav />
      <SideNav />

      <main className="snap-container">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Services />
        <Testimonials />
        <Contact />
      </main>
    </SmoothScroll>
  )
}
