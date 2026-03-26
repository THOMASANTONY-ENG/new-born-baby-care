import React from 'react'
import nutrition from '../assets/nutrition.jpg'
import hero1 from '../assets/hero1.jpg'
import doc1 from '../assets/doc1.jpg'
import doc6 from '../assets/doc6.png'

const Educational = () => {
  const resources = [
    {
      title: 'Newborn Nutrition',
      description: 'Learn breastfeeding basics, formula guidance, and healthy feeding routines for the first months.',
      image: nutrition
    },
    {
      title: 'Sleep Routine Tips',
      description: 'Build a gentle sleep schedule and understand how to support better rest for your baby.',
      image: hero1
    },
    {
      title: 'Vaccination Guide',
      description: 'Follow recommended vaccine timelines and understand what to expect during each visit.',
      image: doc6
    },
    {
      title: 'Baby Wellness Checks',
      description: 'Know when to schedule checkups, what signs to watch, and when to speak with a doctor.',
      image: doc1
    }
  ]

  return (
    <section className='education-section py-5' id="education">
      <div className="container">
        <div className="text-center mb-4">
          <span className="section-kicker">Trusted reading</span>
          <h2>Educational resources for calmer care decisions</h2>
          <p className='text-muted'>
            Learn the basics faster with practical topics parents come back to again and again.
          </p>
        </div>

        <div className="row g-4 justify-content-center align-items-stretch">
          {resources.map((item, index) => (
            <div className='col-md-6 col-xl-3 d-flex' key={index}>
              <div className="card education-card h-100 shadow-sm">
                <img src={item.image} className='card-img-top' alt={item.title} />
                <div className='card-body text-center'>
                  <h5 className='card-title'>{item.title}</h5>
                  <p className='card-text'>{item.description}</p>
                  <button className='btn btn-primary'>Open Resource</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Educational
