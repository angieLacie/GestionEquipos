import admin from '@/assets/img/demo/avatars/avatar-admin-xl.png'
import {
  Button,
  Col,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContainer,
  TabContent,
  TabPane,
} from 'react-bootstrap'
import About from '@/views/user-profile/components/About.tsx'
import News from '@/views/user-profile/components/News.tsx'
import Projects from '@/views/user-profile/components/Projects.tsx'
import Contact from '@/views/user-profile/components/Contact.tsx'
import { type SubmitHandler, useForm } from 'react-hook-form'
import Feedback from 'react-bootstrap/Feedback'
import { useToggle } from 'usehooks-ts'
import { basePath } from '@/helpers'

type ProfileFormValues = {
  fullName: string
  profession: string
  skills: string
  email: string
  phone: string
  location: string
  aboutMe: string
  linkedin?: string
  github?: string
  twitter?: string
}

const UserProfile = () => {
  const [show, toggle] = useToggle(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>()

  const onSubmit: SubmitHandler<ProfileFormValues> = (data) => {
    console.log('Profile Data:', data)
    toggle()
  }
  return (
    <div className="content-wrapper">
      <div className="main-content layout-trimmed profile-page position-relative">
        <div className="profile-page-header-underlay bg-info-gradient bg-info-500"></div>
        <div className="container-xl position-relative">
          <TabContainer defaultActiveKey="about">
            <div className="profile-page-header rounded-3 body-bg shadow-3 mb-4">
              <div className="d-flex flex-column flex-md-row align-items-center position-relative p-4">
                <div className="profile-page-header-avatar mb-3 mb-md-0">
                  <div className="position-relative">
                    <img src={admin} className="rounded-circle border border-3 border-white shadow-2" alt="John Doe" width="160" height="160" />
                    <button
                      className="btn btn-icon position-absolute bottom-0 end-0 bg-white rounded-circle shadow-2"
                      type="button"
                      title="Edit Profile">
                      <svg className="sa-icon">
                        <use href={`${basePath}/icons/sprite.svg#camera`}></use>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="profile-page-header-info ms-md-4 text-center text-md-start">
                  <h1 className="fs-xxl fw-700 mb-2">John Doe</h1>
                  <p className="text-muted mb-2">Senior Software Engineer at TechCorp</p>
                  <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
                    <span className="badge bg-primary-100 text-primary">JavaScript</span>
                    <span className="badge bg-primary-100 text-primary">React</span>
                    <span className="badge bg-primary-100 text-primary">Node.js</span>
                    <span className="badge bg-primary-100 text-primary">UI/UX</span>
                  </div>
                </div>

                <div className="profile-page-header-actions ms-md-auto mt-3 mt-md-0 d-flex">
                  <button className="btn btn-outline-default waves-effect me-2 d-flex" onClick={toggle}>
                    <svg className="sa-icon me-2 inline-text">
                      <use href={`${basePath}/icons/sprite.svg#edit-3`}></use>
                    </svg>
                    Edit Profile
                  </button>
                  <button className="btn btn-outline-default d-flex">
                    <svg className="sa-icon me-2 inline-block">
                      <use href={`${basePath}/icons/sprite.svg#share-2`}></use>
                    </svg>
                    Share
                  </button>
                </div>
              </div>

              <div className="profile-page-nav border-top">
                <Nav className="nav-tabs-clean">
                  <NavItem>
                    <NavLink eventKey={'about'}>
                      <svg className="sa-icon me-2">
                        <use href={`${basePath}/icons/sprite.svg#user`}></use>
                      </svg>
                      About
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink eventKey={'news'}>
                      <svg className="sa-icon me-2">
                        <use href={`${basePath}/icons/sprite.svg#rss`}></use>
                      </svg>
                      News
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink eventKey={'projects'}>
                      <svg className="sa-icon me-2">
                        <use href={`${basePath}/icons/sprite.svg#folder`}></use>
                      </svg>
                      Projects
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink eventKey={'contact'}>
                      <svg className="sa-icon me-2">
                        <use href={`${basePath}/icons/sprite.svg#mail`}></use>
                      </svg>
                      Contact
                    </NavLink>
                  </NavItem>
                </Nav>
              </div>
            </div>
            <TabContent>
              <TabPane eventKey={'about'} className="fade">
                <About />
              </TabPane>
              <TabPane eventKey={'news'} className="fade">
                <News />
              </TabPane>
              <TabPane eventKey={'projects'} className="fade">
                <Projects />
              </TabPane>
              <TabPane eventKey={'contact'} className="fade">
                <Contact />
              </TabPane>
            </TabContent>
          </TabContainer>
        </div>
      </div>

      <Modal size={'lg'} show={show} className="fade" id="editProfileModal" tabIndex={-1}>
        <form noValidate className="needs-validation" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>
            <ModalTitle as={'h5'}>Edit Profile</ModalTitle>
            <button type="button" className="btn btn-close" onClick={toggle}></button>
          </ModalHeader>
          <ModalBody>
            <Row className="mb-g">
              <Col md={12}>
                <h6 className="mb-3 text-muted">Personal Information</h6>

                <div className="mb-3">
                  <FormLabel htmlFor="fullName">
                    Full Name <span className="text-danger">*</span>
                  </FormLabel>
                  <FormControl
                    type="text"
                    id="fullName"
                    className={errors.fullName ? 'is-invalid' : ''}
                    {...register('fullName', { required: 'Please provide your full name.' })}
                    defaultValue="John Doe"
                  />
                  <Feedback type={'invalid'}>{errors.fullName?.message}</Feedback>
                </div>

                <div className="mb-3">
                  <FormLabel htmlFor="profession">
                    Profession <span className="text-danger">*</span>
                  </FormLabel>
                  <FormControl
                    type="text"
                    id="profession"
                    className={errors.profession ? 'is-invalid' : ''}
                    {...register('profession', { required: 'Please provide your profession.' })}
                    defaultValue="Senior Software Engineer at TechCorp"
                  />
                  <Feedback type={'invalid'}>{errors.profession?.message}</Feedback>
                </div>

                <div className="mb-3">
                  <FormLabel htmlFor="skills">
                    Skills (comma separated) <span className="text-danger">*</span>
                  </FormLabel>
                  <FormControl
                    type="text"
                    id="skills"
                    className={errors.skills ? 'is-invalid' : ''}
                    {...register('skills', { required: 'Please provide at least one skill.' })}
                    defaultValue="JavaScript, React, Node.js, UI/UX"
                  />
                  <Feedback type={'invalid'}>{errors.skills?.message}</Feedback>
                </div>
              </Col>
            </Row>

            <h6 className="mb-3 text-muted">Contact Information</h6>
            <Row>
              <Col md={6} className="mb-3">
                <FormLabel htmlFor="email">
                  Email <span className="text-danger">*</span>
                </FormLabel>
                <FormControl
                  type="email"
                  id="email"
                  className={errors.email ? 'is-invalid' : ''}
                  {...register('email', {
                    required: 'Please provide a valid email address.',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email format.',
                    },
                  })}
                  defaultValue="john.doe@example.com"
                />
                <Feedback type={'invalid'}>{errors.email?.message}</Feedback>
              </Col>

              <Col md={6} className="mb-3">
                <FormLabel htmlFor="phone">
                  Phone <span className="text-danger">*</span>
                </FormLabel>
                <FormControl
                  type="tel"
                  id="phone"
                  className={errors.phone ? 'is-invalid' : ''}
                  {...register('phone', { required: 'Please provide a phone number.' })}
                  defaultValue="+1 (555) 123-4567"
                />
                <Feedback type={'invalid'}>{errors.phone?.message}</Feedback>
              </Col>
            </Row>

            <div className="mb-g">
              <FormLabel htmlFor="location">
                Location <span className="text-danger">*</span>
              </FormLabel>
              <FormControl
                type="text"
                id="location"
                className={`${errors.location ? 'is-invalid' : ''}`}
                {...register('location', { required: 'Please provide your location.' })}
                defaultValue="San Francisco, CA"
              />
              <Feedback type={'invalid'}>{errors.location?.message}</Feedback>
            </div>

            <h6 className="mb-3 text-muted">About Me</h6>
            <div className="mb-3 mb-g">
              <FormLabel htmlFor="aboutMe">
                Bio <span className="text-danger">*</span>
              </FormLabel>
              <textarea
                id="aboutMe"
                className={`form-control ${errors.aboutMe ? 'is-invalid' : ''}`}
                rows={4}
                {...register('aboutMe', { required: 'Please provide a bio.' })}
                defaultValue="Experienced Software Engineer with a demonstrated history of working in the computer software industry. Skilled in JavaScript, React.js, Node.js, and UI/UX Design. Strong engineering professional with a Bachelor's degree focused in Computer Science."
              />
              <Feedback type={'invalid'}>{errors.aboutMe?.message}</Feedback>
            </div>

            <h6 className="mb-3 text-muted">Social Media</h6>
            <Row>
              <Col md={4} className="mb-3">
                <FormLabel htmlFor="linkedin">LinkedIn</FormLabel>
                <FormControl type="url" id="linkedin" {...register('linkedin')} placeholder="LinkedIn profile URL" />
              </Col>
              <Col md={4} className="mb-3">
                <FormLabel htmlFor="github">GitHub</FormLabel>
                <FormControl type="url" id="github" {...register('github')} placeholder="GitHub profile URL" />
              </Col>
              <Col md={4} className="mb-3">
                <FormLabel htmlFor="twitter">Twitter</FormLabel>
                <FormControl type="url" id="twitter" {...register('twitter')} placeholder="Twitter profile URL" />
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <button type="button" className="btn btn-default" onClick={toggle}>
              Cancel
            </button>
            <Button variant={'primary'} type="submit">
              Save Changes
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}
export default UserProfile
