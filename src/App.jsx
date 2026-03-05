import React from 'react'
import Navbar from './components/navbar'
import Hero from './components/hero'
import Features from './components/Features'
import Educational from './components/Educational'
import Pediatrician from './components/Pediatrician'
import Works from './components/works'
import Testimonial from './components/testimonial'
import Footer from './components/footer'

const App = () => {
  return (
    <>
    <Navbar />
    <Hero />
    <Features />
    <Educational />
    <Pediatrician />
    <Works />
    <Testimonial />
    <Footer />
    </>
  )
}

export default App