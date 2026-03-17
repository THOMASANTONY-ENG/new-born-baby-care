import React from 'react'
import doc1 from '../assets/doc1.jpg'
import doc2 from '../assets/doc2.jpg'
import doc3 from '../assets/doc3.jpeg'
import doc4 from '../assets/doc4.jpeg'
import doc5 from '../assets/doc5.jpeg'
import doc7 from '../assets/doc7.png'
import { FaStar } from 'react-icons/fa'




const Pediatrician = () => {

  const doctors = [
    {
      name: 'Dr. John Doe',
      specialty: 'Pediatrician',
      image: doc1,
      rating: 4.5
    },
    {
      name: 'Dr. Jane Smith',
      specialty: 'Pediatrician',
      image: doc2,
      rating: 4.8
    },
    {
      name: 'Dr. Robert Johnson',
      specialty: 'Pediatrician',
      image: doc3,
      rating: 4.7
    },
    {
      name: 'Dr. kim lee',
      specialty: 'Pediatrician',
      image: doc4,
      rating: 4.6
    },
    {
      name: 'Dr. annamma  mathew',
      specialty: 'Pediatrician',
      image: doc5,
      rating: 5.0
    },
    {
      name: 'Dr. Abhinav p',
      specialty: 'gynecologist',
      image: doc7,
      rating: 5.0
    },

  ]
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
