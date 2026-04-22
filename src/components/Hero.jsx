import React, { useState } from 'react'
import { Carousel } from 'react-bootstrap'
import './style/index.css'
import hero1 from '../assets/hero1.jpg'
import { navigateTo, getLoggedInUser } from '../utils/navigation'

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const loggedInUser = getLoggedInUser()

  const slides = [
    {
      image: hero1,
      title: 'Simple newborn care tracking for everyday parenting',
      description: 'Follow feeding, growth, vaccination, and health updates from one calm and easy dashboard.',
      primaryAction: loggedInUser 
        ? { label: 'Enter Dashboard', href: '/dashboard' }
        : { label: 'Create Account', href: '/register' },
      secondaryAction: { label: 'Learn More', href: '#education' }
    },
    {
      image: hero1,
      title: 'Helpful guidance for routines, sleep, and baby nutrition',
      description: 'Read practical resources and stay organized with reminders that support your daily care routine.',
      primaryAction: { label: 'View Resources', href: '#education' },
      secondaryAction: { label: 'How It Works', href: '#works' }
    },
    {
      image: hero1,
      title: 'Connect with trusted doctors when you need support',
      description: 'Find pediatric guidance quickly and keep your baby health records ready in one place.',
      primaryAction: { label: 'Meet Doctors', href: '#pediatricians' },
      secondaryAction: { label: 'Read Reviews', href: '#testimonial' }
    }
  ]

  const handleAction = (event, href) => {
    event.preventDefault()
    if (href.startsWith('#')) {
      // Push hash to URL so App.jsx useEffect scroll handler fires
      window.location.hash = href.slice(1)
    } else {
      navigateTo(href)
    }
  }

  const handleSelect = (selectedIndex) => {
    setActiveIndex(selectedIndex)
  }

  return (
    <section className="hero" id="home">
      <Carousel
        id="heroCarousel"
        className="hero-carousel"
        activeIndex={activeIndex}
        onSelect={handleSelect}
        interval={3500}
        controls={slides.length > 1}
        indicators={slides.length > 1}
        touch
      >
        {slides.map((slide) => (
          <Carousel.Item key={slide.title}>
              <img className="d-block w-100" src={slide.image} alt={slide.title} />
              <div className="hero-overlay"></div>

              <div className="hero-content-wrap">
                <div className="container hero-content-container">
                  <div className="hero-simple-copy">
                    <h1>{slide.title}</h1>
                    <p>{slide.description}</p>

                    <div className="hero-buttons">
                      <a
                        className="hero-btn btn-primary"
                        href={slide.primaryAction.href}
                        onClick={(event) => handleAction(event, slide.primaryAction.href)}
                      >
                        {slide.primaryAction.label}
                      </a>
                      <a
                        className="hero-btn btn-secondary"
                        href={slide.secondaryAction.href}
                        onClick={(event) => handleAction(event, slide.secondaryAction.href)}
                      >
                        {slide.secondaryAction.label}
                      </a>
                    </div>

                    <div className="hero-highlights" aria-label="BabyBloom highlights">
                      <span>Vaccines and visits</span>
                      <span>Growth tracking</span>
                      <span>Trusted guidance</span>
                    </div>
                  </div>
                </div>
              </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </section>
  )
}

export default Hero
