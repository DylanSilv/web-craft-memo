import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowLeft, ArrowRight, ExternalLink, MapPin } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Dylan Webs — Páginas web para negocios locales" },
    { name: "description", content: "Diseño y desarrollo de páginas web para negocios de Uruguay. Convertí en consultas la atención que ya tenés." },
    { property: "og:title", content: "Dylan Webs — Páginas web para negocios locales" },
    { property: "og:description", content: "Diseño y desarrollo de páginas web para negocios de Uruguay. Convertí en consultas la atención que ya tenés." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

// BORRADOR: el tercer elemento de cada paso es el detalle del desplegable.
// Dylan: corregilo con tus palabras, describe cómo trabajás vos.
const PROCESO: [string, string, string][] = [
  ["Entender", "Qué vende el negocio y qué necesita hacer su cliente.",
   "Miramos qué vende el negocio, qué pregunta la gente antes de comprar y qué estás resolviendo hoy a mano por WhatsApp. De ahí sale cuál es la acción principal de la web."],
  ["Ordenar", "Contenido, estructura, navegación y acción principal.",
   "Defino qué secciones existen, en qué orden y qué tiene que pasar en cada una. Antes de abrir una herramienta de diseño, la estructura ya está decidida."],
  ["Diseñar", "La identidad visual aplicada a la experiencia.",
   "Tipografía, color y composición aplicados a esa estructura. Trabajo sobre pantallas reales, no sobre plantillas: lo que ves es lo que se construye."],
  ["Construir", "Desarrollo responsive, rendimiento e integraciones.",
   "Desarrollo a medida, responsive desde el primer día, y las integraciones que el negocio necesita: WhatsApp, Maps, reservas y formularios."],
  ["Publicar", "Dominio, medición, control de calidad y lanzamiento.",
   "Dominio, correo, medición y control de calidad. Reviso en escritorio y en teléfono antes de que quede en línea."],
];

// BORRADOR editable: rubro + qué tiene que resolver su web.
// Dylan: ajustá la segunda columna con lo que ves vos en cada rubro.
const ACCIONES = ["RESERVAR", "COMPRAR", "CONSULTAR", "VER MENÚ", "PEDIR PRESUPUESTO", "VISITAR"];

const RUBROS: [string, string][] = [
  ["Gastronomía", "Carta al día, reserva sin ida y vuelta, y cómo llegar."],
  ["Fitness y bienestar", "Planes, horarios y qué pasa en la primera clase."],
  ["Servicios y oficios", "Qué hacés exactamente, dónde, y cómo pedir presupuesto."],
  ["Comercio", "Catálogo con precios y un camino claro a la compra."],
  ["Estudios y consultorios", "Agenda, quién te atiende y por qué confiar."],
];

const slides = ["Portada", "El problema", "Qué hago", "Trabajo", "Cómo lo hago", "Qué incluye", "Por qué conmigo", "Para quién es", "Empecemos"];
// TODO Dylan: completar antes de publicar. Sin esto, la slide 10 no cierra.
const WHATSAPP = "598XXXXXXXX";
const EMAIL = "hola@dylanwebs.uy";




const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Scroll propio con easing. El nativo recorre diez alturas de pantalla de un
 *  saque y se siente teletransporte; este dura en proporción a la distancia y
 *  se cancela apenas el usuario toca la rueda o la pantalla. */
let cancelScroll: (() => void) | null = null;
function glideTo(targetY: number) {
  cancelScroll?.();
  const startY = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const dist = Math.min(Math.max(targetY, 0), max) - startY;
  if (Math.abs(dist) < 2) return;
  if (reduced()) { window.scrollTo(0, startY + dist); return; }

  const duration = Math.min(1400, Math.max(620, Math.abs(dist) * 0.5));
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const t0 = performance.now();
  let alive = true;
  const stop = () => {
    alive = false;
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
    window.removeEventListener("keydown", stop);
    cancelScroll = null;
  };
  cancelScroll = stop;
  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("touchstart", stop, { passive: true });

  const step = (now: number) => {
    if (!alive) return;
    const t = Math.min(1, (now - t0) / duration);
    window.scrollTo(0, startY + dist * ease(t));
    if (t < 1) requestAnimationFrame(step); else stop();
  };
  requestAnimationFrame(step);
}

/** Capas de profundidad. data-depth: positivo = se queda atrás. */
function useParallax() {
  useEffect(() => {
    if (reduced()) return;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-depth]"));
    if (!nodes.length) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (const node of nodes) {
        const rect = node.getBoundingClientRect();
        if (rect.bottom < -vh || rect.top > vh * 2) continue;
        const depth = Number(node.dataset["depth"] ?? 0);
        const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        node.style.transform = `translate3d(0, ${(progress * depth * 100).toFixed(2)}px, 0)`;
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}

/** Aparición al entrar, una sola vez por elemento. */
function useReveal() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!nodes.length) return;
    // Recién acá se activa el estado inicial oculto: si el JS no corre, el
    // contenido se ve igual en vez de quedar una página en blanco.
    document.documentElement.classList.add("motion-ready");
    if (reduced()) { nodes.forEach((n) => n.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
}


/** Desplegable accesible: botón con aria-expanded + panel con id asociado.
 *  El colapsado usa visibility para que además salga del árbol de accesibilidad,
 *  no solo de la vista. */
function Disclosure({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`disclosure${open ? " is-open" : ""}`}>
      <button type="button" aria-expanded={open} aria-controls={`panel-${id}`} onClick={() => setOpen((v) => !v)}>
        <span>{label}</span>
        <i aria-hidden="true" />
      </button>
      <div className="disclosure-panel" id={`panel-${id}`} role="region">
        <div>{children}</div>
      </div>
    </div>
  );
}

function useCarousel(count: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  /** Índice = hijo cuyo offsetLeft está más cerca del scroll actual.
   *  No sirve dividir por el ancho del contenedor: las tarjetas de auditoría
   *  miden min(74vw, 950px) y el contenedor mide el ancho completo de la slide. */
  const nearest = (el: HTMLDivElement) => {
    let best = 0;
    let dist = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const d = Math.abs((child as HTMLElement).offsetLeft - el.scrollLeft);
      if (d < dist) { dist = d; best = i; }
    });
    return best;
  };

  const goTo = useCallback((i: number) => {
    const el = ref.current;
    if (!el) return;
    const target = Math.max(0, Math.min(i, el.children.length - 1));
    const child = el.children[target] as HTMLElement | undefined;
    if (!child) return;
    // scrollTo sobre el contenedor, no scrollIntoView: este último arrastra
    // también el scroll vertical de la página y saca la slide de cuadro.
    el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
    setIndex(target);
  }, []);

  const syncIndex = useCallback(() => {
    const el = ref.current;
    if (el) setIndex(nearest(el));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let dragging = false, startX = 0, startLeft = 0, moved = false;

    const down = (e: PointerEvent) => {
      if (e.pointerType === "touch" || e.button !== 0) return; // el táctil ya lo resuelve el navegador
      // No arrastrar desde un control: setPointerCapture redirige el evento al
      // carrusel y el navegador nunca dispara el click del botón de adentro.
      if ((e.target as HTMLElement | null)?.closest?.("button, a, input, textarea, select, summary, [role='button']")) return;
      dragging = true; moved = false;
      startX = e.clientX; startLeft = el.scrollLeft;
      el.style.scrollSnapType = "none";
      el.classList.add("is-dragging");
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startLeft - dx;
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("is-dragging");
      el.style.scrollSnapType = "";
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      const best = nearest(el);
      const child = el.children[best] as HTMLElement | undefined;
      if (child) el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
      setIndex(best);
    };
    // Evita que soltar el arrastre dispare el click del elemento de abajo.
    const swallowClick = (e: MouseEvent) => {
      if (!moved) return;
      e.preventDefault(); e.stopPropagation(); moved = false;
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("click", swallowClick, true);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("click", swallowClick, true);
    };
  }, []);

  /** Teclado propio del carrusel. stopPropagation para no pelearse con la
   *  navegación de slides, que escucha en window. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const map: Record<string, number | undefined> = {
      ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: count - 1,
    };
    const target = map[e.key];
    if (target === undefined) return;
    e.preventDefault(); e.stopPropagation();
    goTo(target);
  };

  return { ref, index, goTo, syncIndex, onKeyDown };
}

function Index() {
  const [activeSlide, setActiveSlide] = useState(0);
  const portfolio = useCarousel(3);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-slide]"));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSlide(Number((visible.target as HTMLElement).dataset["slide"]));
    }, { threshold: [0.3, 0.6] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        jump(Math.min(activeSlide + 1, slides.length - 1));
      }
      if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        jump(Math.max(activeSlide - 1, 0));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeSlide]);

  useParallax();
  useReveal();

  const jump = (index: number) => {
    const el = document.getElementById(`slide-${index + 1}`);
    if (el) glideTo(el.getBoundingClientRect().top + window.scrollY);
  };

  return (
    <main>
      <aside className="rail" aria-label="Navegación de la presentación">
        <span className="rail-brand">DW.</span>
        <div className="rail-links">{slides.map((label, index) => <button key={label} className={activeSlide === index ? "is-active" : ""} onClick={() => jump(index)} aria-label={`Ir a ${label}`}><span>{String(index + 1).padStart(2, "0")}</span></button>)}</div>
        <span className="rail-total">/{String(slides.length).padStart(2, "0")}</span>
      </aside>

      <Slide id={1} className="hero-slide ink-slide">
        <div className="meta-row"><span>DYLAN WEBS</span><span>MONTEVIDEO · URUGUAY</span><span>MEMO / 2026</span></div>
        <div className="hero-center">
          <p className="kicker" data-reveal>Atención ≠ acción</p>
          <h1 data-reveal data-stagger>
            <span className="line">Instagram consigue</span>
            <span className="line">la <em>atención.</em></span>
            <span className="line">Tu web hace el <b className="grad-word">resto.</b></span>
          </h1>
        </div>
        <div className="hero-foot" data-reveal data-delay="2"><p>Diseño y desarrollo web<br />para negocios locales.</p><Button variant="accent" onClick={() => jump(1)} aria-label="Continuar"><ArrowDown /></Button></div>
      </Slide>

      <Slide id={2} className="ink-slide">
        <SlideHead n={2} label="EL PROBLEMA" />
        <div className="problem-layout">
          <h2 data-reveal>Tus clientes ya te encontraron.<br /><em>Ahora tienen que entender qué hacer.</em></h2>
          <div className="journey" data-reveal data-stagger aria-label="Recorrido del cliente">{["Descubrir", "Entender", "Confiar", "Actuar"].map((step, index) => <div key={step} className={index === 0 ? "muted-step" : ""}><span>0{index + 1}</span><strong>{step}</strong></div>)}</div>
          <div className="question-grid" data-reveal data-stagger>{[["Precio", "¿Cuánto sale?"], ["Horario", "¿Cuándo abre?"], ["Servicio", "¿Qué hacen exactamente?"], ["Ubicación", "¿Dónde queda?"], ["Acción", "¿Cómo reservo o compro?"]].map(([title, text]) => <article key={title}><span>{title}</span><p>{text}</p></article>)}</div>
          <p className="editorial-note">La respuesta no debería estar repartida entre 12 historias destacadas y una conversación de WhatsApp.</p>
        </div>
      </Slide>

      <Slide id={3} className="service-slide">
        <SlideHead n={3} label="QUÉ HAGO" />
        <div className="service-statement" data-reveal><p>Una especialidad.</p><h2>Diseño y desarrollo<br />páginas web para<br /><em>negocios locales.</em></h2></div>
        <div className="rubros" data-reveal data-stagger>
          <p className="rubros-label">Tipos de negocio</p>
          {RUBROS.map(([rubro, resuelve]) => (
            <div className="rubro" key={rubro}><h3>{rubro}</h3><p>{resuelve}</p></div>
          ))}
        </div>
        <div className="service-bottom" data-reveal data-delay="1"><p>Cada web se organiza alrededor de una acción concreta.</p><div className="action-marquee"><div className="marquee-track" aria-hidden="true">{[0, 1].map((copia) => ACCIONES.map((word) => <span key={`${copia}-${word}`}>{word}<i className="sep"> · </i></span>))}</div><span className="sr-only">{ACCIONES.join(", ")}</span></div></div>
      </Slide>

      <Slide id={4} className="portfolio-slide ink-slide">
        <SlideHead n={4} label="TRABAJO" />
        <div className="project-carousel" ref={portfolio.ref} onScroll={portfolio.syncIndex} onKeyDown={portfolio.onKeyDown} tabIndex={0} role="group" aria-roledescription="carrusel" aria-label="Proyectos seleccionados">
          <ProjectFintrack />
          <ProjectRescoldo />
          <ProjectManso />
        </div>
        <CarouselControls current={portfolio.index} total={3} previous={() => portfolio.goTo(portfolio.index - 1)} next={() => portfolio.goTo(portfolio.index + 1)} />
      </Slide>

      <Slide id={5} className="process-slide ink-slide">
        <SlideHead n={5} label="CÓMO LO HAGO" />
        <div className="process-title" data-reveal><h2>Simple de explicar.<br /><em>Riguroso al hacer.</em></h2><p>Una secuencia corta para no diseñar antes de entender.</p></div>
        <ol className="timeline" data-reveal data-stagger>{PROCESO.map(([title, copy, detalle], index) => <li key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p><Disclosure id={`paso-${index + 1}`} label="Ver detalle">{detalle}</Disclosure></li>)}</ol>
      </Slide>

      <Slide id={6} className="includes-slide ink-slide">
        <SlideHead n={6} label="QUÉ INCLUYE" />
        <div className="includes-title" data-reveal><h2>Todo lo que entra<br /><em>en una web.</em></h2><p>Sin módulos sueltos ni extras que aparecen al final.</p></div>
        <div className="includes-grid" data-reveal data-stagger>
          {[["Base", ["Arquitectura de contenido", "Diseño responsive", "Desarrollo a medida", "Performance y carga"]],
            ["Negocio", ["Menú o catálogo", "Servicios y precios", "Formularios de contacto", "Textos y jerarquía"]],
            ["Salida", ["WhatsApp y llamada", "Google Maps", "Reservas o pedidos", "Dominio y correo", "Analytics", "SEO local"]]].map(([group, items], index) => (
            <article key={group as string}><span className="includes-num">{String(index + 1).padStart(2, "0")}</span><h3>{group as string}</h3><ul>{(items as string[]).map((item) => <li key={item}>{item}</li>)}</ul></article>
          ))}
        </div>
      </Slide>

      <Slide id={7}>
        <SlideHead n={7} label="POR QUÉ CONMIGO" />
        <h2 className="difference-title" data-reveal>Diseño y construyo yo.<br /><em>Hablás siempre conmigo.</em></h2>
        <div className="difference-grid" data-reveal data-stagger>{[["Foco", "Trabajo específicamente con webs. No hago de todo un poco."], ["Contexto local", "Entiendo cómo consultan y compran los negocios uruguayos."], ["Diseño + desarrollo", "No entrego solamente un archivo. Lo construyo."], ["Pensamiento comercial", "Primero pregunto qué queremos que haga la persona."], ["Contacto directo", "El cliente habla conmigo, no con cinco departamentos."]].map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </Slide>

      <Slide id={8} className="fit-slide ink-slide">
        <SlideHead n={8} label="PARA QUIÉN ES" />
        <div className="fit-title" data-reveal><h2>Funciona<br /><em>mejor</em> cuando…</h2><span>El encaje también<br />es parte del trabajo.</span></div>
        <div className="fit-list" data-reveal data-delay="1">
          <ul>{["El negocio está activo y ya recibe consultas.", "Los productos o servicios están claros.", "Instagram tiene movimiento.", "Querés dejar de responder siempre lo mismo."].map((item) => <li key={item}>{item}</li>)}</ul>
          <p className="fit-note">Si tu negocio todavía está definiendo qué vende, te lo digo. Prefiero eso antes que venderte una web que no va a rendir.</p>
        </div>
      </Slide>

      <Slide id={9} className="final-slide ink-slide">
        <SlideHead n={9} label="EMPECEMOS" />
        <div className="ninety-grid" data-reveal data-stagger>{[["01", "Escribime", "Contame qué vendés y qué querés que haga tu cliente."], ["02", "Conversamos", "Media hora para entender el negocio antes de proponer nada."], ["03", "Propuesta", "Alcance, plazo y precio por escrito. Sin sorpresas después."]].map(([step, title, copy]) => <article key={step}><strong>{step}</strong><h3>{title}</h3><p>{copy}</p></article>)}</div>
        <div className="closing" data-reveal data-delay="1"><div className="closing-thesis"><p>En resumen</p><h2>La atención ya existe.<br /><em>La oportunidad está después.</em></h2></div><div className="contact"><a href="https://instagram.com/dylan.webs.uy" target="_blank" rel="noreferrer">@dylan.webs.uy <ExternalLink size={16} /></a><a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp <ExternalLink size={16} /></a><a href={`mailto:${EMAIL}`}>{EMAIL} <ExternalLink size={16} /></a></div></div>
        <footer><span>DYLAN WEBS © 2026</span><span><MapPin size={14} /> MONTEVIDEO, URUGUAY</span><span>HABLEMOS</span></footer>
      </Slide>
    </main>
  );
}

function Slide({ id, className = "", children }: { id: number; className?: string; children: React.ReactNode }) {
  return <section id={`slide-${id}`} data-slide={id - 1} aria-label={`${String(id).padStart(2, "0")} de 10: ${slides[id - 1]}`} className={`slide ${className}`}>{children}</section>;
}
function SlideHead({ n, label }: { n: number; label: string }) { const pad = (v: number) => String(v).padStart(2, "0"); return <header className="slide-head"><span>{pad(n)} / {pad(slides.length)}</span><span>{label}</span><span>DYLAN WEBS</span></header>; }
function CarouselControls({ current, total, previous, next }: { current: number; total: number; previous: () => void; next: () => void }) { return <div className="carousel-controls"><div className="progress"><span style={{ width: `${((current + 1) / total) * 100}%` }} /></div><span>{String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span><Button onClick={previous} disabled={current === 0} aria-label="Anterior"><ArrowLeft /></Button><Button onClick={next} disabled={current === total - 1} aria-label="Siguiente"><ArrowRight /></Button></div>; }

function ProjectFintrack() {
  // Etiquetas, navegación y secciones tal como están en el repo de la app.
  const nav = ["Dashboard", "Movimientos", "Cuentas", "Tarjetas", "Ahorros", "Préstamos", "Cuentas Fijas"];
  const metrics: [string, string, string][] = [
    ["Balance total", "$ 284.350", "bal"],
    ["Ingresos del mes", "$ 96.200", "in"],
    ["Gastos del mes", "$ 48.640", "out"],
    ["Total ahorrado", "$ 91.400", "save"],
  ];
  const cuotas: [string, string, number][] = [
    ["Notebook", "6 / 12", 50],
    ["Bicicleta", "3 / 9", 33],
    ["Curso de diseño", "8 / 10", 80],
    ["Celular", "2 / 6", 33],
  ];
  return <article className="project fintrack is-lead"><div className="project-copy" data-depth="-0.14"><span>01 / PIEZA PRINCIPAL · PRODUCTO DIGITAL</span><h3>FINTRACK<em>/FinanceFlow</em></h3><p>Una aplicación personal para entender el dinero sin convertirlo en una planilla.</p><small>UI · ARQUITECTURA · DESARROLLO</small><Disclosure id="fintrack" label="Qué resuelve"><p>Reemplaza una planilla de Google Sheets por una aplicación con su propia base de datos.</p><ul><li>Compras en cuotas y préstamos, con cuánto falta de cada uno</li><li>Cuentas fijas que se repiten todos los meses</li><li>Objetivos de ahorro y evolución mes a mes</li><li>Movimientos, cuentas, tarjetas y categorías</li></ul></Disclosure></div><div className="finance-mock" data-depth="0.09"><aside className="ff-rail"><b>FinTrack</b><ul>{nav.map((item, i) => <li key={item} className={i === 0 ? "is-on" : ""}>{item}</li>)}</ul></aside><div className="ff-main"><div className="ff-head"><span>Dashboard</span><span>Septiembre 2026</span></div><div className="ff-metrics">{metrics.map(([label, value, kind]) => <div className={`ff-card ff-${kind}`} key={label}><small>{label}</small><strong>{value}</strong></div>)}</div><div className="ff-lower"><div className="ff-panel"><small>Compras en cuotas</small><ul>{cuotas.map(([name, step, pct]) => <li key={name}><span>{name}</span><b>{step}</b><i><u style={{ width: `${pct}%` }} /></i></li>)}</ul></div><div className="ff-panel"><small>Evolución</small><div className="ff-chart">{[38, 62, 47, 81, 58, 92, 71].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div></div></div><span className="ff-note">Datos demostrativos</span></div></div></article>;
}

function ProjectRescoldo() {
  const carta = [
  ["Cordero pesado de Rocha a la cruz", "Seis horas abierto frente al fuego. Chimichurri de menta de la huerta y nada más.", "32"],
  ["Entrecot de novillo Hereford, 40 días", "De pastura, madurado en cámara propia. Puré de ajo negro y berro de arroyo.", "34"],
  ["Corvina negra de La Paloma", "Piel crocante, manteca de alcaparras y limón.", "28"],
  ["Bondiola de cerdo de Tarariras", "Ocho horas. Membrillo asado y su propio jugo.", "30"],
];
  return <article className="project"><div className="project-copy" data-depth="-0.14"><span>02 / GASTRONOMÍA · CANELONES</span><h3>RESCOLDO</h3><p>Cocina de fuego lento en Juanicó. Un fuego por día, treinta y cuatro cubiertos.</p><small>DIRECCIÓN VISUAL · UX · DESARROLLO</small><Disclosure id="rescoldo" label="Qué resuelve"><p>Un restaurante de fuego lento en Juanicó que enciende un fuego por día para treinta y cuatro cubiertos.</p><ul><li>Carta de seis secciones con precios y menú de degustación</li><li>Un reloj del fuego que marca desde qué hora está encendido</li><li>El relato del fuego como recorrido, no como texto suelto</li><li>Mapa dibujado a mano, no incrustado</li></ul></Disclosure></div><div className="carta-mock" data-depth="0.09"><div className="carta-nav"><span>Rescoldo</span><span>CARTA · FUEGO · RESERVAS</span></div><div className="carta-body"><div className="carta-aside"><h4>Fuego alto</h4><p>Lo que pide brasa viva. Se cocina entero y se corta en el salón.</p></div><ul className="carta-list">{carta.map(([nombre, nota, precio]) => <li key={nombre}><div><strong>{nombre}</strong><span>{nota}</span></div><b>{precio}</b></li>)}</ul></div><span className="carta-foot">El fuego se apaga. La cocina empieza.</span></div></article>;
}

function ProjectManso() {
  return <article className="project"><div className="project-copy" data-depth="-0.14"><span>03 / GASTRONOMÍA · CIUDAD VIEJA</span><h3>MANSO</h3><p>Cocina de brasa lenta en una casa de 1904. La reserva se resuelve entera desde el teléfono.</p><small>DIRECCIÓN VISUAL · UX · DESARROLLO</small><Disclosure id="manso" label="Qué resuelve"><p>Cocina de brasa lenta en una casa de 1904 en Ciudad Vieja.</p><ul><li>Reserva entera desde el teléfono: fecha, hora, personas y confirmación</li><li>Validación campo por campo, con salida a WhatsApp si preferís escribir</li><li>Carta en página propia y horarios que saben si está abierto ahora</li><li>Mapa de la ciudad dibujado a medida</li></ul></Disclosure></div><div className="manso-mock" data-depth="0.09"><div className="manso-side"><span>CASA DE 1904</span><p>Ocho horas<br />de rescoldo.</p><span className="manso-addr">PIEDRAS 482<br />CIUDAD VIEJA</span></div><div className="manso-phone"><div className="manso-top"><span>MANSO</span><span className="manso-open"><i />ABIERTO</span></div><h4>Fuego lento,<br /><em>sobremesa larga.</em></h4><div className="manso-form"><div><small>FECHA</small><span>Vie 19 · Sep</span></div><div><small>HORA</small><span>21:30</span></div><div><small>PERSONAS</small><span>4</span></div></div><button tabIndex={-1}>Reservar mesa</button></div></div></article>;
}
