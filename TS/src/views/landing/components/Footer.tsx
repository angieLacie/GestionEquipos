import logo from '@/assets/img/logo.svg'
import { Col, Container, Row } from 'react-bootstrap'
import { appName, currentYear } from '@/helpers'
import { Link } from 'react-router'
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaYoutube } from 'react-icons/fa6'
import type { FooterLinkType } from '@/views/landing/components/types'

const Footer = () => {
  const footerSections: FooterLinkType[] = [
    {
      title: 'Quick Links',
      links: [{ label: 'About Us' }, { label: 'Contact Support' }, { label: 'FAQs' }, { label: 'Blog Posts' }, { label: 'User Guides' }],
    },
    {
      title: 'Resources',
      links: [{ label: 'Community Forum' }, { label: 'Support Center' }, { label: 'System Status' }, { label: 'Feedback' }, { label: 'Careers' }],
    },
    {
      title: 'Stay Connected',
      links: [{ label: 'Social Media' }, { label: 'Newsletter' }, { label: 'Events' }, { label: 'Webinars' }, { label: 'Podcasts' }],
    },
    {
      title: 'Legal Info',
      links: [
        { label: 'Privacy Notice' },
        { label: 'User Agreement' },
        { label: 'Cookie Policy' },
        { label: 'Terms & Conditions' },
        { label: 'Help Center' },
      ],
    },
    {
      title: 'Stay Updated',
      links: [
        { label: 'Follow Us Online' },
        { label: 'Join Our Community' },
        { label: 'Get Involved' },
        { label: 'Share Your Thoughts' },
        { label: 'Explore Our Blog' },
      ],
    },
  ]
  return (
    <footer className="footer py-5">
      <Container>
        <Row className="mb-5">
          <Col xs={'auto'}>
            <img src={logo} alt="Logo" className="mb-4" style={{ height: '32px' }} />
          </Col>
        </Row>

        <Row className="g-4">
          {footerSections.map((section, idx) => (
            <Col key={idx} xs={6} className="col-md">
              <h6 className="fw-bold mb-3">{section.title}</h6>
              <ul className="footer-links">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <Link to={link.url ?? ''}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </Col>
          ))}
        </Row>

        <hr className="my-4" />

        <Row className="align-items-center">
          <Col md={6}>
            <div className="d-flex align-items-center">
              <small className="text-muted">
                © {currentYear} {appName}. All rights reserved.
              </small>
              <div className="ms-4">
                <Link to="" className="text-muted text-decoration-none small me-3">
                  Privacy Policy
                </Link>
                <Link to="" className="text-muted text-decoration-none small me-3">
                  Terms of Service
                </Link>
                <Link to="" className="text-muted text-decoration-none small">
                  Cookie Settings
                </Link>
              </div>
            </div>
          </Col>

          <Col md={6}>
            <div className="d-flex justify-content-md-end align-items-center gap-3">
              <Link to="" className="text-muted">
                <FaFacebook />
              </Link>
              <Link to="" className="text-muted">
                <FaInstagram />
              </Link>
              <Link to="" className="text-muted">
                <FaTwitter />
              </Link>
              <Link to="" className="text-muted">
                <FaLinkedin />
              </Link>
              <Link to="" className="text-muted">
                <FaYoutube />
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
