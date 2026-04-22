import React from 'react'
import '../components/style/index.css'

const About = () => {
  return (
    <div className="about-page py-5">
      <div className="container">
        <div className="text-center mb-5">
          <span className="section-kicker">Our Story</span>
          <h1>About BabyBloom</h1>
          <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
            We believe that every parent deserves a calmer, more organized journey through their baby's first years.
          </p>
        </div>

        <div className="row g-5 align-items-center mb-5">
          <div className="col-lg-6">
            <div className="about-image-card">
               <img src="https://images.unsplash.com/photo-1544126592-807daa2b569b?auto=format&fit=crop&q=80&w=800" alt="Caring for baby" className="img-fluid rounded-4 shadow-lg" />
            </div>
          </div>
          <div className="col-lg-6">
            <div className="about-content">
              <h2 className="mb-4">Designed for the Modern Parent</h2>
              <p>
                BabyBloom was born from a simple observation: parenting is beautiful, but the administrative side of baby care—tracking vaccinations, scheduling appointments, and managing health notes—can be overwhelming.
              </p>
              <p>
                Our platform brings everything into one peaceful, secure space. Whether you're a first-time parent or a seasoned caregiver, BabyBloom provides the tools you need to stay organized and informed.
              </p>
              <div className="row g-4 mt-3">
                <div className="col-sm-6">
                  <div className="stat-item">
                    <h3 className="h1 text-primary mb-1">10k+</h3>
                    <p className="text-muted small mb-0">Happy Families</p>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="stat-item">
                    <h3 className="h1 text-accent mb-1">500+</h3>
                    <p className="text-muted small mb-0">Partner Doctors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 text-center mt-5">
          <div className="col-md-4">
             <div className="p-4 border rounded-4 bg-white h-100 shadow-sm">
                <h4 className="mb-3">Security First</h4>
                <p className="text-muted mb-0">Your baby's data is encrypted and secure, giving you total peace of mind.</p>
             </div>
          </div>
          <div className="col-md-4">
             <div className="p-4 border rounded-4 bg-white h-100 shadow-sm">
                <h4 className="mb-3">Expert Led</h4>
                <p className="text-muted mb-0">Our resources are curated by pediatric experts to ensure you get trusted advice.</p>
             </div>
          </div>
          <div className="col-md-4">
             <div className="p-4 border rounded-4 bg-white h-100 shadow-sm">
                <h4 className="mb-3">Always Simple</h4>
                <p className="text-muted mb-0">We prioritize simplicity so you can spend less time tracking and more time bonding.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
