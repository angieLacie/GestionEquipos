import { Button, Col, FormControl, FormLabel, Row } from 'react-bootstrap'
import { Link } from 'react-router'
import PageMeta from '@/components/PageMeta.tsx'

const ForgotPassword = () => {
  return (
    <>
      <PageMeta title={'Forgot Password'} />
      <Row className="justify-content-center">
        <Col xs={11} md={8} lg={6} xl={6}>
          <div id="regular-login" className="login-card p-4 p-md-6 bg-dark bg-opacity-50 translucent-dark rounded-4">
            <h2 className="text-center mb-4">Forgot Password</h2>
            <p className="text-center text-white opacity-50 mb-4">Confirmation email will be sent to your email address</p>
            <form>
              <div className="mb-3">
                <FormLabel htmlFor="email">Email or Phone</FormLabel>
                <FormControl
                  size={'lg'}
                  type="email"
                  className="text-white bg-dark border-light border-opacity-25 bg-opacity-25"
                  id="email"
                  required
                />
              </div>
              <div className="text-end">
                <Button size={'lg'} variant="warning" type="button" id="switchToToken" className="bg-opacity-50 border-dark">
                  Reset Password
                </Button>
              </div>
            </form>
          </div>

          <div id="token-login" className="login-card d-none p-4 p-md-6 bg-dark bg-opacity-50 translucent-dark rounded-4">
            <div className="d-flex flex-column align-items-center justify-content-center gap-3">
              <h2 className="text-center mb-4">Sent Email</h2>
              <p className="text-center text-white mb-4">Please check your email for the reset password link</p>
              <div className="d-grid">
                <Link to="/auth/login" className="btn btn-dark bg-opacity-50 border-dark btn-lg">
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </>
  )
}

export default ForgotPassword
