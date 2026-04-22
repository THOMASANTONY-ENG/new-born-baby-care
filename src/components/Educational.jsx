import React from 'react'
import { getAvailableResources } from '../utils/resources'
import { getLoggedInUser, navigateTo } from '../utils/navigation'

const Educational = () => {
  const resources = getAvailableResources()

  const handleOpenResource = (resource) => {
    if (resource.link) {
      window.open(resource.link, '_blank', 'noopener,noreferrer')
      return
    }
    const user = getLoggedInUser()
    navigateTo(user ? '/dashboard/resources' : '/register')
  }

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
          {resources.map((item) => (
            <div className='col-md-6 col-xl-3 d-flex' key={item.id}>
              <div className="card education-card h-100 shadow-sm">
                <img src={item.image} className='card-img-top' alt={item.title} />
                <div className='card-body text-center'>
                  <h5 className='card-title'>{item.title}</h5>
                  <p className='card-text'>{item.description}</p>
                  <p className="small text-muted mb-3">{item.audience}</p>
                  {item.link ? (
                    <a className='btn btn-primary' href={item.link} target="_blank" rel="noopener noreferrer">Learn More</a>
                  ) : (
                    <button className='btn btn-primary' onClick={() => handleOpenResource(item)}>Learn More</button>
                  )}
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
