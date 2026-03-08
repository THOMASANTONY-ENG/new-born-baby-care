import React from 'react'

const Features = () => {
  return (
    <section className="features">

      <h2 className="features-title">Our Features</h2>

      <p className="features-description">
        Powerful tools designed to help parents monitor baby health,
        track vaccinations, and connect with pediatricians easily.
      </p>

      <div className="features-grid">

        <div className="feature-card">
          <h3>Vaccination Tracking</h3>
          <p>Keep track of your baby's vaccination schedule and get reminders.</p>
        </div>

        <div className="feature-card">
          <h3>Pediatrician Consultation</h3>
          <p>Connect with experienced pediatricians for expert advice.</p>
        </div>

        <div className="feature-card">
          <h3>Health Records</h3>
          <p>Maintain digital records of your baby's growth and health history.</p>
        </div>

        <div className="feature-card">
          <h3>Parenting Guidance</h3>
          <p>Access useful tips and resources for newborn care.</p>
        </div>

      </div>

    </section>
  )
}

export default Features