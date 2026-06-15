import PageBreadcrumb from '@/components/PageBreadcrumb.tsx'
import { statistics } from '@/views/dashboards/subscription/data'
import StatisticWidget from '@/views/dashboards/subscription/components/StatisticWidget'
import { Button, Card, Col, Form, FormGroup, FormLabel, InputGroup, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'react-bootstrap'
import SubscriptionFeed from '@/views/dashboards/subscription/components/SubscriptionFeed'
import UserActivity from '@/views/dashboards/subscription/components/UserActivity'
import DataStream from '@/views/dashboards/subscription/components/DataStream'
import DemoGraphic from '@/views/dashboards/subscription/components/DemoGraphic'
import { BsFileEarmark, BsRocketTakeoff, BsXLg } from 'react-icons/bs'
import { type SubmitHandler, useForm } from 'react-hook-form'
import InputGroupText from 'react-bootstrap/InputGroupText'
import Feedback from 'react-bootstrap/Feedback'
import { useToggle } from 'usehooks-ts'
import { toast } from 'react-toastify'
import { basePath } from '@/helpers'

type CampaignFormValues = {
  campaignName: string
  campaignType: string
  startDate: string
  endDate?: string
  campaignDescription?: string
  targetAudience: string
  offerType: string
  discountAmount?: number
  campaignChannels: string[]
  campaignBudget?: number
  priority?: string
  kpiConversions?: number
  kpiRevenue?: number
  kpiROI?: number
}

const Subscription = () => {
  const [show, toggle] = useToggle(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CampaignFormValues>()

  const onError = () => {
    toast.error('Please fill required fields.', { hideProgressBar: true })
  }

  const onSubmit: SubmitHandler<CampaignFormValues> = () => {
    toast.success('Campaign launched successfully!', { hideProgressBar: true })
  }
  const offerType = watch('offerType')

  return (
    <div className="content-wrapper">
      <div className="d-flex align-items-end mb-4">
        <PageBreadcrumb title={'Subscription Dashboard'} subTitle1={'Insights'} subTitle2={'Dashboards'} />

        <div className="ms-auto d-none d-sm-flex align-items-center">
          <Button variant="outline-success" className="waves-effect" type="button" onClick={toggle}>
            Build Campaign
          </Button>
        </div>
      </div>

      <div className="main-content">
        <Row className="sortable-off">
          {statistics.map((item, idx) => (
            <Col xs={12} sm={6} xl={3} className="mb-g" key={idx}>
              <StatisticWidget item={item} />
            </Col>
          ))}
        </Row>

        <Row>
          <Col lg={12}>
            <SubscriptionFeed />
          </Col>
          <Col lg={4}>
            <UserActivity />
          </Col>
          <Col lg={4}>
            <DataStream />
          </Col>
          <Col lg={4}>
            <DemoGraphic />
          </Col>
        </Row>
      </div>

      <Modal show={show} size={'lg'} className="fade" id="buildCampaignModal" tabIndex={-1}>
        <form onSubmit={handleSubmit(onSubmit, onError)} noValidate id="campaignForm">
          <ModalHeader className="bg-primary text-white">
            <h5 className="modal-title">Build New Subscription Campaign</h5>
            <button type="button" className="btn btn-system btn-system-light ms-auto" onClick={toggle}>
              <svg className="sa-icon sa-icon-2x">
                <use href={`${basePath}/icons/sprite.svg#x`}></use>
              </svg>
            </button>
          </ModalHeader>
          <ModalBody>
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Campaign Basics</h6>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <FormGroup controlId="campaignName">
                      <FormLabel>Campaign Name *</FormLabel>
                      <Form.Control
                        type="text"
                        size="lg"
                        isInvalid={!!errors.campaignName}
                        {...register('campaignName', { required: 'Campaign name is required.' })}
                      />
                      <Feedback type="invalid">{errors.campaignName?.message}</Feedback>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup controlId="campaignType">
                      <FormLabel>Campaign Type *</FormLabel>
                      <Form.Select
                        size="lg"
                        isInvalid={!!errors.campaignType}
                        {...register('campaignType', { required: 'Campaign type is required.' })}>
                        <option value="">Select type...</option>
                        <option value="acquisition">New Customer Acquisition</option>
                        <option value="retention">Customer Retention</option>
                        <option value="winback">Win-back Campaign</option>
                        <option value="upgrade">Subscription Upgrade</option>
                      </Form.Select>
                      <Feedback type="invalid">{errors.campaignType?.message}</Feedback>
                    </FormGroup>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <FormGroup controlId="startDate">
                      <FormLabel>Start Date *</FormLabel>
                      <Form.Control
                        type="date"
                        size="lg"
                        isInvalid={!!errors.startDate}
                        {...register('startDate', { required: 'Start date is required.' })}
                      />
                      <Feedback type="invalid">{errors.startDate?.message}</Feedback>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup controlId="endDate">
                      <FormLabel>End Date</FormLabel>
                      <Form.Control type="date" size="lg" {...register('endDate')} />
                    </FormGroup>
                  </Col>
                </Row>

                <FormGroup controlId="campaignDescription">
                  <FormLabel>Description</FormLabel>
                  <Form.Control as="textarea" rows={2} {...register('campaignDescription')} />
                </FormGroup>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Audience & Offer</h6>
              </Card.Header>
              <Card.Body>
                <FormGroup controlId="targetAudience" className="mb-4">
                  <FormLabel>Target Audience *</FormLabel>
                  <Form.Select
                    size="lg"
                    isInvalid={!!errors.targetAudience}
                    {...register('targetAudience', { required: 'Target audience is required.' })}>
                    <option value="">Select audience...</option>
                    <option value="all">All Subscribers</option>
                    <option value="active">Active Subscribers</option>
                    <option value="inactive">Inactive Subscribers</option>
                    <option value="expired">Recently Expired</option>
                    <option value="custom">Custom Segment</option>
                  </Form.Select>
                  <Feedback type="invalid">{errors.targetAudience?.message}</Feedback>
                </FormGroup>

                <FormGroup className="mb-4">
                  <FormLabel>Offer Type *</FormLabel>
                  {['discount', 'freeTrial', 'upgrade', 'bundle'].map((type) => (
                    <Form.Check
                      key={type}
                      type="radio"
                      id={`offer-${type}`}
                      label={type}
                      value={type}
                      isInvalid={!!errors.offerType}
                      {...register('offerType', { required: 'Please select an offer type.' })}
                    />
                  ))}
                  {errors.offerType && <div className="invalid-feedback d-block">{errors.offerType.message}</div>}
                </FormGroup>

                {offerType === 'discount' && (
                  <FormGroup className="mb-3">
                    <FormLabel>Discount Amount</FormLabel>
                    <Form.Range min={5} max={50} step={5} {...register('discountAmount')} />
                  </FormGroup>
                )}
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Channels & Budget</h6>
              </Card.Header>
              <Card.Body>
                <FormLabel>Campaign Channels *</FormLabel>
                <Row>
                  {['email', 'sms', 'push', 'inapp'].map((channel) => (
                    <Col md={3} key={channel}>
                      <Form.Check
                        type="checkbox"
                        label={channel}
                        id={`channel-${channel}`}
                        value={channel}
                        isInvalid={!!errors.campaignChannels}
                        {...register('campaignChannels', {
                          validate: (value) => value.length > 0 || 'Select at least one channel.',
                        })}
                      />
                    </Col>
                  ))}
                </Row>
                {errors.campaignChannels && <div className="invalid-feedback d-block">{errors.campaignChannels.message}</div>}

                <Row className="mt-4">
                  <Col md={6} className="mb-3">
                    <FormGroup controlId="campaignBudget">
                      <FormLabel>Budget Allocation</FormLabel>
                      <InputGroup>
                        <InputGroupText>$</InputGroupText>
                        <Form.Control type="number" size="lg" {...register('campaignBudget')} />
                      </InputGroup>
                    </FormGroup>
                  </Col>
                  <Col md={6} className="mb-3">
                    <FormGroup controlId="priority">
                      <FormLabel>Priority</FormLabel>
                      <Form.Select size="lg" {...register('priority')} defaultValue="medium">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </Form.Select>
                    </FormGroup>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Performance Goals</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4} className="mb-3">
                    <FormGroup controlId="kpiConversions">
                      <FormLabel>Conversion Target</FormLabel>
                      <InputGroup>
                        <Form.Control type="number" {...register('kpiConversions')} />
                        <InputGroupText>subscribers</InputGroupText>
                      </InputGroup>
                    </FormGroup>
                  </Col>
                  <Col md={4} className="mb-3">
                    <FormGroup controlId="kpiRevenue">
                      <FormLabel>Revenue Target</FormLabel>
                      <InputGroup>
                        <InputGroupText>$</InputGroupText>
                        <Form.Control type="number" {...register('kpiRevenue')} />
                      </InputGroup>
                    </FormGroup>
                  </Col>
                  <Col md={4} className="mb-3">
                    <FormGroup controlId="kpiROI">
                      <FormLabel>ROI Target</FormLabel>
                      <InputGroup>
                        <Form.Control type="number" {...register('kpiROI')} />
                        <InputGroupText>%</InputGroupText>
                      </InputGroup>
                    </FormGroup>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline-secondary" type="button" onClick={toggle}>
              <BsXLg />
              Cancel
            </Button>
            <Button variant="outline-primary" type="button" id="saveDraftBtn">
              <BsFileEarmark className="me-1" />
              Save Draft
            </Button>
            <Button variant="success" type="submit">
              <BsRocketTakeoff className="me-1" />
              Launch Campaign
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}

export default Subscription
