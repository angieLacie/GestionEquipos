import { Col, Row } from 'react-bootstrap'
import { contacts } from '@/views/user-profile/data.ts'

import { Link } from 'react-router'
import { basePath } from '@/helpers'

const Contacts = () => {
  return (
    <div className="panel mb-4">
      <div className="panel-hdr">
        <h2>My Contacts</h2>
        <div className="panel-toolbar">
          <div className="input-group mt-3">
            <input type="text" className="form-control form-control-sm" placeholder="Search contacts..." />
            <button type="button" className="btn btn-outline-default btn-sm">
              <svg className="sa-icon">
                <use href={`${basePath}/icons/sprite.svg#search`}></use>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="panel-container">
        <div className="panel-content">
          <div className="d-flex flex-column gap-4">
            <div className="d-flex gap-2 border-bottom pb-3">
              <button type="button" className="btn btn-sm btn-light waves-effect active">
                All
              </button>
              <button type="button" className="btn btn-sm btn-light waves-effect">
                Favorites
              </button>
              <button type="button" className="btn btn-sm btn-light waves-effect">
                Recent
              </button>
            </div>

            <div className="list-group">
              {contacts.map((contact, idx) => (
                <div className="list-group-item list-group-item-action d-flex align-items-center gap-3" key={idx}>
                  <img src={contact.avatar} className="rounded-circle" width="48" height="48" alt="Sarah Johnson" />
                  <div className="flex-grow-1">
                    <h6 className="mb-0">{contact.name}</h6>
                    <small className="text-muted">{contact.role}</small>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-icon waves-effect btn-light">
                      <svg className="sa-icon">
                        <use href={`${basePath}/icons/sprite.svg#message-square`}></use>
                      </svg>
                    </button>
                    <button type="button" className="btn btn-icon waves-effect btn-light">
                      <svg className="sa-icon">
                        <use href={`${basePath}/icons/sprite.svg#star`}></use>
                      </svg>
                    </button>
                    <button type="button" className="btn btn-icon waves-effect btn-light">
                      <svg className="sa-icon">
                        <use href={`${basePath}/icons/sprite.svg#more-vertical`}></use>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ContactInformation = () => {
  return (
    <div className="panel mb-4">
      <div className="panel-hdr">
        <h2>Contact Information</h2>
      </div>
      <div className="panel-container">
        <div className="panel-content">
          <div className="d-flex flex-column gap-4">
            <div>
              <h6 className="mb-2">Email</h6>
              <div className="d-flex align-items-center">
                <svg className="sa-icon me-2">
                  <use href={`${basePath}/icons/sprite.svg#mail`}></use>
                </svg>
                john.doe@example.com
              </div>
            </div>
            <div>
              <h6 className="mb-2">Phone</h6>
              <div className="d-flex align-items-center">
                <svg className="sa-icon me-2">
                  <use href={`${basePath}/icons/sprite.svg#phone`}></use>
                </svg>
                +1 (555) 123-4567
              </div>
            </div>
            <div>
              <h6 className="mb-2">Location</h6>
              <div className="d-flex align-items-center">
                <svg className="sa-icon me-2">
                  <use href={`${basePath}/icons/sprite.svg#map-pin`}></use>
                </svg>
                San Francisco, CA
              </div>
            </div>
            <div>
              <h6 className="mb-2">Social Media</h6>
              <div className="d-flex gap-2">
                <Link to="" className="btn btn-icon waves-effect btn-light">
                  <svg className="sa-icon">
                    <use href={`${basePath}/icons/sprite.svg#linkedin`}></use>
                  </svg>
                </Link>
                <Link to="" className="btn btn-icon waves-effect btn-light">
                  <svg className="sa-icon">
                    <use href={`${basePath}/icons/sprite.svg#github`}></use>
                  </svg>
                </Link>
                <Link to="" className="btn btn-icon waves-effect btn-light">
                  <svg className="sa-icon">
                    <use href={`${basePath}/icons/sprite.svg#twitter`}></use>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const OfficeHours = () => {
  return (
    <div className="panel mb-4">
      <div className="panel-hdr">
        <h2>Office Hours</h2>
      </div>
      <div className="panel-container">
        <div className="panel-content">
          <div className="d-flex flex-column gap-2">
            <div className="d-flex justify-content-between">
              <span>Monday - Friday</span>
              <span>9:00 AM - 5:00 PM</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Saturday</span>
              <span>10:00 AM - 2:00 PM</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Sunday</span>
              <span>Closed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Contact = () => {
  return (
    <Row>
      <Col lg={8}>
        <Contacts />
      </Col>

      <Col lg={4}>
        <ContactInformation />

        <OfficeHours />
      </Col>
    </Row>
  )
}

export default Contact
