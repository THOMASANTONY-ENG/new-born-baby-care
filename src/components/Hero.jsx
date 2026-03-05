import React from 'react'
import './style/index.css'
import hero1 from '../assets/hero1.jpg'

const hero = () => {
  return (
     <section className="hero">
       <img className='hero-image' src={hero1} alt="Hero" />

      <div className="hero-text">
        <h1>Newborn Care Management System</h1>

        <div className="carousel-description">
          <p>
          Helping parents track baby health, vaccination schedules,
          and connect with pediatricians easily.
        </p>
        </div>

        <div className="hero-buttons">
          <button className="btn-primary">Get Started</button>
          <button className="btn-secondary">Learn More</button>
        </div>
      </div>


    </section>
  )
}

export default hero