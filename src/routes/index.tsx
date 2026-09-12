import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowLeft, ArrowRight, ExternalLink, MapPin } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Dylan Webs — Memo 2026" },
    { name: "description", content: "Un memo sobre páginas web que convierten atención en acción para negocios locales." },
    { property: "og:title", content: "Dylan Webs — Memo 2026" },
    { property: "og:description", content: "Diseño y desarrollo páginas web para negocios locales de Uruguay." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

const slides = ["Portada", "La fricción", "Evidencia", "El servicio", "Encaje", "Proceso", "Portfolio", "Diferencia", "Ahora", "90 días"];
const audits = [
  ["El Bosque", "Restaurante · Prado", "La reserva termina en una conversación de WhatsApp, sin contexto previo."],
  ["Salvaje", "Gastronomía", "Precios y propuesta viven dispersos entre publicaciones e historias."],
  ["Finta", "Gastronomía", "La información clave depende de plataformas externas y cambia de lugar."],
  ["Topfit", "Entrenamiento", "Servicios y modalidades requieren una consulta antes de poder compararlos."],
  ["Panther Gym", "Gimnasio", "Horarios y planes no tienen un punto de consulta único y permanente."],
  ["Prime Burgers", "Gastronomía", "El recorrido salta de Instagram a menú externo y luego a otra plataforma."],
];

function Index() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [auditIndex, setAuditIndex] = useState(0);
  const [projectIndex, setProjectIndex] = useState(0);
  const auditRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);

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

  const scrollCarousel = useCallback((ref: React.RefObject<HTMLDivElement | null>, direction: number, current: number, count: number, setter: (value: number) => void) => {
    const next = (current + direction + count) % count;
    ref.current?.children[next]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    setter(next);
  }, []);

  const jump = (index: number) => document.getElementById(`slide-${index + 1}`)?.scrollIntoView({ behavior: "smooth" });

  return (
    <main>
      <aside className="rail" aria-label="Navegación de la presentación">
        <span className="rail-brand">DW.</span>
        <div className="rail-links">{slides.map((label, index) => <button key={label} className={activeSlide === index ? "is-active" : ""} onClick={() => jump(index)} aria-label={`Ir a ${label}`}><span>{String(index + 1).padStart(2, "0")}</span></button>)}</div>
        <span className="rail-total">/10</span>
      </aside>

      <Slide id={1} className="hero-slide ink-slide">
        <div className="meta-row"><span>DYLAN WEBS</span><span>MONTEVIDEO · URUGUAY</span><span>MEMO / 2026</span></div>
        <div className="hero-center">
          <p className="kicker">Atención ≠ acción</p>
          <h1>Instagram consigue<br />la <em>atención.</em><br /><span>Tu web hace el resto.</span></h1>
        </div>
        <div className="hero-foot"><p>Diseño y desarrollo web<br />para negocios locales.</p><Button variant="accent" onClick={() => jump(1)} aria-label="Continuar"><ArrowDown /></Button></div>
        <div className="hero-index">01</div>
      </Slide>

      <Slide id={2}>
        <SlideHead number="02 / 10" label="EL PROBLEMA" />
        <div className="problem-layout">
          <h2>Tus clientes ya te encontraron.<br /><em>Ahora tienen que entender qué hacer.</em></h2>
          <div className="journey" aria-label="Recorrido del cliente">{["Descubrir", "Entender", "Confiar", "Actuar"].map((step, index) => <div key={step} className={index === 0 ? "muted-step" : ""}><span>0{index + 1}</span><strong>{step}</strong></div>)}</div>
          <div className="question-grid">{[["Precio", "¿Cuánto sale?"], ["Horario", "¿Cuándo abre?"], ["Servicio", "¿Qué hacen exactamente?"], ["Ubicación", "¿Dónde queda?"], ["Acción", "¿Cómo reservo o compro?"]].map(([title, text]) => <article key={title}><span>{title}</span><p>{text}</p></article>)}</div>
          <p className="editorial-note">La respuesta no debería estar repartida entre 12 historias destacadas y una conversación de WhatsApp.</p>
        </div>
      </Slide>

      <Slide id={3} className="audit-slide">
        <SlideHead number="03 / 10" label="MUESTRA EXPLORATORIA" />
        <div className="audit-intro"><div><strong>6/6</strong><span>presentaron al menos una fricción digital que una web podría reducir.</span></div><p>Patrones observados en una revisión pública y acotada. No es un estudio estadístico del mercado.</p></div>
        <div className="carousel" ref={auditRef} onScroll={(e) => setAuditIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))} tabIndex={0} aria-label="Auditorías de negocios locales">
          {audits.map(([name, category, issue], index) => <article className="audit-card" key={name}><div className="card-number">{String(index + 1).padStart(2, "0")}</div><div><p className="kicker">{category}</p><h3>{name}</h3></div><p className="audit-copy">{issue}</p><span className="card-mark">DW / AUDIT</span></article>)}
        </div>
        <CarouselControls current={auditIndex} total={audits.length} previous={() => scrollCarousel(auditRef, -1, auditIndex, audits.length, setAuditIndex)} next={() => scrollCarousel(auditRef, 1, auditIndex, audits.length, setAuditIndex)} />
      </Slide>

      <Slide id={4} className="ink-slide service-slide">
        <SlideHead number="04 / 10" label="LA OFERTA" />
        <div className="service-statement"><p>Una especialidad.</p><h2>Diseño y desarrollo<br />páginas web para<br /><em>negocios locales.</em></h2></div>
        <div className="anti-list"><span>No IA</span><span>No automatizaciones</span><span>No marketing mensual</span><span>No “soluciones 360”</span></div>
        <div className="service-bottom"><p>Cada web se organiza alrededor de una acción concreta.</p><div className="action-marquee">RESERVAR · COMPRAR · CONSULTAR · VER MENÚ · PEDIR PRESUPUESTO · VISITAR</div><div className="service-groups"><div><small>BASE</small><span>Arquitectura, diseño responsive, desarrollo y performance.</span></div><div><small>NEGOCIO</small><span>Menú, catálogo, servicios, precios y formularios.</span></div><div><small>SALIDA</small><span>WhatsApp, Maps, reservas, dominio, analytics y SEO local.</span></div></div></div>
      </Slide>

      <Slide id={5}>
        <SlideHead number="05 / 10" label="CLIENTE IDEAL" />
        <div className="fit-title"><span>El filtro también<br />es parte del servicio.</span><h2>¿Tiene<br /><em>sentido?</em></h2></div>
        <div className="fit-columns"><article><h3>Sí, cuando</h3><ul><li>El negocio está activo y ya recibe consultas.</li><li>Los productos o servicios están claros.</li><li>Instagram tiene movimiento.</li><li>Quieren dejar de responder siempre lo mismo.</li></ul></article><article><h3>No todavía, cuando</h3><ul><li>El negocio aún no sabe qué vende.</li><li>La única prioridad es “algo barato”.</li><li>Esperan que una web genere clientes sola.</li><li>Primero necesitan campañas, no infraestructura web.</li></ul></article></div>
      </Slide>

      <Slide id={6} className="process-slide">
        <SlideHead number="06 / 10" label="PROCESO" />
        <div className="process-title"><h2>Simple de explicar.<br /><em>Riguroso al hacer.</em></h2><p>Una secuencia corta para no diseñar antes de entender.</p></div>
        <ol className="timeline">{[["Entender", "Qué vende el negocio y qué necesita hacer su cliente."], ["Ordenar", "Contenido, estructura, navegación y acción principal."], ["Diseñar", "La identidad visual aplicada a la experiencia."], ["Construir", "Desarrollo responsive, rendimiento e integraciones."], ["Publicar", "Dominio, medición, control de calidad y lanzamiento."]].map(([title, copy], index) => <li key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></li>)}</ol>
      </Slide>

      <Slide id={7} className="portfolio-slide ink-slide">
        <SlideHead number="07 / 10" label="PROYECTOS SELECCIONADOS" />
        <div className="project-carousel" ref={portfolioRef} onScroll={(e) => setProjectIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))} tabIndex={0} aria-label="Proyectos seleccionados">
          <ProjectFintrack />
          <ProjectRestaurant name="Rescoldo" number="02" tone="light" copy="Una experiencia gastronómica construida desde el fuego, el producto y la reserva." />
          <ProjectRestaurant name="Manso" number="03" tone="dark" copy="Landing de restaurante con una dirección visual nocturna, directa y premium." />
        </div>
        <CarouselControls current={projectIndex} total={3} previous={() => scrollCarousel(portfolioRef, -1, projectIndex, 3, setProjectIndex)} next={() => scrollCarousel(portfolioRef, 1, projectIndex, 3, setProjectIndex)} />
      </Slide>

      <Slide id={8}>
        <SlideHead number="08 / 10" label="DIFERENCIA" />
        <h2 className="difference-title">No se trata de ser<br />“el mejor desarrollador”.<br /><em>Se trata de mirar bien.</em></h2>
        <div className="difference-grid">{[["Foco", "Trabajo específicamente con webs."], ["Contexto local", "Entiendo cómo consultan y compran los negocios uruguayos."], ["Diseño + desarrollo", "No entrego solamente un archivo. Lo construyo."], ["Pensamiento comercial", "Primero pregunto qué queremos que haga la persona."], ["Contacto directo", "El cliente habla conmigo, no con cinco departamentos."]].map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </Slide>

      <Slide id={9} className="status-slide">
        <SlideHead number="09 / 10" label="TRANSPARENCIA" />
        <div className="status-copy"><p>Etapa inicial,<br />criterio claro.</p><h2>No necesito inventar<br />tracción para demostrar<br /><em>cómo pienso.</em></h2></div>
        <div className="status-columns"><article><span>YA EXISTE</span><ul><li>Capacidad técnica</li><li>Portfolio y proyectos</li><li>Auditorías y conocimiento</li><li>Un proceso definido</li></ul></article><article><span>FALTA VALIDAR</span><ul><li>Adquisición consistente</li><li>Pricing</li><li>Conversiones</li><li>Casos pagos y testimonios</li></ul></article></div>
      </Slide>

      <Slide id={10} className="final-slide ink-slide">
        <SlideHead number="10 / 10" label="PRÓXIMOS 90 DÍAS" />
        <div className="ninety-grid">{[["0—30", "Publicar", "Cerrar posicionamiento, portfolio y oferta."], ["31—60", "Prospectar", "Contactar negocios seleccionados con auditorías personalizadas."], ["61—90", "Primeros casos", "Cerrar proyectos, documentar, obtener testimonios y ajustar pricing."]].map(([days, title, copy]) => <article key={days}><strong>{days}</strong><h3>{title}</h3><p>{copy}</p></article>)}</div>
        <div className="closing"><div><p>La tesis</p><h2>La atención ya existe.<br /><em>La oportunidad está después.</em></h2></div><a href="https://instagram.com/dylan.webs.uy" target="_blank" rel="noreferrer">@dylan.webs.uy <ExternalLink size={18} /></a></div>
        <footer><span>DYLAN WEBS © 2026</span><span><MapPin size={14} /> MONTEVIDEO, URUGUAY</span><span>FIN DEL MEMO</span></footer>
      </Slide>
    </main>
  );
}

function Slide({ id, className = "", children }: { id: number; className?: string; children: React.ReactNode }) {
  return <section id={`slide-${id}`} data-slide={id - 1} aria-label={`${String(id).padStart(2, "0")} de 10: ${slides[id - 1]}`} className={`slide ${className}`}>{children}</section>;
}
function SlideHead({ number, label }: { number: string; label: string }) { return <header className="slide-head"><span>{number}</span><span>{label}</span><span>DYLAN WEBS</span></header>; }
function CarouselControls({ current, total, previous, next }: { current: number; total: number; previous: () => void; next: () => void }) { return <div className="carousel-controls"><div className="progress"><span style={{ width: `${((current + 1) / total) * 100}%` }} /></div><span>{String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span><Button onClick={previous} aria-label="Anterior"><ArrowLeft /></Button><Button onClick={next} aria-label="Siguiente"><ArrowRight /></Button></div>; }

function ProjectFintrack() { return <article className="project fintrack"><div className="project-copy"><span>01 / PRODUCTO DIGITAL · 2026</span><h3>FINTRACK<em>/FinanceFlow</em></h3><p>Una aplicación personal para entender el dinero sin convertirlo en una planilla.</p><small>UI · ARQUITECTURA · DESARROLLO</small></div><div className="finance-mock"><div className="mock-head"><span>FinanceFlow</span><span>Overview · Transactions · Budgets</span><b>DW</b></div><div className="balance"><small>BALANCE TOTAL</small><strong>$ 284.350</strong><span>Datos demostrativos</span></div><div className="chart"><i/><i/><i/><i/><i/><i/><i/></div><div className="finance-stats"><div><small>INGRESOS</small><b>$ 96.200</b></div><div><small>GASTOS</small><b>$ 48.640</b></div><div><small>AHORRO</small><b>32%</b></div></div><div className="phone-mock"><span>Balance</span><strong>$284.350</strong><div className="phone-chart"/><small>Vista móvil · demo</small></div></div></article>; }
function ProjectRestaurant({ name, number, tone, copy }: { name: string; number: string; tone: string; copy: string }) { return <article className={`project restaurant ${tone}`}><div className="project-copy"><span>{number} / GASTRONOMÍA · 2026</span><h3>{name}</h3><p>{copy}</p><small>DIRECCIÓN VISUAL · UX · DESARROLLO</small></div><div className="restaurant-mock"><div className="restaurant-nav"><span>{name}</span><span>MENÚ &nbsp; RESERVAS &nbsp; UBICACIÓN</span></div><div className="plate"><i/><i/><i/></div><p>Producto.<br /><em>Atmósfera.</em><br />Acción.</p><button tabIndex={-1}>RESERVAR MESA</button></div></article>; }