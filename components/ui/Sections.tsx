'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { about, contact, projects, recipes, research, site } from '@/content/site';
import { nav, playBell, setUI, useUI } from '@/lib/store';
import { BellIcon } from '../Experience';

const panel = 'rounded-[28px] border border-white/70 bg-cream/[0.86] shadow-soft backdrop-blur-xl';

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

      // projects: scroll moves the cards sideways along the workbench
      const t = track.current;
      if (t) {
        gsap.to(t, {
          x: () => -Math.max(0, t.scrollWidth - t.parentElement!.clientWidth),
          ease: 'none',
          scrollTrigger: {
            trigger: '#projects',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        });
      }
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={root} className={`relative z-10 ${hidden ? 'invisible' : ''}`}>
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
      <div className="sticky top-0 flex h-[100svh] items-end overflow-hidden pb-[9vh] sm:items-center sm:pb-0">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-[70%] bg-[radial-gradient(ellipse_at_15%_60%,rgba(251,245,233,0.82),rgba(251,245,233,0.35)_38%,transparent_62%)] sm:block"
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-cream via-cream/85 to-transparent sm:hidden" />
        <div data-hero className="relative mx-auto w-full max-w-6xl px-6 sm:px-10">
          <p className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-moss">Welcome to</p>
          <h1 className="max-w-[12ch] font-serif text-[clamp(2.8rem,8vw,6.6rem)] font-[420] leading-[0.92] tracking-[-0.02em] text-ink [font-variation-settings:'SOFT'_100,'WONK'_1]">
            A Little World <em className="font-[380] text-terracotta">of My Own</em>
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink/75">
            {site.name} — {site.role.toLowerCase()}. {site.tagline}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
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
        <div data-hint className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-ink/60 sm:flex">
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
    <section id="about" className="relative h-[230vh]" aria-labelledby="about-h">
      <div className="sticky top-0 flex h-[100svh] items-end px-3 pb-3 pt-24 sm:items-center sm:px-6 sm:pb-0">
        <div className="mx-auto flex w-full max-w-6xl justify-end">
          <div data-panel data-lenis-prevent className={`${panel} max-h-[62svh] w-full max-w-[440px] overflow-y-auto p-6 sm:max-h-none sm:p-8`}>
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
            <p data-reveal className="mt-5 hidden text-xs italic text-ink/50 sm:block">
              Psst — hover the laptop on the desk.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- projects -- */

function Projects({ trackRef }: { trackRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <section id="projects" className="relative" style={{ height: `${160 + projects.length * 45}vh` }} aria-labelledby="projects-h">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-end overflow-hidden pb-5 pt-24 sm:pb-8">
        <div className="mx-auto mb-4 w-full max-w-6xl px-5 sm:px-8">
          <div className={`${panel} inline-block px-5 py-4 sm:px-6`} data-panel>
            <div data-reveal>
              <Eyebrow>The workshop</Eyebrow>
            </div>
            <h2 id="projects-h" data-reveal className="font-serif text-[clamp(1.6rem,3vw,2.3rem)] font-[450] leading-tight text-ink">
              Things I’ve built
            </h2>
            <p data-reveal className="mt-1 text-sm text-ink/60">
              Keep scrolling to slide along the bench.
            </p>
          </div>
        </div>
        <div className="w-full overflow-hidden">
          <div ref={trackRef} className="flex w-max gap-4 px-5 will-change-transform sm:gap-5 sm:px-[max(2rem,calc((100vw-72rem)/2+2rem))]">
            {projects.map((p, i) => (
              <article
                key={p.id}
                className={`${panel} flex w-[min(84vw,380px)] shrink-0 flex-col p-6`}
                style={{ borderTop: `4px solid ${p.accent}` }}
              >
                <div className="flex items-baseline justify-between text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <span>{p.year}</span>
                </div>
                <h3 className="mt-3 font-serif text-2xl font-[500] text-ink">{p.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink/75">{p.summary}</p>
                <ul className="mt-3 space-y-1 text-[13px] text-ink/70">
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
                <div className="mt-auto flex gap-2 pt-5">
                  {p.github && (
                    <a href={p.github} target="_blank" rel="noopener" className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-2 text-[13px] font-semibold text-ink hover:bg-ink/5">
                      <GitHubIcon /> Code
                    </a>
                  )}
                  {p.demo && (
                    <a href={p.demo} target="_blank" rel="noopener" className="flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[13px] font-semibold text-cream hover:bg-moss">
                      Live demo <ArrowIcon />
                    </a>
                  )}
                </div>
              </article>
            ))}
            <div className={`${panel} flex w-[min(70vw,260px)] shrink-0 flex-col justify-center p-6`}>
              <p className="font-serif text-xl text-ink">More on the shelf</p>
              <p className="mt-2 text-sm text-ink/65">Experiments, tools and half-finished ideas live on GitHub.</p>
              <a href={site.socials[0].href} target="_blank" rel="noopener" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta">
                Visit GitHub <ArrowIcon />
              </a>
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
    <section id="research" className="relative h-[230vh]" aria-labelledby="research-h">
      <div className="sticky top-0 flex h-[100svh] items-end px-3 pb-3 pt-24 sm:items-center sm:px-6 sm:pb-0">
        <div className="mx-auto w-full max-w-6xl">
          <div data-panel data-lenis-prevent className={`${panel} max-h-[62svh] w-full max-w-[460px] overflow-y-auto p-6 sm:max-h-[78svh] sm:p-8`}>
            <div data-reveal>
              <Eyebrow>The library</Eyebrow>
            </div>
            <h2 id="research-h" data-reveal className="font-serif text-[clamp(1.6rem,3vw,2.3rem)] font-[450] leading-tight text-ink">
              Research, recognition &amp; rabbit holes
            </h2>
            <ul className="mt-5 space-y-2">
              {research.map((r) => {
                const on = hovered === `research:${r.id}`;
                const Inner = (
                  <>
                    <span className="mt-1 h-10 w-1.5 shrink-0 rounded-full" style={{ background: r.color }} />
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/50">
                        {r.kind} · {r.venue}
                      </span>
                      <span className="mt-0.5 block font-serif text-[17px] leading-snug text-ink">{r.title}</span>
                      <span className="mt-1 block text-[13.5px] leading-relaxed text-ink/70">{r.blurb}</span>
                    </span>
                    {r.href && (
                      <span className="ml-auto mt-1 text-ink/40">
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
            <p data-reveal className="mt-4 hidden text-xs italic text-ink/50 sm:block">
              Each book on the table is one of these — hover to pull it off the shelf.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ cooking -- */

function Cooking() {
  const focused = useUI((s) => s.focusedRecipe);
  const hovered = useUI((s) => s.hovered);
  return (
    <section id="cooking" className="relative h-[250vh]" aria-labelledby="cooking-h">
      <div className="sticky top-0 flex h-[100svh] items-end px-3 pb-3 pt-24 sm:items-center sm:px-6 sm:pb-0">
        <div className="mx-auto flex w-full max-w-6xl justify-end">
          <div data-panel data-lenis-prevent className={`${panel} max-h-[62svh] w-full max-w-[460px] overflow-y-auto p-6 sm:max-h-[78svh] sm:p-8`}>
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
      <div className="sticky top-0 flex h-[100svh] flex-col justify-end px-3 pb-3 pt-24 sm:justify-center sm:px-6 sm:pb-0">
        <div className="mx-auto w-full max-w-6xl">
          <div data-panel className="w-full max-w-[480px] rounded-[28px] border border-white/10 bg-dusk/70 p-6 text-cream shadow-soft backdrop-blur-xl sm:p-8">
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
              {site.location} · Or click the glowing mailbox ✉
            </p>
          </div>
          <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 px-2 text-xs text-cream/60">
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
