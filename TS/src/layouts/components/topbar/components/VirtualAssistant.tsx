import { Offcanvas } from 'react-bootstrap'
import { useToggle } from 'usehooks-ts'
import { basePath } from '@/helpers'

const VirtualAssistant = () => {
  const [show, toggle] = useToggle(false)
  return (
    <>
      <button type="button" className="btn btn-system d-none d-sm-block d-sm-none d-md-none d-lg-block" onClick={toggle}>
        <svg className="sa-icon sa-icon-2x">
          <use href={`${basePath}/icons/sprite.svg#aperture`}></use>
        </svg>
      </button>
      <Offcanvas show={show} placement="end" onHide={toggle} className="app-drawer js-app-drawer">
        <button type="button" className="btn btn-system position-absolute top-0 end-0 z-2 overflow-hidden p-3" onClick={toggle}>
          <svg className="sa-icon sa-icon-2x">
            <use href={`${basePath}/icons/sprite.svg#x`}></use>
          </svg>
        </button>

        <div className="custom-scrollbar h-100 p-0">
          <div className="d-flex flex-grow-1 p-0 w-100 h-100">
            <div className="d-flex flex-column flex-grow-1 flex-0 overflow-x-auto h-100">
              <div className="flex-wrap align-items-center flex-grow-1 position-relative bg-gray-50">
                <div className="position-absolute top-0 bottom-0 w-100 overflow-hidden d-flex flex-column">
                  <div className="w-100 p-4 pb-0 px-lg-3 bg-subtlelight-fade custom-scroll flex-grow-1 d-flex flex-column">
                    <div className="mb-g">
                      <h4 className="fw-600">Hi Sunny,</h4>
                      <span className="text-muted">how can I help you today?</span>
                    </div>
                    <div className="mt-auto ms-auto mb-2 btn btn-outline-default px-2 py-1 fw-500 fs-xs text-gradient">Analyze my data</div>
                    <p className="ms-auto mb-2 btn btn-outline-default px-2 py-1 fs-xs fw-500 text-gradient">Create a new report</p>
                    <p className="ms-auto mb-2 btn btn-outline-default px-2 py-1 fs-xs fw-500 text-gradient">Summarize my Calendar</p>
                  </div>

                  <div className="bg-faded m-3 rounded height-auto">
                    <textarea rows={2} className="form-control px-2 rounded-top" placeholder="Ask me anything"></textarea>
                    <div className="d-flex align-items-center py-2 px-2 border border-top-0 rounded-bottom">
                      <div className="d-flex gap-1 flex-row align-items-center flex-wrap flex-shrink-0">
                        <button
                          className="btn btn-icon fs-xl flex-shrink-0"
                          aria-label="Attach Files or Photos"
                          type="button"
                          data-bs-toggle="tooltip"
                          data-bs-original-title="Attach Files or Photos"
                          data-bs-placement="top">
                          <svg className="sa-icon sa-bold sa-icon-subtlelight">
                            <use href={`${basePath}/icons/sprite.svg#file`}></use>
                          </svg>
                        </button>
                        <button
                          className="btn btn-icon fs-xl width-1 flex-shrink-0"
                          aria-label="Voice"
                          type="button"
                          data-bs-toggle="tooltip"
                          data-bs-original-title="Voice"
                          data-bs-placement="top">
                          <svg className="sa-icon sa-bold sa-icon-subtlelight">
                            <use href={`${basePath}/icons/sprite.svg#mic`}></use>
                          </svg>
                        </button>
                      </div>
                      <button
                        className="btn btn-icon fs-xl width-1 flex-shrink-0 ms-auto"
                        aria-label="Send"
                        type="button"
                        data-bs-toggle="tooltip"
                        data-bs-original-title="Send"
                        data-bs-placement="top">
                        <svg className="sa-icon sa-bold sa-icon-subtlelight sa-icon-2x">
                          <use href={`${basePath}/icons/sprite.svg#arrow-up-circle`}></use>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Offcanvas>
    </>
  )
}

export default VirtualAssistant
