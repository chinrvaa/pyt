/**
 * Hackathon landing. Edit SITE below.
 * LAYOUT_MODE: 'carti' = YZY Money-style black / red / brutal caps; 'cryptic' = sparse mono editorial; 'default' = cards.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './cryptic.css'
import './carti.css'

const SITE = {
  /** Primary title (sentence case) */
  gameName: 'Protect your bags',
  /** Second line under title, e.g. chain */
  chainLine: 'on Solana',
  applyUrl: 'https://bags.fm/apply',
  hackathonInfoUrl: 'https://bags.fm/hackathon',
  githubRepoUrl: '' as string,
  robloxPlaceUrl: '' as string,
  demoVideoUrl: 'https://youtu.be/RpjuuTuyKks',
  contactEmail: 'respectcooks@protonmail.com',
  xHandle: 'respectcooks',
  /** Token mint / contract address on Solana (optional). Shown as CA with rgb gradient. */
  coinAddress: '' as string,
  /**
   * Background audio: tries unmuted autoplay first; if blocked, starts muted (still “autoplay”) then unmutes on first
   * tap, key, or the SOUND ON control. Browsers require a gesture for audible autoplay.
   */
  bgMusicSrc: `${import.meta.env.BASE_URL}audio/rather-lie-slowed-reverb.mp3`,
}

/** Toggle whole-site personality */
const LAYOUT_MODE: 'default' | 'cryptic' | 'carti' = 'carti'

/** Roadmap lines (all layouts). Plain talk, no week labels. */
const ROADMAP = [
  'Wire Roblox session stats and leaderboards into Bags / Solana so the game is part of the token story, not a silo.',
  'Keep the Bags launch feed alive in Roblox (conveyor, graduations) and mirror the same beats in Discord.',
  'Add holder verification and small in-game perks for people who actually show up, not wallet tourists.',
  'Ship a lightweight dashboard and run retention experiments on the core loop until it feels sticky.',
  'Drop an alpha slice and share real traction: actives, retention, feed-driven moments.',
] as const

function youtubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
  } catch {
    return null
  }
  return null
}

/** Renders SITE.chainLine with Solana in Solana-style rgb gradient text */
function ChainLineRich({ variant }: { variant: 'carti' | 'cryptic' | 'default' }) {
  const m = SITE.chainLine.trim().match(/^(.+?)\s+(solana)\s*$/i)
  if (!m) {
    return <>{SITE.chainLine}</>
  }
  const [, before, solWord] = m
  if (variant === 'carti') {
    return (
      <>
        {before.toUpperCase()} <span className="cz-solana">{solWord.toUpperCase()}</span>
      </>
    )
  }
  if (variant === 'cryptic') {
    return (
      <>
        {before} <span className="cr-solana">{solWord}</span>
      </>
    )
  }
  return (
    <>
      {before} <span className="hero-solana">{solWord}</span>
    </>
  )
}

function CoinAddressLine({ variant }: { variant: 'carti' | 'cryptic' | 'default' }) {
  const ca = SITE.coinAddress.trim()
  if (!ca) return null
  if (variant === 'carti') {
    return (
      <p className="cz-ca-line">
        <span className="cz-ca-label">CA</span>{' '}
        <span className="cz-ca-value">{ca}</span>
      </p>
    )
  }
  if (variant === 'cryptic') {
    return (
      <p className="cr-ca-line">
        <span className="cr-ca-label">CA</span>{' '}
        <span className="cr-ca-value">{ca}</span>
      </p>
    )
  }
  return (
    <p className="hero-ca-line">
      <span className="hero-ca-label">CA</span>{' '}
      <span className="hero-ca-value">{ca}</span>
    </p>
  )
}

/** Full-screen white flash on first paint, skipped when `prefers-reduced-motion: reduce`. */
function FlashbangIntro() {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(true)

  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setActive(false)
    }
  }, [])

  useEffect(() => {
    if (!active) return
    const el = ref.current
    if (!el) return
    const onEnd = (e: AnimationEvent) => {
      if (e.animationName === 'flashbang-fade') setActive(false)
    }
    el.addEventListener('animationend', onEnd)
    const fallback = window.setTimeout(() => setActive(false), 3800)
    return () => {
      el.removeEventListener('animationend', onEnd)
      window.clearTimeout(fallback)
    }
  }, [active])

  if (!active) return null

  return <div ref={ref} className="flashbang-overlay" aria-hidden="true" />
}

function BackgroundMusic({ variant }: { variant: 'carti' | 'cryptic' | 'default' }) {
  const src = SITE.bgMusicSrc.trim()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  /** Track is playing muted so browsers that block unmuted autoplay still start the track immediately. */
  const [silentAutoplay, setSilentAutoplay] = useState(false)

  useEffect(() => {
    const el = audioRef.current
    if (!el || !src) return

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)

    let cancelled = false

    const detachGesture = () => {
      document.removeEventListener('pointerdown', onFirstGesture)
      document.removeEventListener('keydown', onFirstGesture)
    }

    const tryStart = async () => {
      if (cancelled || !el) return
      try {
        el.muted = false
        await el.play()
        setSilentAutoplay(false)
        detachGesture()
      } catch {
        try {
          el.muted = true
          await el.play()
          setSilentAutoplay(true)
        } catch {
          /* still blocked; gesture will retry */
        }
      }
    }

    const onFirstGesture = () => {
      if (!el || cancelled) return
      if (el.muted && !el.paused) {
        el.muted = false
        setSilentAutoplay(false)
        detachGesture()
        return
      }
      el.muted = false
      setSilentAutoplay(false)
      void el.play().then(() => detachGesture()).catch(() => void tryStart())
    }

    document.addEventListener('pointerdown', onFirstGesture)
    document.addEventListener('keydown', onFirstGesture)

    void tryStart()
    el.addEventListener('canplaythrough', tryStart, { once: true })
    el.addEventListener('loadeddata', tryStart, { once: true })

    return () => {
      cancelled = true
      el.muted = false
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('canplaythrough', tryStart)
      el.removeEventListener('loadeddata', tryStart)
      detachGesture()
    }
  }, [src])

  if (!src) return null

  const wrapClass = variant === 'carti' ? 'cz-music' : variant === 'cryptic' ? 'cr-music' : 'site-music'
  const btnClass = variant === 'carti' ? 'cz-music-btn' : variant === 'cryptic' ? 'cr-music-btn' : 'site-music-btn'

  async function toggle() {
    const el = audioRef.current
    if (!el) return
    if (silentAutoplay) {
      el.muted = false
      setSilentAutoplay(false)
      try {
        await el.play()
      } catch {
        setPlaying(false)
      }
      return
    }
    if (playing) {
      el.pause()
      return
    }
    try {
      el.muted = false
      await el.play()
    } catch {
      setPlaying(false)
    }
  }

  const label = silentAutoplay
    ? 'Unmute background music'
    : playing
      ? 'Pause background music'
      : 'Play background music'
  const caption =
    variant === 'carti'
      ? silentAutoplay
        ? 'SOUND ON'
        : playing
          ? 'PAUSE'
          : 'PLAY'
      : silentAutoplay
        ? 'Sound on'
        : playing
          ? 'Pause'
          : 'Play'

  return (
    <div className={wrapClass}>
      <audio ref={audioRef} src={src} loop preload="auto" />
      <button type="button" className={btnClass} onClick={toggle} aria-pressed={playing} aria-label={label}>
        {caption}
      </button>
    </div>
  )
}

function NavSep() {
  return <span className="sep">·</span>
}

function CartiNavSep() {
  return <span className="cz-sep">/</span>
}

type SectionId = 'overview' | 'telemetry' | 'bags-api' | 'discord' | 'this-site'

const SECTION_ORDER: SectionId[] = ['overview', 'telemetry', 'bags-api', 'discord', 'this-site']

const CARTI_NAV = [
  { id: 'cz-home', label: 'Home' },
  { id: 'cz-jump', label: 'Links' },
  { id: 'cz-vibe', label: 'The vibe' },
  { id: 'cz-stats', label: 'Stats' },
  { id: 'cz-bags', label: 'Bags feed' },
  { id: 'cz-discord', label: 'Discord' },
  { id: 'cz-site', label: 'This site' },
  { id: 'cz-demo', label: 'Demo' },
  { id: 'cz-roadmap', label: 'Roadmap' },
  { id: 'cz-contact', label: 'Say hi' },
] as const

const CARTI_SECTION_IDS: string[] = CARTI_NAV.map((n) => n.id)

function sectionMenuLabel(id: SectionId): string {
  const labels: Record<SectionId, string> = {
    overview: 'Overview',
    telemetry: 'Telemetry & leaderboards',
    'bags-api': 'Bags API, live pipeline',
    discord: 'Discord automations',
    'this-site': 'This page & story',
  }
  return labels[id]
}

function SectionReadout({ id }: { id: SectionId }) {
  switch (id) {
    case 'overview':
      return (
        <p>
          I want Roblox progression that actually means something for <strong>Bags</strong>: launch-feed energy
          in-world, real hooks for holders, Discord doing work while we sleep. Play, then telemetry, then Bags / Solana
          context, then the community sees it too.
        </p>
      )
    case 'telemetry':
      return (
        <p>
          <strong>Telemetry.</strong> Money, steals, rebirths, whatever the loop is: leaderboards and stats that plug
          into Bags / Solana so off-platform story matches what players did on-platform.
        </p>
      )
    case 'bags-api':
      return (
        <p>
          <strong>Bags API.</strong> When the launch feed moves, the game spawns and graduates in sync, and Discord gets
          the same signal so holders aren&apos;t guessing.
        </p>
      )
    case 'discord':
      return (
        <p>
          <strong>Discord.</strong> Digests and milestone pings so the loop doesn&apos;t die when Studio closes.
        </p>
      )
    case 'this-site':
      return (
        <p>
          <strong>This site.</strong> My hackathon face: what I&apos;m building, the demo, how to reach me. No secret
          deck fantasy.
        </p>
      )
  }
}

/** Cryptic layout: dropdown index + single readout panel. */
function IndexSectionPicker() {
  const [active, setActive] = useState<SectionId>('overview')
  const selectId = 'index-section-cryptic'
  const hintId = 'index-hint-cryptic'
  const labelId = `${selectId}-label`

  return (
    <section id="index" className="cr-index" aria-labelledby={labelId}>
      <div className="cr-dropdown">
        <label id={labelId} className="cr-dropdown-label" htmlFor={selectId}>
          INDEX
        </label>
        <select
          id={selectId}
          className="cr-dropdown-select"
          aria-label="Choose a topic to read"
          aria-describedby={hintId}
          value={active}
          onChange={(e) => setActive(e.target.value as SectionId)}
        >
          {SECTION_ORDER.map((sid) => (
            <option key={sid} value={sid}>
              {sectionMenuLabel(sid)}
            </option>
          ))}
        </select>
        <p id={hintId} className="cr-dropdown-hint">
          Pick a topic; the note below swaps. Same stuff you&apos;d scroll past on the main lane, just compact here.
        </p>
      </div>
      <div className="cr-index-readout" aria-live="polite">
        <article className="cr-block">
          <SectionReadout id={active} />
        </article>
      </div>
    </section>
  )
}

function useScrollSpy(sectionIds: readonly string[]) {
  const key = sectionIds.join('|')
  const [activeId, setActiveId] = useState<string>(() => sectionIds[0] ?? '')

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (elements.length === 0) return

    const ratios = new Map<string, number>()

    const flush = () => {
      let best = sectionIds[0] ?? ''
      let bestVal = -1
      for (const id of sectionIds) {
        const v = ratios.get(id) ?? 0
        if (v > bestVal) {
          bestVal = v
          best = id
        }
      }
      if (bestVal > 0) setActiveId(best)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0)
        }
        flush()
      },
      { root: null, rootMargin: '-10% 0px -42% 0px', threshold: [0, 0.08, 0.15, 0.25, 0.4, 0.6, 0.85, 1] },
    )

    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [key, sectionIds])

  return activeId
}

function CartiScrollIndex({ activeId }: { activeId: string }) {
  return (
    <nav className="cz-scroll-index" aria-label="On this page">
      <div className="cz-scroll-index__rail">
        <p className="cz-scroll-index__label">On page</p>
        <ul className="cz-scroll-index__list">
          {CARTI_NAV.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`cz-scroll-index__link${activeId === item.id ? ' is-active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

function CartiLayout() {
  const videoEmbed = SITE.demoVideoUrl ? youtubeEmbedUrl(SITE.demoVideoUrl) : null
  const activeSection = useScrollSpy(CARTI_SECTION_IDS)

  return (
    <div className="carti-shell">
      <CartiScrollIndex activeId={activeSection} />
      <main className="carti-vibe enter-page">
        <section id="cz-home" className="cz-section">
          <header className="cz-top">
            <span className="cz-brand">{SITE.gameName.toUpperCase()}</span>
            <span className="cz-tag">BAGS HACKATHON</span>
          </header>

          <div className="cz-hero">
            <h1 className="cz-hero-title">
              <span className="cz-hero-line cz-hero-line--main">{SITE.gameName.toUpperCase()}</span>
              <span className="cz-hero-line cz-hero-line--chain">
                <ChainLineRich variant="carti" />
              </span>
            </h1>
            <p className="cz-hero-sub">ROBLOX · LIVE FEED · BAGS · ME + THE TEAM</p>
            <CoinAddressLine variant="carti" />
            <p className="cz-hero-voice">
              Hey. I&apos;m shipping a Roblox loop that actually talks to <strong>Bags</strong>: loud launch feed in the
              experience, holders get love, Discord hears the same wins the server sees. Less pitch deck, more wiring.
            </p>
          </div>

          <p className="cz-strip">HACKATHON MODE: UTILITY OVER NOISE</p>
        </section>

        <section id="cz-jump" className="cz-section" aria-label="Quick links">
          <h2 className="cz-section-title">Jump</h2>
          <p className="cz-section-kicker">Tap these first if you&apos;re in a hurry.</p>
          <nav className="cz-nav" aria-label="Primary">
            <a href={SITE.applyUrl} target="_blank" rel="noreferrer">
              APPLY
            </a>
            <CartiNavSep />
            <a href={SITE.hackathonInfoUrl} target="_blank" rel="noreferrer">
              INFO
            </a>
            <CartiNavSep />
            {SITE.githubRepoUrl ? (
              <a href={SITE.githubRepoUrl} target="_blank" rel="noreferrer">
                GITHUB
              </a>
            ) : (
              <span className="cz-placeholder">GITHUB ·</span>
            )}
            <CartiNavSep />
            <span className="cz-placeholder">ROBLOX · SOON</span>
          </nav>
        </section>

        <section id="cz-vibe" className="cz-section">
          <h2 className="cz-section-title">The vibe</h2>
          <p className="cz-section-body">
            I care about closing the loop: you play, the backend nudges <strong>Bags</strong>, the conveyor and Discord
            react to the same launches. Holders shouldn&apos;t have to guess what the game already knows.
          </p>
        </section>

        <section id="cz-stats" className="cz-section">
          <h2 className="cz-section-title">Stats &amp; boards</h2>
          <p className="cz-section-body">
            Money, steals, rebirths, whatever your core loop is. I want that data <strong>honest</strong> and visible so
            leaderboards and on-chain story don&apos;t feel like fan fiction.
          </p>
        </section>

        <section id="cz-bags" className="cz-section">
          <h2 className="cz-section-title">Bags feed</h2>
          <p className="cz-section-body">
            When the launch feed ticks, I spawn and graduate in-world and hit <strong>Discord</strong> with the same
            pulse. One truth, three surfaces: Roblox, Bags context, community chat.
          </p>
        </section>

        <section id="cz-discord" className="cz-section">
          <h2 className="cz-section-title">Discord</h2>
          <p className="cz-section-body">
            Automated digests and milestone alerts because the energy shouldn&apos;t die when I close{' '}
            <strong>Studio</strong>. If it mattered in-game, it should ping the server.
          </p>
        </section>

        <section id="cz-site" className="cz-section">
          <h2 className="cz-section-title">This page</h2>
          <p className="cz-section-body">
            This URL is my hackathon handshake: build story, demo, roadmap, contacts. I&apos;d rather show wires than
            hide behind a &quot;deck coming soon&quot; email.
          </p>
        </section>

        <section id="cz-demo" className="cz-section">
          <h2 className="cz-section-title">Demo</h2>
          <p className="cz-section-body">If you watch one thing, make it this. Rough edges welcome; that&apos;s the point.</p>
          {videoEmbed ? (
            <div className="cz-video">
              <iframe title="Demo" src={videoEmbed} allowFullScreen />
            </div>
          ) : (
            <div className="cz-video">Drop a URL in SITE.demoVideoUrl and this fills in.</div>
          )}
        </section>

        <section id="cz-roadmap" className="cz-section">
          <h2 className="cz-section-title">Roadmap</h2>
          <p className="cz-section-body">What I&apos;m actually chasing next. No fake quarterly theater.</p>
          <ul className="cz-road-list">
            {ROADMAP.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        <section id="cz-contact" className="cz-section">
          <h2 className="cz-section-title">Say hi</h2>
          <p className="cz-section-body">
            Still here? Same. I&apos;m down to talk shop, collab, or roast the build. Reach out anytime.
          </p>
          <footer className="cz-foot">
            <p className="cz-foot-signoff">
              Built by people who still stay up for deploys. Ping me:
            </p>
            <span>
              {SITE.contactEmail ? (
                <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
              ) : (
                'EMAIL ·'
              )}
            </span>
            <span>
              {SITE.xHandle ? (
                <a href={`https://x.com/${SITE.xHandle.replace(/^@/, '')}`} target="_blank" rel="noreferrer">
                  {SITE.xHandle.startsWith('@') ? SITE.xHandle : `@${SITE.xHandle}`}
                </a>
              ) : (
                'X ·'
              )}
            </span>
          </footer>
        </section>

        <BackgroundMusic variant="carti" />
      </main>
    </div>
  )
}

function CrypticLayout() {
  const videoEmbed = SITE.demoVideoUrl ? youtubeEmbedUrl(SITE.demoVideoUrl) : null

  return (
    <main className="cryptic-vibe enter-page">
      <header className="cr-top">
        <a className="cr-brand" href="#">
          {SITE.gameName}
        </a>
        <a className="cr-muted" href="#index">
          Info
        </a>
      </header>

      <h1 className="cr-title">{SITE.gameName}</h1>
      <p className="cr-sub">
        <ChainLineRich variant="cryptic" />
      </p>
      <CoinAddressLine variant="cryptic" />

      <p className="cr-service">Bags × Roblox · hackathon</p>

      <nav className="cr-nav" aria-label="Primary">
        <a href={SITE.applyUrl} target="_blank" rel="noreferrer">
          Apply
        </a>
        <NavSep />
        <a href={SITE.hackathonInfoUrl} target="_blank" rel="noreferrer">
          Hackathon
        </a>
        <NavSep />
        {SITE.githubRepoUrl ? (
          <a href={SITE.githubRepoUrl} target="_blank" rel="noreferrer">
            GitHub
          </a>
        ) : (
          <span style={{ color: '#525252' }}>GitHub ·</span>
        )}
        <NavSep />
        <span style={{ color: '#525252' }}>Roblox, coming soon</span>
      </nav>

      <IndexSectionPicker />

      <details className="cr-details">
        <summary>Demo</summary>
        {videoEmbed ? (
          <div className="cr-video">
            <iframe title="Demo" src={videoEmbed} allowFullScreen />
          </div>
        ) : (
          <div className="cr-video">Set SITE.demoVideoUrl (YouTube)</div>
        )}
      </details>

      <details className="cr-details">
        <summary>What we&apos;re doing next</summary>
        <ul className="cr-check">
          {ROADMAP.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </details>

      <footer className="cr-foot">
        <span>
          {SITE.contactEmail ? (
            <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
          ) : (
            'email ·'
          )}
        </span>
        <span>
          {SITE.xHandle ? (
            <a href={`https://x.com/${SITE.xHandle.replace(/^@/, '')}`} target="_blank" rel="noreferrer">
              {SITE.xHandle.startsWith('@') ? SITE.xHandle : `@${SITE.xHandle}`}
            </a>
          ) : (
            'x ·'
          )}
        </span>
        <span style={{ marginLeft: 'auto', opacity: 0.45 }} title="Set LAYOUT_MODE to 'default' in App.tsx for card UI">
          layout: cryptic
        </span>
      </footer>
      <BackgroundMusic variant="cryptic" />
    </main>
  )
}

function DefaultLayout() {
  const videoEmbed = SITE.demoVideoUrl ? youtubeEmbedUrl(SITE.demoVideoUrl) : null

  return (
    <main className="page enter-page">
      <section className="hero">
        <p className="badge">Bags Hackathon</p>
        <h1>{SITE.gameName}</h1>
        <p className="heroChain">
          <ChainLineRich variant="default" />
        </p>
        <CoinAddressLine variant="default" />
        <p className="lead">
          I&apos;m building a Roblox-first loop around <strong className="accent">Bags</strong> token utility: a live
          launch feed in-game, real holder-facing signals, Discord automation that keeps up, and a site I&apos;m not
          embarrassed to link.
        </p>
        <div className="ctaRow">
          <a className="btn btnPrimary" href={SITE.applyUrl} target="_blank" rel="noreferrer">
            Apply on Bags
          </a>
          <a className="btn btnTeal" href={SITE.hackathonInfoUrl} target="_blank" rel="noreferrer">
            Hackathon info
          </a>
          {SITE.githubRepoUrl ? (
            <a className="btn" href={SITE.githubRepoUrl} target="_blank" rel="noreferrer">
              GitHub repo
            </a>
          ) : (
            <span className="btn btnGhost" title="Set SITE.githubRepoUrl in App.tsx">
              GitHub repo: set URL
            </span>
          )}
          <span className="btn btnGhost" title="Roblox experience link coming soon">
            Roblox, coming soon
          </span>
        </div>
      </section>

      <section className="card videoCard">
        <div className="videoHeader">
          <h2>Demo reel</h2>
          <span>{SITE.demoVideoUrl ? 'Embedded' : 'Add URL'}</span>
        </div>
        <p>
          Target <strong>&lt; 90s</strong>: problem → Roblox gameplay → Bags / on-chain hook → 30-day roadmap.
        </p>
        {videoEmbed ? (
          <div className="videoEmbedWrap">
            <iframe
              title="Project demo"
              src={videoEmbed}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="videoFrame">
            <div className="playPulse" aria-hidden="true"></div>
            <p>
              Set <code>SITE.demoVideoUrl</code> to a YouTube watch link for an instant embed. (Loom: use share link
              in a CTA button instead.)
            </p>
          </div>
        )}
      </section>

      <section className="grid">
        <article className="card">
          <h2>What we are building</h2>
          <ul>
            <li>Roblox leaderboard + session signals (money, steals, rebirths)</li>
            <li>Bags API usage: e.g. token launch feed → in-game &quot;live on Bags&quot; conveyor + Discord milestones</li>
            <li>Holder utility hooks (roles, perks, verification path)</li>
            <li>Automated Discord digests and milestone alerts</li>
          </ul>
        </article>
        <article className="card">
          <h2>Why it fits Bags</h2>
          <ul>
            <li>Real gameplay utility, not hype-only mechanics</li>
            <li>Verifiable loop: game activity → backend → Bags / Solana context → community surfaces</li>
            <li>Transparent dashboard story for players and holders</li>
            <li>Shipped prototype + measurable 30-day roadmap</li>
          </ul>
        </article>
      </section>

      <section className="card">
        <h2>Bags integration (be specific in your application)</h2>
        <p>
          Example you can copy:{' '}
          <em>
            Server polls Bags public API for token launch status, spawns matching live tokens on the Roblox conveyor,
            and announces graduations to Discord.
          </em>{' '}
          Adjust to match your exact implementation.
        </p>
        <div className="stack">
          <span>Roblox</span>
          <span>Node / Lua services</span>
          <span>Bags API</span>
          <span>Solana RPC</span>
          <span>Discord webhooks</span>
          <span>Public site (this page)</span>
        </div>
      </section>

      <section className="grid">
        <article className="card">
          <h2>What we&apos;re doing next</h2>
          <ul>
            {ROADMAP.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </article>
        <article className="card">
          <h2>Traction targets</h2>
          <ul>
            <li>Daily actives + D1/D7 retention</li>
            <li>Leaderboard interactions / day</li>
            <li>Launch-feed-driven events (claims, graduations)</li>
            <li>Discord alert engagement</li>
          </ul>
        </article>
      </section>

      <footer className="footer">
        <p>
          Contact:{' '}
          {SITE.contactEmail ? (
            <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
          ) : (
            <span className="muted">Set SITE.contactEmail</span>
          )}
        </p>
        <p>
          X:{' '}
          {SITE.xHandle ? (
            <a href={`https://x.com/${SITE.xHandle.replace(/^@/, '')}`} target="_blank" rel="noreferrer">
              {SITE.xHandle.startsWith('@') ? SITE.xHandle : `@${SITE.xHandle}`}
            </a>
          ) : (
            <span className="muted">Set SITE.xHandle</span>
          )}
        </p>
      </footer>
      <BackgroundMusic variant="default" />
    </main>
  )
}

function App() {
  const layout =
    LAYOUT_MODE === 'carti' ? (
      <CartiLayout />
    ) : LAYOUT_MODE === 'cryptic' ? (
      <CrypticLayout />
    ) : (
      <DefaultLayout />
    )
  return (
    <>
      <FlashbangIntro />
      {layout}
    </>
  )
}

export default App
