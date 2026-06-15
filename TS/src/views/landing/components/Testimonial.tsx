import { Col, Container, Row } from 'react-bootstrap'

const Testimonial = () => {
  return (
    <section className="testimonial-section">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <div className="d-flex justify-content-center mb-3">
              <span className="fs-3">⭐⭐⭐⭐⭐</span>
            </div>
            <p className="lead mb-4">
              "SmartAdmin has transformed how we manage our business. The AI-powered insights have been game-changing for our decision-making
              process."
            </p>
            <div className="d-flex justify-content-center align-items-center gap-3">
              <img src="img/demo/avatars/avatar-a.png" alt="John Smith" className="rounded-circle" width="40" />
              <span>John Smith, CEO at TechCorp</span>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default Testimonial
