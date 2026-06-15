import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Col, Container, Row } from 'react-bootstrap'
import type { FAQType } from '@/views/landing/components/types'

const Faqs = () => {
  const faqData: FAQType[] = [
    {
      question: 'What is SmartAdmin?',
      answer:
        'SmartAdmin is a powerful web app designed to simplify your workflow and enhance productivity. It offers a wide range of features to streamline your administrative tasks and improve team collaboration.',
    },
    {
      question: 'Is it user friendly?',
      answer:
        "Yes! SmartAdmin features an intuitive interface that's easy to navigate. We've designed it with user experience in mind, making it accessible for both beginners and advanced users.",
    },
    {
      question: 'Can I customize it?',
      answer:
        'Absolutely! SmartAdmin offers extensive customization options to match your brand and workflow preferences. You can modify layouts, themes, and functionality to suit your needs.',
    },
    {
      question: 'Is there a trial?',
      answer: 'Yes, we offer a free trial period so you can explore all features before making a commitment. Sign up today to start your trial!',
    },
  ]

  return (
    <section className="faq-section">
      <Container>
        <div className="text-center mb-5">
          <h2 className="display-6 fw-700 mb-3">Frequently Asked Questions</h2>
          <p className="lead text-muted">Find answers to common questions about SmartAdmin</p>
        </div>

        <Row className="justify-content-center">
          <Col lg={8}>
            <Accordion>
              {faqData.map((item, idx) => (
                <AccordionItem eventKey={`${idx}`} className="border-0 mb-3" key={idx}>
                  <AccordionHeader as={'h3'}>{item.question}</AccordionHeader>
                  <AccordionBody className="text-muted">{item.answer}</AccordionBody>
                </AccordionItem>
              ))}
            </Accordion>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default Faqs
