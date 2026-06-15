import { Button, Col, FormControl, FormLabel, Row } from 'react-bootstrap'
import avatar from '@/assets/img/demo/avatars/avatar-admin-xl.png'
import { Link } from 'react-router'
import PageMeta from '@/components/PageMeta.tsx'

const Lockscreen = () => {
  return (
    <>
      <PageMeta title={'Lockscreen'} />
      <Row className="justify-content-center">
        <Col xs={11} md={8} lg={6} xl={4}>
          <div className="login-card p-4 p-md-5 bg-dark bg-opacity-50 translucent-dark rounded-4 text-center">
            <div className="mb-4">
              <img src={avatar} alt="User Avatar" className="rounded-circle border border-light border-opacity-25" width="72" height="72" />
            </div>
            <h4 className="text-white mb-2">Welcome back, Sunny A.</h4>
            <p className="text-white opacity-50 mb-4">Enter your password or 2FA code to unlock your session</p>

            <form>
              <div className="mb-3 text-start">
                <FormLabel htmlFor="password">Password</FormLabel>
                <FormControl
                  size={'lg'}
                  type="password"
                  className="text-white bg-dark border-light border-opacity-25 bg-opacity-25"
                  id="password"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="text-white opacity-50 my-2">OR</div>

              <div className="mb-3 text-start">
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
                />
              </div>

              <div className="mb-3 d-grid">
                <Button type="submit" variant="primary" size={'lg'} className="bg-primary bg-opacity-75">
                  Unlock
                </Button>
              </div>

              <div className="opacity-75">
                Not you?{' '}
                <Link to="/auth/login" className="text-decoration-underline text-white fw-500">
                  Switch Account
                </Link>
              </div>
            </form>
          </div>
        </Col>
      </Row>
    </>
  )
}

export default Lockscreen
