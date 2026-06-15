import { Col, Row } from 'react-bootstrap'
import { basePath } from '@/helpers'

const About = () => {
  return (
    <Row>
      <Col lg={8}>
        <div className="panel mb-4">
          <div className="panel-hdr">
            <h2>About Me</h2>
          </div>
          <div className="panel-container">
            <div className="panel-content">
              <div className="profile-view-mode">
                <p className="mb-4">
                  Experienced Software Engineer with a demonstrated history of working in the computer software industry. Skilled in JavaScript,
                  React.js, Node.js, and UI/UX Design. Strong engineering professional with a Bachelor&apos;s degree focused in Computer Science.
                </p>

                <h5 className="mb-3">Contact Information</h5>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex align-items-center">
                    <svg className="sa-icon me-2">
                      <use href={`${basePath}/icons/sprite.svg#mail`}></use>
                    </svg>
                    john.doe@example.com
                  </div>
                  <div className="d-flex align-items-center">
                    <svg className="sa-icon me-2">
                      <use href={`${basePath}/icons/sprite.svg#phone`}></use>
                    </svg>
                    +1 (555) 123-4567
                  </div>
                  <div className="d-flex align-items-center">
                    <svg className="sa-icon me-2">
                      <use href={`${basePath}/icons/sprite.svg#map-pin`}></use>
                    </svg>
                    San Francisco, CA
                  </div>
                </div>
              </div>

              <div className="profile-edit-mode d-none">
                <form>
                  <div className="mb-3">
                    <label className="form-label">About Me</label>
                    <textarea
                      className="form-control"
                      defaultValue={
                        'Experienced Software Engineer with a demonstrated history of working in the computer software industry. Skilled in JavaScript, React.js, Node.js, and UI/UX Design. Strong engineering professional with a Bachelor&apos;s degree focused in Computer Science.'
                      }
                      rows={4}></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" defaultValue="john.doe@example.com" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input type="tel" className="form-control" defaultValue="+1 (555) 123-4567" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Location</label>
                    <input type="text" className="form-control" defaultValue="San Francisco, CA" />
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                    <button type="button" className="btn btn-default" data-action="toggle" data-class="profile-edit-mode">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="panel mb-4">
          <div className="panel-hdr">
            <h2>Experience</h2>
          </div>
          <div className="panel-container">
            <div className="panel-content">
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-marker bg-primary-500"></div>
                  <div className="timeline-content">
                    <h5 className="mb-2">Senior Software Engineer</h5>
                    <p className="text-muted mb-2">TechCorp • 2020 - Present</p>
                    <p>Lead developer for enterprise web applications using React and Node.js.</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker bg-success-500"></div>
                  <div className="timeline-content">
                    <h5 className="mb-2">Software Engineer</h5>
                    <p className="text-muted mb-2">InnovateTech • 2018 - 2020</p>
                    <p>Developed and maintained multiple client-facing applications.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Col>

      <Col lg={4}>
        <div className="panel mb-4">
          <div className="panel-hdr">
            <h2>Skills</h2>
          </div>
          <div className="panel-container">
            <div className="panel-content">
              <div className="d-flex flex-wrap gap-2">
                <span className="badge bg-primary">JavaScript</span>
                <span className="badge bg-primary">React.js</span>
                <span className="badge bg-primary">Node.js</span>
                <span className="badge bg-primary">TypeScript</span>
                <span className="badge bg-primary">HTML5</span>
                <span className="badge bg-primary">CSS3</span>
                <span className="badge bg-primary">Git</span>
                <span className="badge bg-primary">AWS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="panel mb-4">
          <div className="panel-hdr">
            <h2>Education</h2>
          </div>
          <div className="panel-container">
            <div className="panel-content">
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-marker bg-fusion-500"></div>
                  <div className="timeline-content">
                    <h5 className="mb-2">BS in Computer Science</h5>
                    <p className="text-muted mb-2">University of Technology • 2014 - 2018</p>
                    <p>Major in Software Engineering</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  )
}

export default About
