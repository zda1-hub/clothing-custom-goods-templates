"use client";

import { useEffect, useRef, useState } from "react";

type ViewerMaterial = { name: string; channels: Record<string, { color?: number[]; factor?: number }> };
type ViewerPick = { position3D?: number[]; normal?: number[]; instanceID?: number };
type ViewerDecal = { id: string };
type ViewerApi = {
  start: () => void;
  addEventListener: (event: string, callback: (info: ViewerPick) => void, options?: Record<string, unknown>) => void;
  getMaterialList: (callback: (error: unknown, materials: ViewerMaterial[]) => void) => void;
  setMaterial: (material: ViewerMaterial) => void;
  addTexture: (url: string, callback: (error: unknown, uid: string) => void) => void;
  createMaterial: (data: Record<string, unknown>, callback: (error: unknown, material: { id: string }) => void) => void;
  createDecal: (data: Record<string, unknown>, callback: (error: unknown, decal: ViewerDecal) => void) => void;
  destroyDecal: (id: string, options: Record<string, unknown>) => void;
};
type SketchfabConstructor = new (version: string, iframe: HTMLIFrameElement) => { init: (uid: string, options: Record<string, unknown>) => void };
declare global { interface Window { Sketchfab?: SketchfabConstructor } }

const feltColors = [
  { name: "Bone", value: "#d9cdb5" },
  { name: "Tobacco", value: "#8a4f2c" },
  { name: "Sage", value: "#69705d" },
  { name: "Black", value: "#171513" },
] as const;

export default function Showcase() {
  const [felt, setFelt] = useState(feltColors[0]);
  const [band, setBand] = useState("Matte");
  const [initials, setInitials] = useState("RM");
  const [engraving, setEngraving] = useState("Monogram");
  const [bandColor, setBandColor] = useState("Espresso");
  const [placing, setPlacing] = useState(false);
  const [requested, setRequested] = useState(false);
  const [viewerReady, setViewerReady] = useState(false);
  const viewerFrame = useRef<HTMLIFrameElement>(null);
  const viewerApi = useRef<ViewerApi | null>(null);
  const viewerMaterials = useRef<ViewerMaterial[]>([]);
  const viewerStarted = useRef(false);
  const placingRef = useRef(false);
  const initialsRef = useRef(initials);
  const engravingRef = useRef(engraving);
  const activeDecal = useRef<ViewerDecal | null>(null);

  useEffect(() => { placingRef.current = placing; }, [placing]);
  useEffect(() => { initialsRef.current = initials; }, [initials]);
  useEffect(() => { engravingRef.current = engraving; }, [engraving]);

  useEffect(() => {
    if (viewerStarted.current || !viewerFrame.current) return;
    viewerStarted.current = true;
    const initialize = () => {
      if (!window.Sketchfab || !viewerFrame.current) return;
      const client = new window.Sketchfab("1.12.1", viewerFrame.current);
      client.init("ebcd0a0e1bb941f69c5f1ca4049e8619", {
        autostart: 1, autospin: .12, camera: 0, dnt: 1, scrollwheel: 0,
        success: (api: ViewerApi) => {
          viewerApi.current = api;
          api.start();
          api.addEventListener("viewerready", () => {
            api.getMaterialList((error, materials) => {
              if (!error) { viewerMaterials.current = materials; setViewerReady(true); }
            });
            api.addEventListener("click", (info) => {
              if (!placingRef.current || !info.position3D || !info.normal) return;
              const canvas = document.createElement("canvas");
              canvas.width = 768; canvas.height = 256;
              const context = canvas.getContext("2d");
              if (!context) return;
              const choice = engravingRef.current;
              const mark = choice === "Monogram" ? initialsRef.current : choice === "Cava Mark" ? "CAVA" : choice === "Desert Stars" ? "✦  ✦  ✦" : "❦";
              context.clearRect(0, 0, canvas.width, canvas.height);
              context.fillStyle = "#c89a62";
              context.textAlign = "center"; context.textBaseline = "middle";
              context.font = choice === "Monogram" ? "italic 140px Georgia" : choice === "Cava Mark" ? "120px Georgia" : "150px Georgia";
              context.fillText(mark, canvas.width / 2, canvas.height / 2);
              api.addTexture(canvas.toDataURL("image/png"), (textureError, textureUid) => {
                if (textureError) return;
                api.createMaterial({ name: "Cava engraving", channels: { AlbedoPBR: { color: [0.58, 0.32, 0.14], texture: { uid: textureUid } }, Opacity: { enable: true, texture: { uid: textureUid } }, RoughnessPBR: { factor: .65 } } }, (materialError, material) => {
                  if (materialError) return;
                  if (activeDecal.current) api.destroyDecal(activeDecal.current.id, { deleteMaterial: true });
                  api.createDecal({ position: info.position3D, normal: info.normal, scale: [.11, .045, .025], materialID: material.id, useBaseNormalMap: true }, (decalError, decal) => {
                    if (!decalError) { activeDecal.current = decal; placingRef.current = false; setPlacing(false); }
                  });
                });
              });
            }, { pick: "slow" });
          });
        },
        error: () => { viewerStarted.current = false; },
      });
    };
    if (window.Sketchfab) initialize();
    else {
      const script = document.createElement("script");
      script.src = "https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js";
      script.async = true;
      script.onload = initialize;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const api = viewerApi.current;
    if (!api || !viewerMaterials.current.length) return;
    const rgb = felt.name === "Bone" ? [0.64, 0.48, 0.29] : felt.name === "Tobacco" ? [0.32, 0.11, 0.035] : felt.name === "Sage" ? [0.17, 0.2, 0.12] : [0.012, 0.012, 0.014];
    const bandRgb = bandColor === "Espresso" ? [0.1, 0.035, 0.015] : bandColor === "Cognac" ? [0.42, 0.16, 0.045] : bandColor === "Bone" ? [0.65, 0.5, 0.33] : [0.02, 0.02, 0.022];
    viewerMaterials.current.forEach((material) => {
      if (/metal|buckle|stitch/i.test(material.name)) return;
      const color = /band|strap|trim/i.test(material.name) ? bandRgb : rgb;
      if (material.channels.AlbedoPBR) material.channels.AlbedoPBR.color = color;
      if (material.channels.DiffuseColor) material.channels.DiffuseColor.color = color;
      if (material.channels.RoughnessPBR) material.channels.RoughnessPBR.factor = band === "Matte" ? .88 : band === "Satin" ? .5 : .72;
      api.setMaterial(material);
    });
  }, [felt, band, bandColor, viewerReady]);

  return <main>
    <section className="hero" id="top">
      <div className="hero-image" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <header>
        <button className="menu" aria-label="Open menu"><span>Menu</span><i /><i /></button>
        <a className="wordmark" href="#top">Cava Hat Bar</a>
        <a className="commission" href="#atelier"><em>Start your</em> commission <span>↗</span></a>
      </header>
      <div className="hero-copy">
        <p className="eyebrow">Custom hat experience · México / United States</p>
        <h1>CAVA<br/><em>HAT BAR</em></h1>
        <p className="hero-sub"><em>Wear</em> something<br/>worth remembering.</p>
      </div>
      <div className="hero-bottom"><span>01 / Custom hat experience</span><a href="#story">Discover Cava <b>↓</b></a><span>Weddings · Events · Pop-ups</span></div>
    </section>

    <section className="manifesto" id="story">
      <p className="section-index">01 — The idea</p>
      <h2>Your story,<br/><em>shaped by hand.</em></h2>
      <p className="manifesto-copy">Cava brings an elevated custom hat experience to weddings, private events, and pop-ups. Choose your felt, band, finish, and markings—then leave with something unmistakably yours.</p>
    </section>

    <section className="hat-lab" id="atelier">
      <div className="lab-intro">
        <p className="section-index">02 — Shape yours</p>
        <h2>Meet your<br/><em>future hat.</em></h2>
        <p>Rotate the real hat, choose your materials, then place an engraving directly on its surface. At the bar, every detail is finished by hand.</p>
      </div>
      <div className="hat-stage sketchfab-stage">
        <div className="orbit-label"><span>Drag to rotate · scroll page normally</span><span>Live 3D atelier preview</span></div>
        <iframe ref={viewerFrame} className="sketchfab-viewer" title={`${felt.name} Cava Hat Bar interactive 3D preview`} allow="autoplay; fullscreen; xr-spatial-tracking" allowFullScreen />
        <div className={`shaper viewer-help ${placing ? "placing" : ""}`}><span>{placing ? "Click directly on the hat to place it" : "Click + drag to rotate"}</span><span>{placing ? "Placement mode active" : "Pinch to zoom"}</span></div>
      </div>
      <div className="lab-controls">
        <div className="slide-title"><span>01</span><div><h3>Cava Signature</h3><p>Western · timeless · elevated</p></div><strong>$320</strong></div>
        <fieldset><legend>Felt color <span>{felt.name}</span></legend><div className="felt-options">{feltColors.map((color) => <button key={color.name} aria-label={color.name} aria-pressed={felt.name === color.name} style={{background:color.value}} onClick={() => setFelt(color)}/>)}</div></fieldset>
        <fieldset><legend>Material finish <span>{band}</span></legend><div className="segmented">{["Matte", "Satin", "Weathered"].map((option) => <button key={option} className={band === option ? "active" : ""} onClick={() => setBand(option)}>{option}</button>)}</div></fieldset>
        <fieldset><legend>Band color <span>{bandColor}</span></legend><div className="segmented band-colors">{["Espresso", "Cognac", "Bone", "Black"].map((option) => <button key={option} className={bandColor === option ? "active" : ""} onClick={() => setBandColor(option)}>{option}</button>)}</div></fieldset>
        <fieldset><legend>Engraving <span>{engraving}</span></legend><div className="engraving-options">{["Monogram", "Cava Mark", "Desert Stars", "Wild Rose"].map((option) => <button key={option} className={engraving === option ? "active" : ""} onClick={() => setEngraving(option)}>{option}</button>)}</div>{engraving === "Monogram" && <input className="initials" aria-label="Initials for hat" maxLength={3} value={initials} onChange={(event) => setInitials(event.target.value.toUpperCase())}/>}<button className="place-engraving" disabled={!viewerReady} onClick={() => setPlacing(true)}>{placing ? "Now click the hat" : "Place engraving on 3D hat"}<span>◎</span></button></fieldset>
        <button className="request" onClick={() => setRequested(true)}>{requested ? "Your fitting request is ready" : "Request a fitting"}<span>↗</span></button>
        <small>Final price depends on felt, finish, and custom details. No payment today.</small>
      </div>
    </section>

    <section className="process">
      <p className="section-index">03 — The process</p>
      <div className="process-heading"><h2>Made slowly.<br/><em>Worn forever.</em></h2><p>From first sketch to final steam, your piece passes through real hands. No two are shaped exactly alike.</p></div>
      <div className="process-grid"><article><span>01</span><h3>Tell us the story</h3><p>Share the occasion, the feeling, and the references you keep coming back to.</p></article><article><span>02</span><h3>Find your shape</h3><p>We fit, sketch, and choose materials around your face, wardrobe, and life.</p></article><article><span>03</span><h3>Make it personal</h3><p>Color, band, marks, embroidery, and the small details no one else will have.</p></article><article><span>04</span><h3>Wear it in</h3><p>Your finished piece arrives ready to gather miles, stories, and character.</p></article></div>
    </section>

    <section className="closing"><p>Not merch.<br/><em>A future heirloom.</em></p><a href="#atelier">Start your commission <span>↗</span></a></section>
    <footer><a className="wordmark" href="#top">Cava Hat Bar</a><p>Custom hat experience<br/>México · United States</p><div><a href="https://www.instagram.com/cavahatbar/">@cavahatbar</a><span>Weddings · Private Events · Pop-ups</span></div><small>© 2026 Cava Hat Bar</small></footer>
  </main>;
}
