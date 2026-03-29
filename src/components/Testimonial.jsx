import React from 'react'
import { Card, Carousel, Col, Container, Row } from 'react-bootstrap'
import { FaStar } from 'react-icons/fa'
import './style/index.css'
import { getPublicFeedbackEntries } from '../utils/feedback'

const Testimonial = () => {
  const testimonials = getPublicFeedbackEntries()

  const createGroups = (items, size) => {
    const groups = []
    for (let index = 0; index < items.length; index += size) {
      groups.push(items.slice(index, index + size))
    }
    return groups
  }

  const desktopTestimonials = createGroups(testimonials, 4)
  const tabletTestimonials = createGroups(testimonials, 2)
  const mobileTestimonials = createGroups(testimonials, 1)

  const renderCarousel = (groups, columnProps, extraClass = '') => (
    <Carousel
      className={`testimonial-carousel ${extraClass}`.trim()}
      interval={3000}
      controls={groups.length > 1}
      indicators={groups.length > 1}
      pause={false}
      touch
    >
      {groups.map((group, slideIndex) => (
        <Carousel.Item key={slideIndex}>
          <Row className="g-4 justify-content-center align-items-stretch mx-0">
            {group.map((item) => (
              <Col key={item.id} {...columnProps} className="d-flex">
                <Card className="testimonial-card h-100">
                  <Card.Body className="d-flex flex-column">
                    <div className="testimonial-rating mb-3">
                      {Array.from({ length: item.rating }).map((_, starIndex) => (
                        <FaStar key={starIndex} />
                      ))}
                    </div>
                    <Card.Text className="testimonial-feedback flex-grow-1">
                      "{item.feedback}"
                    </Card.Text>
                    <h5 className="testimonial-name mb-0">{item.name}</h5>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Carousel.Item>
      ))}
    </Carousel>
  )

  return (
    <section className="testimonial-section py-5" id="testimonial">
      <Container>
        <div className="text-center mb-5">
          <span className="section-kicker">Parent feedback</span>
          <h2 className="testimonial-title">What families value most about BabyBloom</h2>
          <p className="testimonial-subtitle">
            Real feedback from families using BabyBloom to keep routines, milestones, and health updates organized.
          </p>
        </div>

        <div className="d-none d-xl-block">
          {renderCarousel(desktopTestimonials, { xs: 12, md: 6, xl: 3 })}
        </div>

        <div className="d-none d-md-block d-xl-none">
          {renderCarousel(tabletTestimonials, { xs: 12, md: 6 }, 'testimonial-carousel-tablet')}
        </div>

        <div className="d-md-none">
          {renderCarousel(mobileTestimonials, { xs: 12 }, 'testimonial-carousel-mobile')}
        </div>
      </Container>
    </section>
  )
}

export default Testimonial
