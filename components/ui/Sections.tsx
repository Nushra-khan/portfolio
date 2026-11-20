'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { about, achievements, contact, experience, leadership, projects, recipes, research, site, skillGroups, skillId } from '@/content/site';
import { nav, playBell, setUI, useUI } from '@/lib/store';
import { BellIcon } from '../Experience';

const panel = 'pointer-events-auto rounded-[28px] border border-white/70 bg-cream/[0.86] shadow-soft backdrop-blur-xl';
/** Bottom sheet on phones & portrait tablets, side card on landscape screens. */
const sheet = 'w-full overflow-y-auto overscroll-contain p-5 sm:p-7 max-h-[56svh] side:max-h-[calc(100svh-8rem)] side:p-8 short:max-h-[calc(100svh-6rem)] short:p-5';

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={`mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] ${dark ? 'text-honey' : 'text-terracotta'}`}>
      <span className={`h-px w-6 ${dark ? 'bg-honey' : 'bg-terracotta'}`} />
      {children}
    </p>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */

export function Sections({ hidden = false }: { hidden?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // hero copy drifts away as you start walking
      gsap.to('[data-hero]', {
        opacity: 0,
        y: -40,
        ease: 'none',
        scrollTrigger: { trigger: '#welcome', start: 'top top', end: '35% top', scrub: true },
      });
      gsap.to('[data-hint]', {
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: '#welcome', start: 'top top', end: '8% top', scrub: true },
      });

      // panels rise in gently as each room is reached
      gsap.utils.toArray<HTMLElement>('[data-panel]').forEach((el) => {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        gsap.fromTo(
          el.querySelectorAll('[data-reveal]'),
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.07,
            scrollTrigger: { trigger: el.closest('section'), start: 'top 55%', toggleActions: 'play none none reverse' },
          },
        );
      });

      // about: as the camera turns to the recognition wall, swap the panels
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '#about', start: 'top top', end: 'bottom bottom', scrub: 0.8 },
      });
      tl.set({}, {}, 0)
        .to('[data-about-1]', { opacity: 0, y: -24, pointerEvents: 'none', duration: 0.08, ease: 'power1.inOut' }, 0.33)
        .fromTo(
          '[data-about-2]',
          { opacity: 0, y: 24, pointerEvents: 'none' },
          { opacity: 1, y: 0, pointerEvents: 'auto', duration: 0.1, ease: 'power1.out', immediateRender: false },
          0.4,
        )
        .set({}, {}, 1);

      // library: publications first, then the reading nook with work experience
      gsap
        .timeline({ scrollTrigger: { trigger: '#research', start: 'top top', end: 'bottom bottom', scrub: 0.8 } })
        .set({}, {}, 0)
        .to('[data-research-1]', { opacity: 0, y: -24, duration: 0.08, ease: 'power1.inOut' }, 0.36)
        .set('[data-research-1]', { pointerEvents: 'none' }, 0.4)
        .fromTo('[data-research-2]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.1, ease: 'power1.out', immediateRender: false }, 0.42)
        .set('[data-research-2]', { pointerEvents: 'auto' }, 0.44)
        .set({}, {}, 1);

      // workshop: skill jars first, then the project cards slide along the bench
      const t = track.current;
      if (t) {
        const wt = gsap.timeline({
          scrollTrigger: { trigger: '#projects', start: 'top top', end: 'bottom bottom', scrub: 1.2, invalidateOnRefresh: true },
        });
        wt.set({}, {}, 0)
          .set('[data-cards] [data-pe], [data-cards] article', { pointerEvents: 'none' }, 0)
          .to('[data-skills]', { opacity: 0, y: -24, duration: 0.06, ease: 'power1.inOut' }, 0.34)
          .set('[data-skills] [data-panel]', { pointerEvents: 'none' }, 0.36)
          .fromTo('[data-cards]', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.07, ease: 'power1.out', immediateRender: false }, 0.39)
          .set('[data-cards] [data-pe], [data-cards] article', { pointerEvents: 'auto' }, 0.4)
          .to(t, { x: () => -Math.max(0, t.scrollWidth - t.parentElement!.clientWidth), ease: 'none', duration: 0.5 }, 0.48)
          .set({}, {}, 1);
      }
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={root} className={`pointer-events-none relative z-10 ${hidden ? 'invisible' : ''}`}>
      <Welcome />
      <About />
      <Projects trackRef={track} />
      <Research />
      <Cooking />
      <Contact />
    </main>
  );
}

/* ------------------------------------------------------------ welcome -- */

function Welcome() {
  const ring = () => {
    playBell();
    setTimeout(() => nav.scrollTo('about', { duration: 4.2 }), 400);
  };
  return (
    <section id="welcome" className="relative h-[260vh]" aria-label="Welcome">
      <div className="pointer-events-none sticky top-0 flex h-[100svh] items-end overflow-hidden pb-[8svh] side:items-center side:pb-0">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-[70%] bg-[radial-gradient(ellipse_at_15%_60%,rgba(251,245,233,0.82),rgba(251,245,233,0.35)_38%,transparent_62%)] side:block"
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-cream via-cream/85 to-transparent side:hidden" />
        <div data-hero className="relative w-full px-6 sm:px-10 side:pl-[max(2.5rem,7vw)] side:pt-16">
          <p className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-moss">Welcome to</p>
          <h1 className="max-w-[12ch] font-serif text-[clamp(2.4rem,min(8vw,11svh),6.6rem)] font-[420] leading-[0.92] tracking-[-0.02em] text-ink [font-variation-settings:'SOFT'_100,'WONK'_1]">
            A Little World <em className="font-[380] text-terracotta">of My Own</em>
          </h1>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink/75 sm:text-[17px] short:mt-3 short:text-[14px]">
            {site.name} — {site.role.toLowerCase()}. {site.tagline}
          </p>
          <div className="pointer-events-auto mt-7 flex flex-wrap items-center gap-3 short:mt-4">
            <button
              onClick={ring}
              className="group flex h-12 items-center gap-2.5 rounded-full bg-ink pl-4 pr-6 text-[15px] font-semibold text-cream shadow-soft transition hover:bg-moss"
            >
              <span className="h-6 w-6 text-honey transition-transform group-hover:animate-[sway_0.6s_ease-in-out_2]">
                <BellIcon />
              </span>
              Ring the bell
            </button>
            <button
              onClick={() => nav.scrollTo('projects', { duration: 3.5 })}
              className="flex h-12 items-center gap-2 rounded-full border border-ink/15 bg-cream/70 px-6 text-[15px] font-semibold text-ink backdrop-blur transition hover:bg-cream"
            >
              See my projects
            </button>
          </div>
        </div>
        <div data-hint className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-ink/60 side:flex short:hidden">
          <span className="text-xs font-medium tracking-wide">Scroll to walk up the path</span>
          <span className="h-9 w-5 rounded-full border-2 border-ink/30 p-1">
            <span className="block h-2 w-full animate-[scrollcue_1.8s_ease-in-out_infinite] rounded-full bg-ink/40" />
          </span>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- about -- */

function About() {
  return (
    <section id="about" className="relative h-[340vh]" aria-labelledby="about-h">
      <div className="pointer-events-none sticky top-0 flex h-[100svh] items-end px-3 pb-3 pt-24 side:items-center side:px-6 side:pb-0 short:pt-20">
        <div className="mx-auto grid w-full max-w-6xl justify-items-center side:justify-items-end">
          <div data-about-1 data-panel data-lenis-prevent className={`${panel} ${sheet} max-w-[560px] [grid-area:1/1] side:max-w-[440px]`}>
            <div data-reveal>
              <Eyebrow>{about.eyebrow}</Eyebrow>
            </div>
            <h2 id="about-h" data-reveal className="font-serif text-[clamp(1.7rem,3vw,2.3rem)] font-[450] leading-[1.08] tracking-[-0.01em] text-ink">
              {about.heading}
            </h2>
            {about.paragraphs.map((p, i) => (
              <p key={i} data-reveal className="mt-4 text-[15px] leading-relaxed text-ink/75">
                {p}
              </p>
            ))}
            <dl data-reveal className="mt-6 grid gap-3 border-t border-ink/10 pt-5">
              {about.facts.map((f) => (
                <div key={f.label} className="grid grid-cols-[92px_1fr] gap-3 text-sm">
                  <dt className="font-semibold text-moss">{f.label}</dt>
                  <dd className="text-ink/80">{f.value}</dd>
                </div>
              ))}
            </dl>
            <div data-reveal className="mt-6 flex flex-wrap gap-2">
              <a href={site.resumeUrl} target="_blank" rel="noopener" className="rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-cream hover:brightness-110">
                Download résumé
              </a>
              <button onClick={() => nav.scrollTo('projects')} className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-ink/5">
                Into the workshop →
              </button>
            </div>
            <p data-reveal className="mt-5 hidden text-xs italic text-ink/50 [@media(hover:hover)]:block">
              Psst — hover the laptop on the desk.
            </p>
          </div>
          <Recognition />
        </div>
      </div>
    </section>
  );
}

/** Second About panel — appears as the camera turns to the recognition wall. */
function Recognition() {
  const hovered = useUI((s) => s.hovered);
  return (
    <div
      data-about-2
      data-panel
      data-lenis-prevent
      aria-labelledby="recognition-h"
      className={`${panel} ${sheet} pointer-events-none max-w-[560px] opacity-0 [grid-area:1/1] side:max-w-[440px]`}
    >
      <Eyebrow>The recognition wall</Eyebrow>
      <h3 id="recognition-h" className="font-serif text-[clamp(1.5rem,2.6vw,2rem)] font-[450] leading-tight text-ink">
        Recognition &amp; leadership
      </h3>
      <ul className="mt-4 space-y-2">
        {achievements.map((a) => (
          <li
            key={a.id}
            onMouseEnter={() => setUI({ hovered: a.id === 'gold-medals' ? 'medals' : a.id })}
            onMouseLeave={() => setUI({ hovered: null })}
            className={`flex items-start gap-3 rounded-2xl p-3 transition ${
              hovered === a.id || (a.id === 'gold-medals' && hovered === 'medals') ? 'bg-honey/15' : 'bg-white/40'
            }`}
          >
            <span className="mt-1 w-1.5 shrink-0 self-stretch rounded-full bg-honey" aria-hidden />
            <span>
              <span className="block font-serif text-[16.5px] leading-snug text-ink">{a.title}</span>
              <span className="mt-0.5 block text-[12.5px] text-ink/60">{a.detail}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/45">Leadership &amp; activities</p>
      <ul className="mt-2 space-y-1">
        {leadership.map((r) => (
          <li
            key={r.id}
            onMouseEnter={() => setUI({ hovered: `role:${r.id}` })}
            onMouseLeave={() => setUI({ hovered: null })}
            className={`flex gap-3 rounded-2xl p-3 transition ${hovered === `role:${r.id}` ? 'bg-ink/[0.06]' : 'hover:bg-ink/[0.04]'}`}
          >
            <span className="mt-1 w-1.5 shrink-0 self-stretch rounded-full" style={{ background: r.color }} />
            <span className="min-w-0">
              <span className="block font-serif text-[16px] leading-snug text-ink">{r.title}</span>
              <span className="block text-[12px] font-medium text-ink/55">
                {r.org} · {r.dates}
              </span>
              <span className="mt-1 block text-[13px] leading-relaxed text-ink/70">{r.detail}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 hidden text-xs italic text-ink/50 [@media(hover:hover)]:block">Hover the trophy and plaques on the shelf.</p>
    </div>
  );
}

/** First half of the workshop: the skill-jar shelf, mirrored as readable chips. */
function Toolkit() {
  const hovered = useUI((s) => s.hovered);
  return (
    <div
      data-skills
      className="pointer-events-none absolute inset-0 flex items-end px-3 pb-3 pt-24 side:items-center side:px-6 side:pb-0 short:pt-20"
    >
      <div className="mx-auto flex w-full max-w-6xl justify-center side:justify-start">
        <div data-panel data-lenis-prevent aria-labelledby="skills-h" className={`${panel} ${sheet} max-w-[560px] side:max-w-[400px]`}>
          <Eyebrow>The workshop</Eyebrow>
          <h2 id="skills-h" className="font-serif text-[clamp(1.6rem,3vw,2.3rem)] font-[450] leading-tight text-ink">
            My toolkit
          </h2>
          <p className="mt-1 text-[13.5px] leading-relaxed text-ink/60">
            Every jar on the shelf is something I build with. Hover a skill to find its jar.
          </p>
          <div className="mt-4 space-y-3.5">
            {skillGroups.map((g) => (
              <div key={g.id}>
                <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/55">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: g.color }} />
                  {g.title}
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {g.skills.map((name) => {
                    const id = skillId(name);
                    const on = hovered === id;
                    return (
                      <li
                        key={name}
                        onMouseEnter={() => setUI({ hovered: id })}
                        onMouseLeave={() => setUI({ hovered: null })}
                        className="rounded-full border px-2.5 py-1 text-[12.5px] font-medium text-ink/80 transition"
                        style={{
                          borderColor: on ? g.color : 'rgba(43,42,38,0.12)',
                          background: on ? `${g.color}33` : 'rgba(255,255,255,0.45)',
                        }}
                      >
                        {name}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- projects -- */

function Projects({ trackRef }: { trackRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <section id="projects" className="relative" style={{ height: `${300 + projects.length * 45}vh` }} aria-labelledby="projects-h">
      <div className="pointer-events-none sticky top-0 h-[100svh] overflow-hidden">
        <Toolkit />
      <div data-cards className="pointer-events-none absolute inset-0 flex flex-col justify-end pb-4 pt-24 opacity-0 sm:pb-8 short:pb-2 short:pt-16">
        <div className="mx-auto mb-4 w-full max-w-6xl px-4 sm:px-8 short:mb-2">
          <div className={`${panel} inline-block px-5 py-4 sm:px-6 short:py-2`} data-panel data-pe>
            <div data-reveal>
              <Eyebrow>The workshop</Eyebrow>
            </div>
            <h2 id="projects-h" data-reveal className="font-serif text-[clamp(1.6rem,3vw,2.3rem)] font-[450] leading-tight text-ink">
              Things I’ve built
            </h2>
            <p data-reveal className="mt-1 text-sm text-ink/60 short:hidden">
              Keep scrolling to slide along the bench.
            </p>
          </div>
        </div>
        <div className="w-full overflow-hidden">
          <div ref={trackRef} className="flex w-max gap-3 px-4 will-change-transform sm:gap-5 sm:px-[max(2rem,calc((100vw-72rem)/2+2rem))]">
            {projects.map((p, i) => (
              <article
                key={p.id}
                onMouseEnter={() => p.id === 'foundrfuse' && setUI({ hovered: 'phone' })}
                onMouseLeave={() => p.id === 'foundrfuse' && setUI({ hovered: null })}
                className={`${panel} flex w-[min(82vw,380px)] shrink-0 flex-col p-5 sm:p-6 short:p-4`}
                style={{ borderTop: `4px solid ${p.accent}` }}
              >
                <div className="flex items-baseline justify-between text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <span>{p.year}</span>
                </div>
                <h3 className="mt-3 font-serif text-2xl font-[500] text-ink">{p.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink/75 sm:text-[14.5px]">{p.summary}</p>
                <ul className="mt-3 space-y-1 text-[13px] text-ink/70 short:hidden">
                  {p.details.map((d) => (
                    <li key={d} className="flex gap-2">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: p.accent }} />
                      {d}
                    </li>
                  ))}
                </ul>
                <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tech stack">
                  {p.stack.map((s) => (
                    <li key={s} className="rounded-full bg-ink/[0.06] px-2.5 py-1 text-[11.5px] font-medium text-ink/75">
                      {s}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap gap-2 pt-5 short:pt-3">
                  {p.github && (
                    <a href={p.github} target="_blank" rel="noopener" className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-2 text-[13px] font-semibold text-ink hover:bg-ink/5">
                      <GitHubIcon /> Code
                    </a>
                  )}
                  {p.demo && (
                    <a href={p.demo} target="_blank" rel="noopener" className="flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[13px] font-semibold text-cream hover:bg-moss">
                      {p.demoLabel ?? 'Live demo'} <ArrowIcon />
                    </a>
                  )}
                </div>
              </article>
            ))}
            <div data-pe className={`${panel} flex w-[min(70vw,260px)] shrink-0 flex-col justify-center p-6`}>
              <p className="font-serif text-xl text-ink">More on the shelf</p>
              <p className="mt-2 text-sm text-ink/65">Experiments, tools and half-finished ideas live on GitHub.</p>
              <a href={site.socials[0].href} target="_blank" rel="noopener" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta">
                Visit GitHub <ArrowIcon />
              </a>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- research -- */

function Research() {
  const hovered = useUI((s) => s.hovered);
  return (
    <section id="research" className="relative h-[340vh]" aria-labelledby="research-h">
      <div className="pointer-events-none sticky top-0 flex h-[100svh] items-end px-3 pb-3 pt-24 side:items-center side:px-6 side:pb-0 short:pt-20">
        <div className="mx-auto grid w-full max-w-6xl justify-items-center side:justify-items-start">
          <div data-research-1 data-panel data-lenis-prevent className={`${panel} ${sheet} max-w-[560px] [grid-area:1/1] side:max-w-[460px]`}>
            <div data-reveal>
              <Eyebrow>The library</Eyebrow>
            </div>
            <h2 id="research-h" data-reveal className="font-serif text-[clamp(1.6rem,3vw,2.3rem)] font-[450] leading-tight text-ink">
              Publications &amp; research
            </h2>
            <p data-reveal className="mt-1 text-[13.5px] text-ink/60">
              Machine learning for health, vision and the planet.
            </p>
            <ul className="mt-4 space-y-1.5">
              {research.map((r) => {
                const on = hovered === `research:${r.id}`;
                const Inner = (
                  <>
                    <span className="mt-1 w-1.5 shrink-0 self-stretch rounded-full" style={{ background: r.color }} />
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink/50">
                        <span>{r.kind}</span>
                        <span aria-hidden>·</span>
                        <span>{r.date}</span>
                        {r.status && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] tracking-[0.08em] ${
                              r.status === 'Under review' ? 'bg-honey/25 text-[#8a5a12]' : 'bg-moss/15 text-moss'
                            }`}
                          >
                            {r.status}
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block font-serif text-[16px] leading-snug text-ink">{r.title}</span>
                      <span className="mt-1 block text-[12.5px] leading-relaxed text-ink/65">
                        {r.venue}
                        {r.publisher ? <span className="text-ink/45"> — {r.publisher}</span> : null}
                      </span>
                    </span>
                    {r.href && (
                      <span className="ml-auto mt-1 shrink-0 text-ink/40">
                        <ArrowIcon />
                      </span>
                    )}
                  </>
                );
                const cls = `flex gap-3 rounded-2xl p-3 transition ${on ? 'bg-ink/[0.06]' : 'hover:bg-ink/[0.04]'}`;
                return (
                  <li
                    key={r.id}
                    data-reveal
                    onMouseEnter={() => setUI({ hovered: `research:${r.id}` })}
                    onMouseLeave={() => setUI({ hovered: null })}
                  >
                    {r.href ? (
                      <a href={r.href} target="_blank" rel="noopener" className={cls}>
                        {Inner}
                      </a>
                    ) : (
                      <div className={cls}>{Inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            <p data-reveal className="mt-4 hidden text-xs italic text-ink/50 [@media(hover:hover)]:block">
              Each book on the table is one of these — hover a title to lift it.
            </p>
          </div>
          <ExperiencePanel />
        </div>
      </div>
    </section>
  );
}

/** Second library panel — appears as the camera turns to the reading nook. */
function ExperiencePanel() {
  const hovered = useUI((s) => s.hovered);
  return (
    <div
      data-research-2
      data-panel
      data-lenis-prevent
      aria-labelledby="experience-h"
      className={`${panel} ${sheet} max-w-[560px] opacity-0 [grid-area:1/1] side:max-w-[460px]`}
      style={{ pointerEvents: 'none' }}
    >
      <Eyebrow>The reading nook</Eyebrow>
      <h2 id="experience-h" className="font-serif text-[clamp(1.6rem,3vw,2.3rem)] font-[450] leading-tight text-ink">
        Experience
      </h2>
      <ul className="mt-4 space-y-2">
        {experience.map((e) => {
          const on = hovered === `exp:${e.id}` || (e.id === 'foundrfuse' && hovered === 'phone');
          return (
            <li
              key={e.id}
              onMouseEnter={() => setUI({ hovered: `exp:${e.id}` })}
              onMouseLeave={() => setUI({ hovered: null })}
              className={`flex gap-3 rounded-2xl p-3 transition ${on ? 'bg-ink/[0.06]' : 'hover:bg-ink/[0.04]'}`}
            >
              <span className="mt-1 w-1.5 shrink-0 self-stretch rounded-full" style={{ background: e.color }} />
              <span className="min-w-0">
                <span className="block font-serif text-[17px] leading-snug text-ink">{e.role}</span>
                <span className="mt-0.5 block text-[12.5px] font-medium text-ink/55">
                  {e.org} · {e.dates}
                  {e.location ? ` · ${e.location}` : ''}
                </span>
                <ul className="mt-2 space-y-1">
                  {e.points.map((pt) => (
                    <li key={pt} className="flex gap-2 text-[13px] leading-relaxed text-ink/75">
                      <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-ink/40" />
                      {pt}
                    </li>
                  ))}
                </ul>
                {e.link && (
                  <a
                    href={e.link.href}
                    target="_blank"
                    rel="noopener"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-[12.5px] font-semibold text-cream hover:bg-moss"
                  >
                    {e.link.label} <ArrowIcon />
                  </a>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 hidden text-xs italic text-ink/50 [@media(hover:hover)]:block">Hover the ID badge and logbook on the desk.</p>
    </div>
  );
}

/* ------------------------------------------------------------ cooking -- */

function Cooking() {
  const focused = useUI((s) => s.focusedRecipe);
  const hovered = useUI((s) => s.hovered);
  return (
    <section id="cooking" className="relative h-[250vh]" aria-labelledby="cooking-h">
      <div className="pointer-events-none sticky top-0 flex h-[100svh] items-end px-3 pb-3 pt-24 side:items-center side:px-6 side:pb-0 short:pt-20">
        <div className="mx-auto flex w-full max-w-6xl justify-center side:justify-end">
          <div data-panel data-lenis-prevent className={`${panel} ${sheet} max-w-[560px] side:max-w-[460px]`}>
            <div data-reveal>
              <Eyebrow>The kitchen</Eyebrow>
            </div>
            <h2 id="cooking-h" data-reveal className="font-serif text-[clamp(1.6rem,3vw,2.3rem)] font-[450] leading-tight text-ink">
              Recipes &amp; kitchen stories
            </h2>
            <p data-reveal className="mt-2 text-[14.5px] leading-relaxed text-ink/70">
              The dishes people love most. Tap a dish on the island to open its card.
            </p>
            <ul className="mt-5 space-y-2">
              {recipes.map((r) => {
                const on = focused === r.id || hovered === `recipe:${r.id}`;
                return (
                  <li
                    key={r.id}
                    id={`recipe-${r.id}`}
                    data-reveal
                    onMouseEnter={() => setUI({ hovered: `recipe:${r.id}` })}
                    onMouseLeave={() => setUI({ hovered: null })}
                  >
                    <details
                      open={focused === r.id}
                      onToggle={(e) => {
                        if ((e.target as HTMLDetailsElement).open) setUI({ focusedRecipe: r.id });
                      }}
                      className={`group rounded-2xl border transition ${on ? 'border-honey/70 bg-honey/10' : 'border-ink/10 bg-white/40'}`}
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                        <span>
                          <span className="block font-serif text-[17px] text-ink">{r.title}</span>
                          <span className="text-[12px] font-medium text-ink/50">{r.time}</span>
                        </span>
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-ink/5 text-ink/60 transition group-open:rotate-45">+</span>
                      </summary>
                      <div className="px-4 pb-4">
                        <p className="text-[13.5px] italic leading-relaxed text-ink/70">“{r.story}”</p>
                        <ol className="mt-3 space-y-1.5 text-[13.5px] text-ink/80">
                          {r.steps.map((s, i) => (
                            <li key={s} className="flex gap-2">
                              <span className="font-serif text-terracotta">{i + 1}.</span>
                              {s}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ contact -- */

function Contact() {
  return (
    <section id="contact" className="relative h-[170vh]" aria-labelledby="contact-h">
      <div className="pointer-events-none sticky top-0 flex h-[100svh] flex-col justify-end px-3 pb-3 pt-24 side:justify-center side:px-6 side:pb-0 short:pt-20">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center side:items-start">
          <div data-panel data-lenis-prevent className={`${sheet} pointer-events-auto max-w-[560px] rounded-[28px] border border-white/10 bg-dusk/70 text-cream shadow-soft backdrop-blur-xl side:max-w-[480px]`}>
            <div data-reveal>
              <Eyebrow dark>{contact.eyebrow}</Eyebrow>
            </div>
            <h2 id="contact-h" data-reveal className="font-serif text-[clamp(1.8rem,3.4vw,2.6rem)] font-[450] leading-[1.05] text-cream">
              {contact.heading}
            </h2>
            <p data-reveal className="mt-3 text-[15px] leading-relaxed text-cream/75">
              {contact.body}
            </p>
            <a
              data-reveal
              href={`mailto:${site.email}`}
              className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-honey px-5 py-4 font-semibold text-ink transition hover:brightness-105"
            >
              <span className="truncate font-serif text-lg">{site.email}</span>
              <ArrowIcon />
            </a>
            <ul data-reveal className="mt-4 flex flex-wrap gap-2">
              {site.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener" className="flex items-center gap-1.5 rounded-full border border-cream/20 px-4 py-2 text-sm font-medium hover:bg-cream/10">
                    {s.label} <ArrowIcon />
                  </a>
                </li>
              ))}
              <li>
                <a href={site.resumeUrl} target="_blank" rel="noopener" className="flex items-center gap-1.5 rounded-full border border-cream/20 px-4 py-2 text-sm font-medium hover:bg-cream/10">
                  Résumé <ArrowIcon />
                </a>
              </li>
            </ul>
            <p data-reveal className="mt-6 text-xs text-cream/45">
              {site.location} · Or click the glowing mailbox
            </p>
          </div>
          <footer className="pointer-events-auto mt-3 flex w-full flex-wrap items-center justify-between gap-2 px-2 text-xs text-cream/60 short:hidden">
            <span>
              © {new Date().getFullYear()} {site.name}. Every leaf, loaf and lantern hand-built in code.
            </span>
            <button onClick={() => nav.scrollTo('welcome', { duration: 4 })} className="underline-offset-4 hover:underline">
              Back to the garden ↑
            </button>
          </footer>
        </div>
      </div>
    </section>
  );
}
