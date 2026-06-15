import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router'
import BackgroundAnimation from '@/components/BackgroundAnimation'
import PageMeta from '@/components/PageMeta.tsx'

const page = () => {
  return (
    <>
      <PageMeta title={'Error 500'} />
      <section className="hero-section position-relative overflow-hidden">
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <Row className="justify-content-center">
            <Col xs={11} md={8} lg={6} xl={4}>
              <div className="login-card p-4 p-md-6 bg-dark bg-opacity-50 translucent-dark rounded-4 text-center">
                <h1 className="display-1 fw-bold text-white mb-3">5 0 0</h1>
                <h4 className="text-white mb-2">Internal Server Error</h4>
                <p className="text-white opacity-50 mb-4">Oops! Something went wrong on our end. Please try again later.</p>

                <div className="mb-4">
                  <Link to="/" className="btn btn-primary me-2">
                    Back to Home
                  </Link>
                  <Link to="/" className="btn btn-warning">
                    Report Issue
                  </Link>
                </div>

                <div className="opacity-50 text-white small">We’re working to fix the problem. Thank you for your patience.</div>
              </div>
            </Col>
          </Row>
        </Container>

        <BackgroundAnimation />
      </section>
    </>
  )
}

export default page
