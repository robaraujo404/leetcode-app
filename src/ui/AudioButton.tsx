// Plays a pre-generated narration of a problem's prompt (public/audio/<slug>.mp3).
// Static file, no API calls at runtime.
import { useRef, useState } from 'react'

export function AudioButton({ slug }: { slug: string }) {
  const ref = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

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
        src={`audio/${slug}.mp3`}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
    </>
  )
}
