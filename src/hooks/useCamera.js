import { useRef, useState, useCallback, useEffect } from 'react'

export function useCamera(facingMode = 'environment') {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | requesting | active | denied | unavailable
  const [error, setError] = useState(null)
  const [torchOn, setTorchOn] = useState(false)

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unavailable')
      return
    }
    setStatus('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setStatus('active')
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setStatus('denied')
      } else {
        setStatus('unavailable')
        setError(err.message)
      }
    }
  }, [facingMode])

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setStatus('idle')
  }, [])

  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] })
      setTorchOn(v => !v)
    } catch {
      // torch not supported on this device — silently ignore
    }
  }, [torchOn])

  useEffect(() => () => stop(), [stop])

  return { videoRef, status, error, torchOn, start, stop, toggleTorch }
}
