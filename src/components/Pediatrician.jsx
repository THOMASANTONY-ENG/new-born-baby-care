import React from 'react'
import doc1 from '../assets/doc1.jpg'
import doc2 from '../assets/doc2.jpg'
import doc3 from '../assets/doc3.jpeg'
import doc4 from '../assets/doc4.jpeg'
import doc5 from '../assets/doc5.jpeg'
import doc6 from '../assets/doc6.png'




const Pediatrician = () => {

    const doctors = [
        {
            name: 'Dr. John Doe',
            specialty: 'Pediatrician',
            image: doc1
        },
        {
            name: 'Dr. Jane Smith', 
            specialty: 'Pediatrician',
            image: doc2
        },
        {
            name: 'Dr. Robert Johnson',
            specialty: 'Pediatrician',
            image: doc3
        },
        {
            name: 'Dr. kim lee',
            specialty: 'Pediatrician',
            image: doc4
        },
        {
            name: 'Dr. annamma  mathew',
            specialty: 'Pediatrician',
            image: doc5
        },
        {
            name: 'Dr. Emily Davis',
            specialty: 'Pediatrician',
            image: doc6
        },
        
      ]
  return (
    <section className='pediatric-section py-5'>
      <div className='container text-center mb-5'>
        <h2>Our Pediatricians</h2>
        <p className='text-muted'>
          Connect with our experienced pediatricians for expert advice and support.
        </p>
      </div>
      <div className="doctor-slider">
        <div className="doctor-track">
          {[...doctors, ...doctors].map((doc, index) => (
            <div className="card doctor-card" key={index}>
              <img src={doc.image} className="card-img-top" alt={doc.name} />
              <div className="card-body text-center">
                <h5>{doc.name}</h5>
                <p>{doc.specialty}</p>
                <button className='btn btn-primary'>Book Appointment</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Pediatrician