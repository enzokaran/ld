/**
 * HelmetVideoHero.jsx
 *
 * Hero com video do capacete (gerado via IA — Flow/Veo, Runway, etc.)
 * cujo "currentTime" e controlado pelo progresso do scroll — a mesma
 * tecnica usada em varios sites de produto.
 *
 * Pre-requisitos:
 *   npm install gsap
 *
 * Arquivo esperado em:
 *   public/videos/helmet-turntable.mp4
 *
 * Importante: gere o video ja com o fundo na MESMA cor do site
 * (#0c0f0e) — video nao suporta transparencia de forma confiavel
 * entre navegadores, entao a saida mais simples e o fundo "colar"
 * direto na secao.
 */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const VIDEO_SRC = "/videos/helmet-turntable.mp4";
const PIN_DISTANCE = "+=160%"; // quanto maior, mais gradual a "passagem" do video

export default function HelmetVideoHero() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);

  // ---- prepara o video: metadata + "aquecimento" pro iOS Safari ----
  useEffect(() => {
    const video = videoRef.current;

    function onLoadedMetadata() {
      // iOS so libera seek suave depois de um play/pause silencioso
      const primeAndReady = () => {
        video.pause();
        video.currentTime = 0;
        setReady(true);
      };
      video.play().then(primeAndReady).catch(primeAndReady);
    }

    if (video.readyState >= 1) {
      onLoadedMetadata();
    } else {
      video.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
    }
    return () => video.removeEventListener("loadedmetadata", onLoadedMetadata);
  }, []);

  // ---- ScrollTrigger: scroll controla o currentTime do video ----
  useEffect(() => {
    if (!ready) return;

    const video = videoRef.current;
    const section = sectionRef.current;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // objeto "proxy" — suaviza o seek em vez de saltar direto pro progress bruto
    const proxy = { time: 0 };

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: PIN_DISTANCE,
      pin: true,
      scrub: prefersReduced ? false : 0.8,
      anticipatePin: 1,
      onUpdate: (self) => {
        const target = self.progress * (video.duration || 0);
        if (prefersReduced) {
          video.currentTime = target;
        } else {
          // gsap suaviza a transicao entre o frame atual e o alvo,
          // evita "engasgo" quando o navegador throttla seeks muito rapidos
          gsap.to(proxy, {
            time: target,
            duration: 0.25,
            ease: "power1.out",
            overwrite: true,
            onUpdate: () => {
              video.currentTime = proxy.time;
            },
          });
        }
      },
    });

    // coreografia da UI no mesmo intervalo de scroll
    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top top", end: PIN_DISTANCE, scrub: 0.9 },
    });
    tl.fromTo(".hv-logo", { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.12 }, 0)
      .fromTo(".hv-kicker", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.12 }, 0.08)
      .fromTo(".hv-title", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.18 }, 0.16)
      .fromTo(".hv-line", { scaleX: 0 }, { scaleX: 1, duration: 0.12 }, 0.3)
      .fromTo(".hv-cta", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.14 }, 0.62)
      .to(".hv-scrollcue", { opacity: 0, duration: 0.08 }, 0.04);

    return () => {
      trigger.kill();
      tl.scrollTrigger && tl.scrollTrigger.kill();
      tl.kill();
    };
  }, [ready]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-[#0c0f0e]"
      aria-label="Introdução — LD Engenharia e Serviços"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={VIDEO_SRC}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      {/* grid tecnico sutil, igual ao resto do site */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {!ready && (
        <div className="absolute inset-0 z-20 flex items-center justify-center text-sm text-white/50">
          Carregando…
        </div>
      )}

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <img
          src="/images/logo-ld-light.png"
          alt="LD Engenharia e Serviços"
          className="hv-logo mb-8 h-9 w-auto opacity-0"
        />
        <div className="hv-kicker mb-4 flex items-center gap-3 text-xs tracking-wide text-white/60 opacity-0">
          <span className="h-px w-8 bg-[#1fa563]" />
          Engenharia &amp; Serviços — Santa Catarina
        </div>
        <h1 className="hv-title max-w-3xl text-4xl font-semibold text-white opacity-0 md:text-6xl">
          Engenharia que entrega.
          <br />
          <span className="text-[#1fa563]">Serviços que resolvem.</span>
        </h1>
        <span className="hv-line mt-8 h-px w-16 origin-left scale-x-0 bg-[#1fa563]" />
        <div className="hv-cta mt-10 flex flex-wrap justify-center gap-4 opacity-0">
          <a
            href="#contact"
            className="inline-flex items-center justify-center bg-[#0f7f4b] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#1fa563]"
          >
            Solicitar orçamento
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center border border-white/15 px-7 py-4 text-sm font-semibold text-white transition hover:border-white"
          >
            Falar pelo WhatsApp
          </a>
        </div>
      </div>

      <div className="hv-scrollcue absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-xs tracking-wide text-white/50">
        Role para conhecer
      </div>
    </section>
  );
}
