import React from 'react'
import nutrition from '../assets/nutrition.jpg'

const eductional = () => {

  const resources = [
    {
      title: 'Newborn Nutrition',
      description: 'Learn about the best nutrition practices for your newborn, including breastfeeding tips and formula feeding guidelines.',
      image: nutrition
    },
    {
      title: 'Sleep Training',
      description: 'Discover effective sleep training techniques to help your baby develop healthy sleep habits.',
      image: nutrition
    }
  ]
  return (
    <section className='education-section py-5'>
      <div className="container">

        <div className="text-center mb-4">
          <h2>
            Educational Resources
          </h2>
          <p className='text-muted'>
            learn essential newborn care tips and guidances from our experts.
          </p>
        </div>
        <div className="row g-4">
          {resources.map((item, index) => (
            <div className='col-md-4' key={index}>
              <div className="card education-card h-100 shadow-sm">
                <img src={item.image} className='card-img-top' alt={item.title} />
                <div className='card-body text-center'>
                  <h5 className='card-title'>{item.title}</h5>
                  <p className='card-text'>{item.description}</p>
                  <button className='btn btn-primary'>Learn More</button>
                </div>


              </div>

            </div>
          ))}

        </div>
      </div>

    </section>
  )
}

export default eductional