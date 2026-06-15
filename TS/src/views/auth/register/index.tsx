import { Button, Col, FormControl, FormLabel, InputGroup, Row } from 'react-bootstrap'
import { Link } from 'react-router'
import PageMeta from '@/components/PageMeta.tsx'

const Register = () => {
  return (
    <>
      <PageMeta title={'Register'} />
      <Row className="justify-content-center">
        <Col xs={11} md={8} lg={6} xl={4}>
          <div className="login-card p-4 p-md-6 bg-dark bg-opacity-50 translucent-dark rounded-4">
            <h2 className="text-center mb-4">Register</h2>
            <p className="text-center text-white opacity-50 mb-4">Keep it all together and you&apos;ll be free</p>
            <form>
              <div className="mb-3">
                <FormLabel htmlFor="email">Email or Phone</FormLabel>
                <FormControl
                  type="email"
                  size={'lg'}
                  className="text-white bg-dark border-light border-opacity-25 bg-opacity-25"
                  id="email"
                  required
                />
              </div>
              <div className="mb-3">
                <FormLabel htmlFor="password">Password</FormLabel>
                <InputGroup>
                  <FormControl
                    size={'lg'}
                    type="password"
                    className="text-white bg-dark border-light border-opacity-25 bg-opacity-25"
                    id="password"
                    required
                  />
                </InputGroup>
              </div>
              <div className="mb-3">
                <FormLabel htmlFor="password-confirm">Confirm Password</FormLabel>
                <InputGroup>
                  <FormControl
                    type="password"
                    size={'lg'}
                    className="text-white bg-dark border-light border-opacity-25 bg-opacity-25"
                    id="password-confirm"
                    required
                  />
                </InputGroup>
              </div>
              <div className="mb-3">
                <div className="form-check">
                  <input className="form-check-input bg-dark border-light border-opacity-25 bg-opacity-25" type="checkbox" id="terms" required />
                  <label className="form-check-label" htmlFor="terms">
                    I agree to the{' '}
                    <Link to="" className="text-decoration-underline text-white fw-500">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="" className="text-decoration-underline text-white fw-500">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>
              <div className="mb-3 d-grid">
                <Button type="submit" variant="primary" size={'lg'} className="bg-primary bg-opacity-75">
                  Register
                </Button>
              </div>
              <div className="opacity-75">
                Already have an account?{' '}
                <Link to="/auth/login" className="text-decoration-underline text-white fw-500">
                  Login here
                </Link>
              </div>
            </form>
          </div>
        </Col>
      </Row>
    </>
  )
}

export default Register
