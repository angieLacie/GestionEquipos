import PageMeta from '@/components/PageMeta.tsx'

const page = () => {
  return (
    <>
      <PageMeta title={'Error 404'} />
      <div className="content-wrapper">
        <div className="main-content hide-page-header d-flex justify-content-center align-items-center position-relative">
          <div
            className="logo-backdrop position-absolute translate-middle top-50 start-50 d-flex align-items-center justify-content-center"
            style={{ width: '45rem', height: '45rem' }}>
            <div className="blobs">
              <svg viewBox="0 0 1200 1200">
                <g className="blob blob-1">
                  <path></path>
                </g>
                <g className="blob blob-2">
                  <path></path>
                </g>
                <g className="blob blob-3">
                  <path></path>
                </g>
                <g className="blob blob-4">
                  <path></path>
                </g>
                <g className="blob blob-1 alt">
                  <path></path>
                </g>
                <g className="blob blob-2 alt">
                  <path></path>
                </g>
                <g className="blob blob-3 alt">
                  <path></path>
                </g>
                <g className="blob blob-4 alt">
                  <path></path>
                </g>
              </svg>
            </div>
          </div>

          <div className="h-alt-hf d-flex flex-column align-items-center justify-content-center text-center" style={{ zIndex: 2 }}>
            <h1 className="page-error color-fusion-500" style={{ fontSize: '750%', fontWeight: 700 }}>
              ERROR <span className="text-gradient">404</span>
              <small className="fw-500" style={{ fontSize: '40%' }}>
                Our AI servers are overloaded!
              </small>
            </h1>
            <h3 className="fw-500 mb-5 text-muted">We are sorry, but the page you are looking for does not exist.</h3>
          </div>
        </div>
      </div>
    </>
  )
}

export default page
