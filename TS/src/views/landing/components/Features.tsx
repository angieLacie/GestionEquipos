import { Col, Container, Row } from 'react-bootstrap'

import landing1 from '@/assets/img/landing/1.png'
import landing2 from '@/assets/img/landing/2.png'
import landing3 from '@/assets/img/landing/3.png'

const features = [
  {
    image: landing1,
    title: 'Smart Dashboard',
    description: 'Intuitive interface with real-time analytics and customizable widgets.',
  },
  {
    image: landing2,
    title: 'Advanced Analytics',
    description: 'Comprehensive reporting tools with AI-powered insights.',
  },
  {
    image: landing3,
    title: 'Workflow Automation',
    description: 'Streamline processes with intelligent automation tools.',
  },
]

const Features = () => {
  return (
    <section id="features" className="features-section">
      <Container>
        <div className="text-center mb-5">
          <h2 className="display-6 fw-700 mb-3">Powerful Features</h2>
          <p className="lead text-muted">Everything you need to manage your business efficiently</p>
        </div>
        <Row className="g-4">
          {features.map((feature, idx) => (
            <Col md={6} lg={4} key={idx}>
              <div className="feature-card">
                <div className="feature-image mb-4">
                  <img src={feature.image} alt={feature.title} className="img-fluid rounded-4" />
                </div>
                <h3 className="h4 fw-700 mb-3">{feature.title}</h3>
                <p className="text-muted">{feature.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

export default Features
