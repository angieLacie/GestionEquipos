import { Button, Col, Container, Row } from 'react-bootstrap'

import landing5 from '@/assets/img/landing/5.png'
import { Link } from 'react-router'

const NewsLetter = () => {
  return (
    <section className="newsletter-section">
      <Container>
        <Row className="align-items-center">
          <Col lg={6}>
            <h2 className="h1 fw-bold mb-3">Stay Updated with SmartAdmin</h2>
            <p className="text-muted mb-4">Join our newsletter for exclusive updates, helpful tips, and the latest news from SmartAdmin.</p>
            <form className="newsletter-form">
              <div className="d-flex flex-shrink mb-2">
                <input type="email" className="form-control" placeholder="Your Email Here" required />
                <Button variant="dark" type="submit" className="flex-shrink-0 px-4">
                  Subscribe Now
                </Button>
              </div>
              <small className="text-muted">
                By clicking Subscribe Now, you agree to our{' '}
                <Link to="" className="text-decoration-none">
                  Terms and Conditions
                </Link>
                .
              </small>
            </form>
          </Col>

          <Col lg={4} className="offset-lg-2">
            <img src={landing5} alt="Newsletter" className="img-fluid rounded-4" />
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default NewsLetter
