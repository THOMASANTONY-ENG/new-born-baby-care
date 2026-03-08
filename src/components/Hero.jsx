import React from 'react'
import './style/index.css'
import hero1 from '../assets/hero1.jpg'

const Hero = () => {
  return (
    <section className="hero">

      <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel">

        <div className="carousel-indicators">
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" className="active"></button>
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1"></button>
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2"></button>
        </div>

        <div className="carousel-inner">

          {/* Slide 1 */}
          <div className="carousel-item active">
            <img className="d-block w-100" src={hero1} alt="First slide" />

            <div className="carousel-caption hero-text ">
              <h1>Newborn Care Management System</h1>
              <p>
                Helping parents track baby health, vaccination schedules,
                and connect with pediatricians easily.
              </p>

              <div className="hero-buttons">
                <button className="btn-primary">Get Started</button>
                <button className="btn-secondary">Learn More</button>
              </div>
            </div>

          </div>

          {/* Slide 2 */}
          <div className="carousel-item">
            <img className="d-block w-100" src={hero1} alt="Second slide" />

            <div className="carousel-caption hero-text ">
              <h1>Track Baby Health Easily</h1>
              <p>
                Manage vaccination schedules and monitor your baby's
                growth and development.
              </p>

              <div className="hero-buttons">
                <button className="btn-primary">Start Tracking</button>
                <button className="btn-secondary">Learn More</button>
              </div>
            </div>

          </div>

          {/* Slide 3 */}
          <div className="carousel-item">
            <img className="d-block w-100" src={hero1} alt="Third slide" />

            <div className="carousel-caption hero-text ">
              <h1>Connect with Pediatricians</h1>
              <p>
                Get expert advice from certified doctors and
                ensure the best care for your newborn.
              </p>

              <div className="hero-buttons">
                <button className="btn-primary">Find Doctor</button>
                <button className="btn-secondary">Contact Us</button>
              </div>
            </div>

          </div>

        </div>

        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
          <span className="carousel-control-prev-icon"></span>
        </button>

        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
          <span className="carousel-control-next-icon"></span>
        </button>

      </div>

    </section>
  )
}

export default Hero