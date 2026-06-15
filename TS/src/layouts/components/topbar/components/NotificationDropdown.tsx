import React, { useState } from 'react'
import { Col, Dropdown, DropdownMenu, DropdownToggle, NavItem, NavLink, ProgressBar, Row, TabContainer, TabContent, TabPane } from 'react-bootstrap'
import { Link } from 'react-router'
import { Nav } from '@restart/ui'
import { notifications as notificationData, type NotificationType } from '@/layouts/components/topbar/data'
import clsx from 'clsx'
import { basePath } from '@/helpers'

import SimplebarClient from '@/components/client-wrappers/SimplebarClient'

import avatarA from '@/assets/img/demo/avatars/avatar-a.png'
import avatarB from '@/assets/img/demo/avatars/avatar-b.png'
import avatarC from '@/assets/img/demo/avatars/avatar-c.png'
import avatarE from '@/assets/img/demo/avatars/avatar-e.png'
import avatarH from '@/assets/img/demo/avatars/avatar-h.png'

import thumb7 from '@/assets/img/thumbs/pic-7.png'
import thumb8 from '@/assets/img/thumbs/pic-8.png'
import thumb11 from '@/assets/img/thumbs/pic-11.png'
import thumb12 from '@/assets/img/thumbs/pic-12.png'

const Feeds = () => {
  return (
    <ul className="notification">
      <li className="unread alert alert-dismissable">
        <div className="d-flex align-items-center show-child-on-hover">
          <span className="d-flex flex-column flex-1">
            <span className="name d-flex align-items-center">
              Administrator <span className="badge bg-success fw-n ms-1">UPDATE</span>
            </span>
            <span className="msg-a fs-sm">
              System updated to version <strong>5.0</strong> <Link to="">(build notes)</Link>
            </span>
            <span className="fs-nano text-muted mt-1">5 mins ago</span>
          </span>
        </div>
        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </li>
      <li className="alert alert-dismissable">
        <div className="d-flex align-items-center show-child-on-hover">
          <div className="d-flex flex-column flex-1">
            <span className="name">
              Adison Lee{' '}
              <span className="fw-300 d-inline">
                replied to your video{' '}
                <a href="#" className="fw-400">
                  {' '}
                  Cancer Drug
                </a>{' '}
              </span>
            </span>
            <span className="msg-a fs-sm mt-2">
              Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day...
            </span>
            <span className="fs-nano text-muted mt-1">10 minutes ago</span>
          </div>
        </div>
        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </li>
      <li className="alert alert-dismissable">
        <div className="d-flex align-items-center show-child-on-hover">
          <div className="d-flex flex-column flex-1">
            <span className="name">
              Troy Norman&apos;<span className="fw-300">s new connections</span>
            </span>
            <div className="fs-sm d-flex align-items-center mt-2">
              <span
                className="profile-image-md ms-1 rounded-circle d-inline-block"
                style={{
                  backgroundImage: `url(${avatarA})`,
                  backgroundSize: 'cover',
                }}></span>
              <span
                className="profile-image-md ms-1 rounded-circle d-inline-block"
                style={{ backgroundImage: `url(${avatarB})`, backgroundSize: 'cover' }}></span>
              <span
                className="profile-image-md ms-1 rounded-circle d-inline-block"
                style={{ backgroundImage: `url(${avatarC})`, backgroundSize: 'cover' }}></span>
              <span
                className="profile-image-md ms-1 rounded-circle d-inline-block"
                style={{ backgroundImage: `url(${avatarE})`, backgroundSize: 'cover' }}></span>
              <div data-hasmore="+3" className="rounded-circle profile-image-md ms-1">
                <span
                  className="profile-image-md ms-1 rounded-circle d-inline-block"
                  style={{
                    backgroundImage: `url(${avatarH})`,
                    backgroundSize: 'cover',
                  }}></span>
              </div>
            </div>
            <span className="fs-nano text-muted mt-1">55 minutes ago</span>
          </div>
        </div>
        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </li>
      <li className="alert alert-dismissable">
        <div className="d-flex align-items-center show-child-on-hover">
          <div className="d-flex flex-column flex-1">
            <span className="name">
              Dr John Cook{' '}
              <span className="fw-300">
                sent a <span className="text-danger">new signal</span>
              </span>
            </span>
            <span className="msg-a fs-sm mt-2">
              Nanotechnology immersion along the information highway will close the loop on focusing solely on the bottom line.
            </span>
            <span className="fs-nano text-muted mt-1">10 minutes ago</span>
          </div>
        </div>
        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </li>
      <li className="alert alert-dismissable">
        <div className="d-flex align-items-center show-child-on-hover">
          <div className="d-flex flex-column flex-1">
            <span className="name">
              Lab Images <span className="fw-300">were updated!</span>
            </span>
            <div className="fs-sm d-flex align-items-center mt-1">
              <a href="#" className="ms-1 mt-1" title="Cell A-0012">
                <span
                  className="d-block img-share"
                  style={{
                    backgroundImage: `url(${thumb7})`,
                    backgroundSize: 'cover',
                  }}></span>
              </a>
              <a href="#" className="ms-1 mt-1" title="Patient A-473 saliva">
                <span
                  className="d-block img-share"
                  style={{
                    backgroundImage: `url(${thumb8})`,
                    backgroundSize: 'cover',
                  }}></span>
              </a>
              <a href="#" className="ms-1 mt-1" title="Patient A-473 blood cells">
                <span
                  className="d-block img-share"
                  style={{
                    backgroundImage: `url(${thumb11})`,
                    backgroundSize: 'cover',
                  }}></span>
              </a>
              <a href="#" className="ms-1 mt-1" title="Patient A-473 Membrane O.C">
                <span
                  className="d-block img-share"
                  style={{
                    backgroundImage: `url(${thumb12})`,
                    backgroundSize: 'cover',
                  }}></span>
              </a>
            </div>
            <span className="fs-nano text-muted mt-1">55 minutes ago</span>
          </div>
        </div>
        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </li>
      <li className="alert alert-dismissable">
        <div className="d-flex align-items-center show-child-on-hover">
          <div className="d-flex flex-column flex-1 w-100">
            <div className="name mb-2">
              {' '}
              Lisa Lamar<span className="fw-300"> updated project</span>
            </div>
            <Row className="fs-b fw-300">
              <Col className="text-start"> Progress</Col>
              <Col className="text-end fw-500"> 45%</Col>
            </Row>
            <ProgressBar now={45} striped className="progress-sm mt-1" />

            <span className="fs-nano text-muted mt-1">2 hrs ago</span>
          </div>
        </div>
        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </li>
    </ul>
  )
}

const MiniCalendar = () => {
  return (
    <div className="d-flex flex-column h-100">
      <div className="h-auto">
        <table className="table-calendar m-0 w-100 h-100 border-0">
          <thead>
            <tr>
              <th colSpan={7} className="pt-3 pb-2 px-3 text-center">
                <div className="js-get-date h6 fw-600 mb-2">Fake Day, October 15th, 2090</div>
              </th>
            </tr>
            <tr className="text-center">
              <th>Sun</th>
              <th>Mon</th>
              <th>Tue</th>
              <th>Wed</th>
              <th>Thu</th>
              <th>Fri</th>
              <th>Sat</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-muted bg-faded">30</td>
              <td>1</td>
              <td>2</td>
              <td>3</td>
              <td>4</td>
              <td>5</td>
              <td className="position-relative">
                <svg
                  className="sa-icon sa-icon-warning m-1 position-absolute pos-left pos-top"
                  style={
                    {
                      '--sa-icon-size': '0.85rem',
                      '--sa-fill-opacity': '0.5',
                    } as React.CSSProperties
                  }>
                  <use href={`${basePath}/icons/sprite.svg#star`} />
                </svg>
                6
              </td>
            </tr>
            <tr>
              <td>7</td>
              <td>8</td>
              <td>9</td>
              <td className="bg-primary-600 text-white pattern-0">10</td>
              <td>11</td>
              <td>12</td>
              <td>13</td>
            </tr>
            <tr>
              <td>14</td>
              <td>15</td>
              <td>16</td>
              <td>17</td>
              <td>18</td>
              <td>19</td>
              <td>20</td>
            </tr>
            <tr>
              <td>21</td>
              <td className="position-relative">
                <svg
                  className="sa-icon sa-icon-info m-1 position-absolute pos-left pos-top"
                  style={
                    {
                      '--sa-icon-size': '0.85rem',
                      '--sa-fill-opacity': '0.5',
                    } as React.CSSProperties
                  }>
                  <use href={`${basePath}/icons/sprite.svg#shield`} />
                </svg>
                22
              </td>
              <td>23</td>
              <td>24</td>
              <td>25</td>
              <td>26</td>
              <td>27</td>
            </tr>
            <tr>
              <td>28</td>
              <td>29</td>
              <td>30</td>
              <td>31</td>
              <td className="text-muted bg-faded">1</td>
              <td className="text-muted bg-faded">2</td>
              <td className="text-muted bg-faded">3</td>
            </tr>
          </tbody>
        </table>
      </div>

      <SimplebarClient className="flex-1 shadow-inset-3 h-100">
        <div className="p-2">
          <div className="d-flex align-items-center text-left mb-3">
            <div className="width-5 text-primary align-self-start table-calendar-appointment-date fw-300 text-center">15</div>
            <div className="flex-1">
              <div className="d-flex flex-column">
                <span className="l-h-n fs-md fw-500">October 2020</span>
                <span className="l-h-n fs-nano fw-400 text-secondary">Monday</span>
              </div>
              <div className="d-flex flex-column gap-2 mt-2">
                <div>
                  <strong>2:30PM</strong> – Doctor&apos;s appointment
                </div>
                <div>
                  <strong>3:30PM</strong> – Report overview
                </div>
                <div>
                  <strong>4:30PM</strong> – Meeting with Donnah V.
                </div>
                <div>
                  <strong>5:30PM</strong> – Late Lunch
                </div>
                <div>
                  <strong>6:30PM</strong> – Report Compression
                </div>
              </div>
            </div>
          </div>
        </div>
      </SimplebarClient>
    </div>
  )
}

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>(notificationData)

  const removeNotification = (idx: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <Dropdown>
      <DropdownToggle
        as={'a'}
        type="button"
        className="btn btn-system no-arrow"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label="Open Notifications">
        <span className="badge badge-icon pos-top pos-end">5</span>
        <svg className="sa-icon sa-icon-2x">
          <use href={`${basePath}/icons/sprite.svg#bell`}></use>
        </svg>
      </DropdownToggle>

      <DropdownMenu className="dropdown-menu-animated dropdown-xl dropdown-menu-end p-0">
        <div className="notification-header rounded-top mb-2">
          <h4 className="m-0">
            5 New <small className="mb-0 opacity-80">User Notifications</small>
          </h4>
        </div>
        <TabContainer defaultActiveKey={'0'}>
          <Nav className="nav nav-tabs nav-tabs-clean" role="tablist">
            <NavItem className="d-none">
              <NavLink eventKey={'0'}>Hidden</NavLink>
            </NavItem>
            <NavItem>
              <NavLink eventKey={'1'} className="px-4 fs-md fw-500">
                Messages
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink eventKey={'2'} className="px-4 fs-md fw-500">
                Feeds
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink eventKey={'3'} className="px-4 fs-md fw-500">
                Events
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent className="tab-notification">
            <TabPane eventKey={'0'} className="fade">
              <div className="d-flex h-100">
                <div className="px-4 d-flex flex-column align-items-center justify-content-center">
                  <svg className="sa-icon sa-icon-5x sa-icon-primary">
                    <use href={`${basePath}/icons/sprite.svg#arrow-up-circle`}></use>
                  </svg>
                  <span className="text-center fw-300" style={{ fontSize: '1.25rem' }}>
                    Select a tab above
                  </span>
                  <div className="mb-0 py-3 text-center fs-md fw-300 text-muted">
                    This blank page helps protect your privacy. To change this default message, <a href="#">update your settings</a>.
                  </div>
                </div>
              </div>
            </TabPane>
            <TabPane eventKey={'1'} className="fade">
              <SimplebarClient className="h-100">
                <ul className="notification">
                  {notifications.map((item, idx) => (
                    <li
                      key={idx}
                      className={clsx('alert alert-dismissable', {
                        unread: item.unread,
                        [`status-${item.statusVariant}`]: item.statusVariant,
                      })}>
                      <div className="d-flex align-items-center">
                        <span className={clsx('status me-2', item.statusVariant && `status-${item.statusVariant}`)}>
                          <span
                            className="profile-image rounded-circle d-inline-block overflow-hidden"
                            style={{ width: 40, height: 40, position: 'relative' }}>
                            <img src={item.avatar} alt={item.name} className="object-cover rounded-circle" />
                          </span>
                        </span>
                        <span className="d-flex flex-column flex-1 ms-1">
                          <span className="name">{item.name}</span>
                          <span className="msg-a fs-sm">{item.description}</span>
                          <span className="fs-nano text-muted mt-1">{item.time}</span>
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="alert"
                        onClick={() => removeNotification(idx)}
                        aria-label="Close"></button>
                    </li>
                  ))}
                </ul>

                {notifications.length === 0 && (
                  <div className="notification-empty-msg my-6 pt-6">
                    <svg className="sa-icon sa-icon-5x sa-icon-primary">
                      <use href={`${basePath}/icons/sprite.svg#coffee`}></use>
                    </svg>
                    <span>No new messages</span>
                  </div>
                )}
              </SimplebarClient>
            </TabPane>
            <TabPane eventKey={'2'} className="fade" id="tab-feeds" role="tabpanel">
              <SimplebarClient className="h-100">
                <Feeds />
                <div className="notification-empty-msg">
                  <svg className="sa-icon sa-icon-5x sa-icon-primary">
                    <use href={`${basePath}/icons/sprite.svg#smile`}></use>
                  </svg>
                  <span>You are all set!</span>
                </div>
              </SimplebarClient>
            </TabPane>
            <TabPane eventKey={'3'} className="fade" id="tab-events" role="tabpanel">
              <MiniCalendar />
            </TabPane>
          </TabContent>
        </TabContainer>
        <div className="py-2 px-3 d-block rounded-bottom text-end border-light border-bottom-0 border-end-0 border-start-0">
          <Link to="" className="fs-xs fw-500 ms-auto">
            view all notifications
          </Link>
        </div>
      </DropdownMenu>
    </Dropdown>
  )
}

export default NotificationDropdown
