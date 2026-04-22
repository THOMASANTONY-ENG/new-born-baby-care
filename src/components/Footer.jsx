import React from 'react'
import { Link } from 'react-router-dom'
import { getLoggedInUser, navigateTo } from '../utils/navigation'

const Footer = () => {
  const handleBookConsultation = (event) => {
    event.preventDefault()
    const user = getLoggedInUser()
    navigateTo(user ? '/dashboard/appointment' : '/register')
  }
  return (
    <footer className="site-footer" id="footer">
      <div className="container">
        <div className="row g-4 align-items-start">
          <div className="col-lg-4">
            <div className="footer-brand">
              <span className="brand-mark">BB</span>
              <div>
                <span className="section-kicker section-kicker-light">BabyBloom</span>
                <h3>BabyBloom</h3>
                <p>
                  A calmer digital home for baby health routines, expert guidance, and everyday parenting milestones.
                </p>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-lg-2">
            <h5>Explore</h5>
            <ul className="footer-links">
              <li><Link to="/#home">Home</Link></li>
              <li><Link to="/#features">Features</Link></li>
              <li><Link to="/#works">How It Works</Link></li>
              <li><Link to="/#testimonial">Reviews</Link></li>
            </ul>
          </div>

          <div className="col-sm-6 col-lg-3">
            <h5>Support</h5>
            <ul className="footer-links">
              <li><Link to="/#pediatricians">Doctors</Link></li>
              <li><Link to="/#education">Resources</Link></li>
              <li><Link to="/#features">Vaccination Tracking</Link></li>
              <li><Link to="/#footer">Contact</Link></li>
            </ul>
          </div>

          <div className="col-lg-3">
            <h5>Contact</h5>
            <p className="footer-contact">support@babybloom.com</p>
            <p className="footer-contact">Mon to Sat, 9:00 AM to 7:00 PM</p>
            <a className="footer-pill" href="#" onClick={handleBookConsultation}>Book a consultation</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>BabyBloom</span>
          <span>Designed for modern newborn care</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
