import ComponentCard from '@/components/ComponentCard.tsx'
import PageBreadcrumb from '@/components/PageBreadcrumb.tsx'
import { Col, Row, Table } from 'react-bootstrap'

type TablesType = {
  id: number
  firstName: string
  lastName?: string
  username: string
}

const TablesData: TablesType[] = [
  {
    id: 1,
    firstName: 'Mark',
    lastName: 'Otto',
    username: '@mdo',
  },
  {
    id: 2,
    firstName: 'Jacob',
    lastName: 'Thornton',
    username: '@fat',
  },
  {
    id: 3,
    firstName: 'Larry',
    lastName: 'the Bird',
    username: '@twitter',
  },
  {
    id: 4,
    firstName: 'Larry the Bird',
    username: '@twitter',
  },
]
type Tables2Type = {
  id: number
  firstName: string
  lastName: string
  username: string
  rowClass: string
}

const Tables2Data: Tables2Type[] = [
  {
    id: 1,
    firstName: 'Lisa',
    lastName: 'Nilson',
    username: '@lisa',
    rowClass: 'table-active',
  },
  {
    id: 2,
    firstName: 'Lisa',
    lastName: 'Nilson',
    username: '@lisa',
    rowClass: 'table-primary',
  },
  {
    id: 3,
    firstName: 'Nick',
    lastName: 'looper',
    username: '@king',
    rowClass: 'table-success',
  },
  {
    id: 4,
    firstName: 'Joan',
    lastName: 'thestar',
    username: '@joan',
    rowClass: 'table-info',
  },
  {
    id: 5,
    firstName: 'Sean',
    lastName: 'coder',
    username: '@coder',
    rowClass: 'table-warning',
  },
  {
    id: 6,
    firstName: 'Sean',
    lastName: 'coder',
    username: '@coder',
    rowClass: 'table-danger',
  },
]

const BasicTables = () => {
  return (
    <ComponentCard
      title={
        <h2>
          {' '}
          Basic{' '}
          <span className="fw-light">
            <i>Tables</i>
          </span>
        </h2>
      }
      toolbox>
      <div className="panel-container show">
        <div className="panel-content">
          <h5 className="frame-heading">Default</h5>
          <div className="frame-wrap">
            <Table className="m-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Username</th>
                </tr>
              </thead>
              <tbody>
                {TablesData.map((item, idx) => (
                  <tr key={idx}>
                    <th scope="row">{item.id}</th>
                    <td>{item.firstName}</td>
                    <td>{item.lastName}</td>
                    <td>{item.username}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <h5 className="frame-heading">Inverse</h5>
          <div className="frame-wrap">
            <Table className="table-dark m-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Username</th>
                </tr>
              </thead>
              <tbody>
                {TablesData.slice(0, 3).map((item, idx) => (
                  <tr key={idx}>
                    <th scope="row">{item.id}</th>
                    <td>{item.firstName}</td>
                    <td>{item.lastName}</td>
                    <td>{item.username}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </ComponentCard>
  )
}

const TablesHead = () => {
  return (
    <ComponentCard
      title={
        <h2>
          {' '}
          Table{' '}
          <span className="fw-light">
            <i>head</i>
          </span>
        </h2>
      }
      toolbox>
      <div className="panel-container show">
        <div className="panel-content">
          <h5 className="frame-heading">Dark</h5>
          <div className="frame-wrap">
            <Table className="m-0">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Username</th>
                </tr>
              </thead>
              <tbody>
                {TablesData.slice(0, 3).map((item, idx) => (
                  <tr key={idx}>
                    <th scope="row">{item.id}</th>
                    <td>{item.firstName}</td>
                    <td>{item.lastName}</td>
                    <td>{item.username}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <h5 className="frame-heading">Light</h5>
          <div className="frame-wrap">
            <table className="table m-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Username</th>
                </tr>
              </thead>
              <tbody>
                {TablesData.slice(0, 3).map((item, idx) => (
                  <tr key={idx}>
                    <th scope="row">{item.id}</th>
                    <td>{item.firstName}</td>
                    <td>{item.lastName}</td>
                    <td>{item.username}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ComponentCard>
  )
}
const TableRows = () => {
  return (
    <ComponentCard
      title={
        <h2>
          {' '}
          Table{' '}
          <span className="fw-light">
            <i>Rows</i>
          </span>
        </h2>
      }
      toolbox>
      <div className="panel-container show">
        <div className="panel-content">
          <h5 className="frame-heading">Pattern</h5>
          <div className="frame-wrap">
            <Table className="table-striped m-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Username</th>
                </tr>
              </thead>
              <tbody>
                {TablesData.slice(0, 3).map((item, idx) => (
                  <tr key={idx}>
                    <th scope="row">{item.id}</th>
                    <td>{item.firstName}</td>
                    <td>{item.lastName}</td>
                    <td>{item.username}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <h5 className="frame-heading">Pattern inverse</h5>
          <div className="frame-wrap">
            <Table className="table-striped table-dark m-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Username</th>
                </tr>
              </thead>
              <tbody>
                {TablesData.slice(0, 3).map((item, idx) => (
                  <tr key={idx}>
                    <th scope="row">{item.id}</th>
                    <td>{item.firstName}</td>
                    <td>{item.lastName}</td>
                    <td>{item.username}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </ComponentCard>
  )
}

const TableResponsive = () => {
  return (
    <ComponentCard
      title={
        <h2>
          {' '}
          Table{' '}
          <span className="fw-light">
            <i>Responsive</i>
          </span>
        </h2>
      }
      toolbox>
      <div className="panel-container show">
        <div className="panel-content">
          <div className="table-responsive">
            <Table className="table-bordered">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Table heading</th>
                  <th>Table heading</th>
                  <th>Table heading</th>
                  <th>Table heading</th>
                  <th>Table heading</th>
                  <th>Table heading</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>Table cell</td>
                    <td>Table cell</td>
                    <td>Table cell</td>
                    <td>Table cell</td>
                    <td>Table cell</td>
                    <td>Table cell</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </ComponentCard>
  )
}
const TableBordered = () => {
  return (
    <ComponentCard
      title={
        <h2>
          {' '}
          Table{' '}
          <span className="fw-light">
            <i>Bordered</i>
          </span>
        </h2>
      }
      toolbox>
      <div className="panel-container show">
        <div className="panel-content">
          <table className="table table-bordered m-0">
            <thead>
              <tr>
                <th>#</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Username</th>
              </tr>
            </thead>
            <tbody>
              {TablesData.map((item, idx) => (
                <tr key={idx}>
                  <th scope="row">{item.id}</th>
                  <td>{item.firstName}</td>
                  <td>{item.lastName}</td>
                  <td>{item.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ComponentCard>
  )
}

const TableHover = () => {
  return (
    <ComponentCard
      title={
        <h2>
          {' '}
          Table{' '}
          <span className="fw-light">
            <i>Bordered</i>
          </span>
        </h2>
      }
      toolbox>
      <div className="panel-container show">
        <div className="panel-content">
          <h5 className="frame-heading">Hoverable</h5>
          <div className="frame-wrap">
            <Table className="table-bordered table-hover m-0">
              <thead className="thead-themed">
                <tr>
                  <th>#</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Username</th>
                </tr>
              </thead>
              <tbody>
                {TablesData.slice(0, 3).map((item, idx) => (
                  <tr key={idx}>
                    <th scope="row">{item.id}</th>
                    <td>{item.firstName}</td>
                    <td>{item.lastName}</td>
                    <td>{item.username}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <h5 className="frame-heading">Inverse</h5>
          <div className="frame-wrap">
            <table className="table table-bordered table-hover table-dark m-0">
              <thead className="thead-themed">
                <tr>
                  <th>#</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Username</th>
                </tr>
              </thead>
              <tbody>
                {TablesData.slice(0, 3).map((item, idx) => (
                  <tr key={idx}>
                    <th scope="row">{item.id}</th>
                    <td>{item.firstName}</td>
                    <td>{item.lastName}</td>
                    <td>{item.username}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ComponentCard>
  )
}
const TableSmall = () => {
  return (
    <ComponentCard
      title={
        <h2>
          {' '}
          Table{' '}
          <span className="fw-light">
            <i>Bordered</i>
          </span>
        </h2>
      }
      toolbox>
      <div className="panel-container show">
        <div className="panel-content">
          <h5 className="frame-heading">Compact</h5>
          <div className="frame-wrap">
            <Table className="table-sm m-0">
              <thead className="bg-primary-500">
                <tr>
                  <th>#</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Username</th>
                </tr>
              </thead>
              <tbody>
                {TablesData.slice(1, 4).map((item, idx) => (
                  <tr key={idx}>
                    <th scope="row">{item.id}</th>
                    <td>{item.firstName}</td>
                    <td>{item.lastName}</td>
                    <td>{item.username}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <h5 className="frame-heading">With background</h5>
          <div className="frame-wrap">
            <Table className="table-sm bg-info-900 table-bordered m-0">
              <thead className="bg-info-500">
                <tr>
                  <th>#</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Username</th>
                </tr>
              </thead>
              <tbody>
                {TablesData.slice(1, 4).map((item, idx) => (
                  <tr key={idx}>
                    <th scope="row">{item.id}</th>
                    <td>{item.firstName}</td>
                    <td>{item.lastName}</td>
                    <td>{item.username}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <h5 className="frame-heading">Table nano</h5>
          <div className="frame-wrap">
            <Table className="table-nano bg-info-900 table-bordered m-0">
              <thead className="bg-info-500">
                <tr>
                  <th>#</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Username</th>
                </tr>
              </thead>
              <tbody>
                {TablesData.slice(1, 4).map((item, idx) => (
                  <tr key={idx}>
                    <th scope="row">{item.id}</th>
                    <td>{item.firstName}</td>
                    <td>{item.lastName}</td>
                    <td>{item.username}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </ComponentCard>
  )
}
const ContextualClasses = () => {
  return (
    <ComponentCard
      title={
        <h2>
          {' '}
          Contextual{' '}
          <span className="fw-light">
            <i>Classes</i>
          </span>
        </h2>
      }
      toolbox>
      <div className="panel-container show">
        <div className="panel-content">
          <Table className="m-0">
            <thead>
              <tr>
                <th>#</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Username</th>
              </tr>
            </thead>
            <tbody>
              {Tables2Data.map((item) => (
                <tr key={item.id} className={item.rowClass}>
                  <th scope="row">{item.id}</th>
                  <td>{item.firstName}</td>
                  <td>{item.lastName}</td>
                  <td>{item.username}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </ComponentCard>
  )
}

const page = () => {
  return (
    <div className="content-wrapper">
      <PageBreadcrumb title={'Basic Tables'} subTitle1={'Design'} subTitle2={'Tables'} />
      <h6 className="mt-3 mb-4 fst-italic">
        Tables provide responsive, styled tabular data with classes like <code>.table</code>, <code>.table-striped</code>,{' '}
        <code>.table-bordered</code>, and other classes for customization.
      </h6>
      <div className="main-content">
        <Row>
          <Col lg={12} xl={6}>
            <BasicTables />
            <TablesHead />
            <TableRows />
            <TableResponsive />
          </Col>
          <Col lg={12} xl={6}>
            <TableBordered />
            <TableHover />
            <ContextualClasses />
            <TableSmall />
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default page
