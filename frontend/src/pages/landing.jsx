import React from 'react'
import Header from '../components/home/Header'
import Hero from '../components/home/Hero'
import Features from '../components/home/Features'
import HowItWorks from '../components/home/HowItWorks'
import CTA from '../components/home/CTA'
import About from '../components/home/About'
import Footer from '../components/home/Footer'

const landing = () => {
  return (
    <div>
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <About />
      <CTA />
      <Footer />
      </div>
  )
}

export default landing