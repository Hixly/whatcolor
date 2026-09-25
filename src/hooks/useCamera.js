import { useRef, useState, useCallback, useEffect } from 'react'

export function useCamera(facingMode = 'environment') {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  // Each start() gets a number; anything that resolves for an older number is
  // stale (the camera was stopped or restarted meanwhile) and is shut down.
  const requestRef = useRef(0)
  const [status, setStatus] = useState('idle') // idle | requesting | active | denied | unavailable
  const [error, setError] = useState(null)
  const [torchOn, setTorchOn] = useState(false)

  const start = useCallback(async () => {
    const request = ++requestRef.current
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unavailable')
      return
    }
    setStatus('requesting')
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
      })
    } catch (err) {
      if (request !== requestRef.current) return
      if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
        setStatus('denied')
      } else {
        setStatus('unavailable')
        setError(err.message)
      }
      return
    }
    if (request !== requestRef.current) {
      stream.getTracks().forEach(t => t.stop())
      return
    }
    streamRef.current = stream
    const video = videoRef.current
    if (video) {
      video.srcObject = stream
      try {
        await video.play()
      } catch (err) {
        // A newer start() swapping the source aborts this play(); that's fine.
        if (err.name !== 'AbortError' && request === requestRef.current) setError(err.message)
      }
    }
    if (request === requestRef.current) setStatus('active')
  }, [facingMode])

  const stop = useCallback(() => {
    requestRef.current++
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setTorchOn(false)
    setStatus('idle')
  }, [])

  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] })
      setTorchOn(v => !v)
    } catch {
      // Torch isn't supported on this device; nothing to do.
    }
  }, [torchOn])

  useEffect(() => () => stop(), [stop])

  return { videoRef, status, error, torchOn, start, stop, toggleTorch }
}
