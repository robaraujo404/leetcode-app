// Plays a pre-generated narration of a problem's prompt
// (public/audio/<en|pt>/<slug>.mp3), matching the app's language toggle.
// Static files, no API calls at runtime.
import { useEffect, useRef, useState } from 'react'
import { useLang } from '../lib/i18n'

export function AudioButton({ slug }: { slug: string }) {
  const { lang } = useLang()
  const ref = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  // Switching language mid-playback should restart in the new language, not
  // keep narrating the old one.
  useEffect(() => {
    ref.current?.pause()
  }, [lang])

  function toggle() {
    const el = ref.current
    if (!el) return
    if (playing) {
      el.pause()
    } else {
      el.currentTime = 0
      void el.play()
    }
  }

  return (
    <>
      <button
        onClick={toggle}
        aria-label="play prompt audio"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 transition active:scale-95 active:bg-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:active:bg-violet-900"
      >
        {playing ? '⏸' : '▶'}
      </button>
      <audio
        ref={ref}
        src={`audio/${lang}/${slug}.mp3`}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
    </>
  )
}
