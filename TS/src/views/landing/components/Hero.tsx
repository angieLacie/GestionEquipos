import { Col, Container, Row } from 'react-bootstrap'
import BackgroundAnimation from '@/components/BackgroundAnimation'
import { Typewriter } from 'react-simple-typewriter'

const Hero = () => {
  return (
    <section className="hero-section position-relative overflow-hidden">
      <Container style={{ position: 'relative', zIndex: 1 }}>
        <Row className="align-items-center">
          <Col sm={12} md={10} lg={8} xl={7} xxl={6}>
            <h1 className="eye-catcher-text display-2 fw-700 mb-5 text-gradient text-center text-md-start" data-text="SmartAdmin v5 built with AI">
              SmartAdmin v5 built with AI
            </h1>
            <p className="lead fw-bold mb-5 text-center text-md-start">
              <Typewriter
                words={[
                  "The world's first Admin WebApp built with Artificial Intelligence",
                  'AI‑ready by design: pre‑written prompt instructions included',
                  'An advanced, jQuery‑free Bootstrap 5 Admin Dashboard UI',
                  'Built for the next generation of enterprise web applications',
                  'Clean, scalable, and engineered for future‑forward growth',
                  'Continuously updated by a team of expert developers',
                  'Enterprise-grade performance with beautiful design',
                  'One dashboard template, unlimited use cases',
                  'Modern, responsive UI built for serious development',
                ]}
                loop={5}
                cursor
                typeSpeed={15}
                deleteSpeed={15}
                delaySpeed={3000}
              />
              <span id="typewriter-text"></span>
            </p>
            <div className="d-flex gap-3 justify-content-center justify-content-md-start">
              <a href="#features" className="btn btn-primary btn-lg px-4 py-2">
                Get started
              </a>
              <a href="#demo" className="btn btn-outline-light btn-lg px-4 py-2">
                Learn more
              </a>
            </div>
          </Col>
        </Row>
      </Container>
      <BackgroundAnimation />
    </section>
  )
}

export default Hero
