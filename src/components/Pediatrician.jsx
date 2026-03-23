import React from 'react'
import { FaStar } from 'react-icons/fa'
import { doctors } from '../data/doctors'

const Pediatrician = () => {
  return (
    <section className='pediatrician-section py-5' id="pediatricians">
      <div className='container text-center mb-5'>
        <h2>Our Pediatricians</h2>
        <p className='text-muted'>
          Connect with our experienced pediatricians for expert advice and support.
        </p>
      </div>
      <div className="container doctor-slider-shell">
        <div className="doctor-slider">
          <div className="doctor-track">
            {[...doctors, ...doctors].map((doc, index) => (
              <div className="card doctor-card" key={index}>
                <img
                  src={doc.image}
                  loading="lazy"
                  className="card-img-top"
                  alt={doc.name}
                />
                <div className="card-body text-center">
                  <h5>{doc.name}</h5>
                  <p>{doc.specialty}</p>
                  <div className="rating ">
                    {Array.from({ length: 5 }, (_, i) => (
                      <FaStar
                        key={i}
                        color={i < Math.floor(doc.rating) ? "#ffc107" : "#e4e5e9"}
                      />
                    ))}
                    <span className="ms-2">{doc.rating}</span>
                  </div>
                  <button className='btn btn-primary mt-2'>Book Appointment</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Pediatrician
