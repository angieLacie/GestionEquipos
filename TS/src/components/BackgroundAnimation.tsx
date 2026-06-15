import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import HALO from 'vanta/dist/vanta.halo.min'

const BackgroundAnimation = () => {
  const vantaRef = useRef<HTMLDivElement | null>(null)
  const [vantaEffect, setVantaEffect] = useState<any>(null)

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      setVantaEffect(
        HALO({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          color: 0xfd3995,
          backgroundColor: '#515a99',
          size: 1.6,
          scale: 0.75,
          xOffset: 0.22,
          scaleMobile: 0.5,
        }),
      )
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy()
    }
  }, [vantaEffect])
  return <div id="net" ref={vantaRef}></div>
}

export default BackgroundAnimation
