import { Col, Container, Row } from 'react-bootstrap'
import { FaArrowRight } from 'react-icons/fa6'
import type { TimelineItem } from '@/views/landing/components/types'

const timelineData: TimelineItem[] = [
  {
    year: 2021,
    title: 'Launch Phase',
    description: 'SmartAdmin WebApp was officially launched. It revolutionized the way users manage their tasks.',
  },
  {
    year: 2022,
    title: 'Feature Expansion',
    description: 'New features were added based on user feedback. Enhanced functionality led to increased user satisfaction.',
  },
  {
    year: 2023,
    title: 'Global Reach',
    description: 'SmartAdmin WebApp expanded its user base globally. We are committed to continuous improvement and innovation.',
  },
  {
    year: 2024,
    title: 'Future Innovations',
    description: 'We are excited to unveil new features and enhancements. Join us as we shape the future of productivity.',
  },
]

const Journey = () => {
  return (
    <section className="journey-section">
      <Container>
        <Row className="mb-5">
          <Col lg={6} className="pt-5">
            <span className="text-primary small text-uppercase fw-bold mb-2 d-block">Innovation</span>
            <h2 className="h1 fw-bold mb-3">Our Journey and Future Vision</h2>
            <p className="text-muted mb-4">Explore the timeline of SmartAdmin WebApp's evolution. Witness our milestones and future aspirations.</p>
            <div className="d-flex gap-3">
              <a href="#features" className="btn btn-outline-dark">
                Learn More
              </a>
              <a href="#contact" className="btn btn-link text-dark text-decoration-none">
                Contact Us <FaArrowRight className="fas fa-arrow-right ms-2" />
              </a>
            </div>
          </Col>
          <Col lg={6}>
            <div className="timeline">
              {timelineData.map((item, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <h3 className="h2 fw-bold">{item.year}</h3>
                    <h4 className="h5 fw-bold">{item.title}</h4>
                    <p className="text-muted">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default Journey
