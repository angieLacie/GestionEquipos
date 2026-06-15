import { Col, Container, Row } from 'react-bootstrap'

import landing4 from '@/assets/img/landing/4.png'

const Demo = () => {
  return (
    <section id="demo" className="demo-section">
      <Container>
        <div className="text-center mb-5">
          <h2 className="display-6 fw-700 mb-3">See It In Action</h2>
          <p className="lead text-muted">Experience the power of SmartAdmin firsthand</p>
        </div>
        <Row>
          <Col lg={8} className="mx-auto">
            <div className="demo-window">
              <div className="demo-window-content">
                <img src={landing4} alt="Dashboard Preview" className="img-fluid" />
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default Demo
