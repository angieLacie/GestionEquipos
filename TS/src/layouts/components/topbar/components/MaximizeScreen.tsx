import { useState } from 'react'
import { basePath } from '@/helpers'

const MaximizeScreen = () => {
  const [fullScreenOn, setFullScreenOn] = useState(false)

  /*
   * toggle full screen mode
   */
  const toggleFullScreen = () => {
    const document: any = window.document
    if (!document.fullscreenElement && /* alternative standard method */ !document.mozFullScreenElement && !document.webkitFullscreenElement) {
      // current working methods
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen()
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen()
      }
      setFullScreenOn(true)
    } else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen()
      }
      setFullScreenOn(false)
    }
  }

  return (
    <button type="button" className="btn btn-system d-none d-sm-block d-sm-none d-md-none d-lg-block" onClick={toggleFullScreen}>
      {fullScreenOn ? (
        <svg className="sa-icon sa-icon-2x">
          <use href={`${basePath}/icons/sprite.svg#minimize`}></use>
        </svg>
      ) : (
        <svg className="sa-icon sa-icon-2x">
          <use href={`${basePath}/icons/sprite.svg#maximize`}></use>
        </svg>
      )}
    </button>
  )
}

export default MaximizeScreen
