import React, { useEffect, useRef } from 'react'

type SoundwaveProps = {
  minWidth?: number
  maxWidth?: number
  height?: number
  barWidth?: number
  barGap?: number
  barColor?: string
}

const Soundwave: React.FC<SoundwaveProps> = ({ minWidth = 100, maxWidth = 300, height = 35, barWidth = 2, barGap = 1, barColor = '#aaaaaa' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const maxBarHeight = height * 0.4

  const generateRandomWaveform = (samples: number): number[] => {
    const frequency = 0.05 + Math.random() * 0.1
    const amplitude = maxBarHeight * 0.7
    const noiseLevel = 0.3 + Math.random() * 0.4

    const waveform = []
    for (let i = 0; i < samples; i++) {
      const sineValue = Math.sin(i * frequency) * amplitude + Math.sin(i * frequency * 2) * (amplitude / 3)
      const noise = (Math.random() - 0.5) * amplitude * noiseLevel
      const value = Math.abs(sineValue + noise)
      waveform.push(Math.min(value, maxBarHeight))
    }
    return waveform
  }

  const drawWaveform = (waveform: number[], width: number, ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = barColor

    waveform.forEach((barHeight, i) => {
      const x = i * (barWidth + barGap)
      const y = height / 2 - barHeight / 2
      ctx.fillRect(x, y, barWidth, barHeight)
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const width = Math.floor(minWidth + Math.random() * (maxWidth - minWidth + 1))
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const samples = Math.floor(width / (barWidth + barGap))
    const waveform = generateRandomWaveform(samples)

    drawWaveform(waveform, width, ctx)
  }, [])

  return <canvas ref={canvasRef} style={{ display: 'block' }} />
}

export default Soundwave
