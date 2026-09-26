import { useState, useEffect } from 'react'
import { DownloadIcon, ShareIcon, XIcon } from '../ui/Icons'

const DISMISS_KEY = 'wc_install_dismissed'

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream
}

function wasDismissed() {
  try { return !!localStorage.getItem(DISMISS_KEY) } catch { return false }
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null) // Android/Chromium beforeinstallprompt event
  // iOS Safari has no install event, so it gets manual Add-to-Home-Screen
  // instructions, decided once up front.
  const [iosHint] = useState(() => isIOS() && !isStandalone() && !wasDismissed())
  const [visible, setVisible] = useState(iosHint)

  useEffect(() => {
    if (isStandalone() || wasDismissed()) return

    // Android / desktop Chromium: capture the install event and show our own button.
    const onBeforeInstall = (e) => {
      e.preventDefault()
      setDeferred(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    const onInstalled = () => setVisible(false)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  function dismiss() {
    setVisible(false)
    try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
  }

  async function install() {
    if (!deferred) return
    deferred.prompt()
    try { await deferred.userChoice } catch { /* ignore */ }
    setDeferred(null)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-md flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/90 backdrop-blur-xl border border-black/[0.07] raised-light animate-fade-up">
        <div className="w-11 h-11 rounded-xl shrink-0 bg-gray-50 border border-black/5 flex items-center justify-center overflow-hidden">
          <img src="/icon-192.png?v=3" alt="" className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          {iosHint ? (
            <>
              <p className="text-sm font-semibold text-gray-900 leading-tight">Install WhatColor</p>
              <p className="text-[12px] text-gray-500 font-light leading-snug mt-0.5 flex items-center gap-1 flex-wrap">
                Tap <ShareIcon size={13} className="inline text-gray-500" /> then “Add to Home Screen”
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-900 leading-tight">Install WhatColor</p>
              <p className="text-[12px] text-gray-500 font-light leading-snug mt-0.5">Add it to your home screen. It opens like a real app.</p>
            </>
          )}
        </div>

        {!iosHint && (
          <button
            onClick={install}
            className="group/inst shrink-0 inline-flex items-center gap-1.5 pl-3 pr-4 py-2 bg-[#111] text-white text-sm font-semibold rounded-full raised-dark hover:bg-black transition-all duration-200 ease-spring active:scale-95"
          >
            <DownloadIcon size={14} className="transition-transform duration-300 ease-spring group-hover/inst:translate-y-0.5" />
            Install
          </button>
        )}

        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-all duration-200 ease-spring active:scale-90"
        >
          <XIcon size={15} />
        </button>
      </div>
    </div>
  )
}
