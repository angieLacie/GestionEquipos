import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router'

const Contact = () => {
  return (
    <section id="contact" className="contact-section">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} className="text-center">
            <h2 className="h1 fw-bold mb-3">Ready to Get Started?</h2>
            <p className="lead text-muted mb-4">Join thousands of businesses already using SmartAdmin to transform their workflow.</p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="" className="btn btn-primary btn-lg px-4">
                Start Free Trial
              </Link>
              <Link to="" className="btn btn-outline-dark btn-lg px-4">
                Contact Sales
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default Contact
