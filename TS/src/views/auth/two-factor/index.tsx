import { Button, Col, FormControl, FormLabel, Row } from 'react-bootstrap'
import { Link } from 'react-router'
import PageMeta from '@/components/PageMeta.tsx'

const TwoFactor = () => {
  return (
    <>
      <PageMeta title={'Two Factor'} />
      <Row className="justify-content-center">
        <Col xs={11} md={8} lg={6} xl={4}>
          <div className="login-card p-4 p-md-6 bg-dark bg-opacity-50 translucent-dark rounded-4">
            <h2 className="text-center mb-4">Two-Factor Authentication</h2>
            <p className="text-center text-white opacity-50 mb-4">Enter the 6-digit code sent to your email or phone</p>
            <form>
              <div className="mb-4">
                <FormLabel htmlFor="otp" className="form-label">
                  Authentication Code
                </FormLabel>
                <FormControl
                  size={'lg'}
                  type="text"
                  className="text-white bg-dark border-light border-opacity-25 bg-opacity-25 text-center"
                  id="otp"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>
              <div className="mb-3 d-grid">
                <Button type="submit" variant="primary" size={'lg'} className="bg-primary bg-opacity-75">
                  Verify
                </Button>
              </div>
              <div className="text-center opacity-75">
                Didn&apos;t receive a code?{' '}
                <Link to="" className="text-decoration-underline text-white fw-500">
                  Resend
                </Link>
              </div>
            </form>
          </div>
        </Col>
      </Row>
    </>
  )
}

export default TwoFactor
