import React from 'react'

const Footer = () => {
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
              <li><a href="#home">Home</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#works">How It Works</a></li>
              <li><a href="#testimonial">Reviews</a></li>
            </ul>
          </div>

          <div className="col-sm-6 col-lg-3">
            <h5>Support</h5>
            <ul className="footer-links">
              <li><a href="#pediatricians">Doctors</a></li>
              <li><a href="#education">Resources</a></li>
              <li><a href="#features">Vaccination Tracking</a></li>
              <li><a href="#footer">Contact</a></li>
            </ul>
          </div>

          <div className="col-lg-3">
            <h5>Contact</h5>
            <p className="footer-contact">support@babybloom.com</p>
            <p className="footer-contact">Mon to Sat, 9:00 AM to 7:00 PM</p>
            <a className="footer-pill" href="#pediatricians">Book a consultation</a>
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
