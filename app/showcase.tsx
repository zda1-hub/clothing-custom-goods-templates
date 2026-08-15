"use client";

import { useEffect, useState } from "react";

const hatShapes = [
  { name: "The High Desert", note: "Tall crown · wide brim", crown: 42, brim: 96, price: 340 },
  { name: "The Drifter", note: "Low crown · soft roll", crown: 33, brim: 84, price: 295 },
  { name: "The Cattleman", note: "Classic crease · firm edge", crown: 38, brim: 90, price: 320 },
] as const;

const feltColors = [
  { name: "Bone", value: "#d9cdb5" },
  { name: "Tobacco", value: "#8a4f2c" },
  { name: "Sage", value: "#69705d" },
  { name: "Black", value: "#171513" },
] as const;

export default function Showcase() {
  const [slide, setSlide] = useState(0);
  const [shape, setShape] = useState(58);
  const [felt, setFelt] = useState(feltColors[0]);
  const [band, setBand] = useState("Leather");
  const [initials, setInitials] = useState("RM");
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % hatShapes.length), 6500);
    return () => window.clearInterval(timer);
  }, []);

  const selected = hatShapes[slide];
  const crownHeight = selected.crown + (shape - 50) * 0.15;
  const brimWidth = selected.brim + (shape - 50) * 0.18;
  const feltFilter = felt.name === "Bone" ? "sepia(.72) saturate(.45) brightness(1.7)" : felt.name === "Tobacco" ? "sepia(.8) saturate(1.45) brightness(.95)" : felt.name === "Sage" ? "sepia(.35) saturate(.5) hue-rotate(42deg) brightness(1.05)" : "none";

  return <main>
    <section className="hero" id="top">
      <div className="hero-image" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <header>
        <button className="menu" aria-label="Open menu"><span>Menu</span><i /><i /></button>
        <a className="wordmark" href="#top">Range / Made</a>
        <a className="commission" href="#atelier"><em>Start your</em> commission <span>↗</span></a>
      </header>
      <div className="hero-copy">
        <p className="eyebrow">Custom western goods · Phoenix, Arizona</p>
        <h1>RANGE<br/><em>/ MADE</em></h1>
        <p className="hero-sub"><em>Wear</em> something<br/>worth remembering.</p>
      </div>
      <div className="hero-bottom"><span>01 / Bespoke hats</span><a href="#story">Discover the atelier <b>↓</b></a><span>Made one at a time</span></div>
    </section>

    <section className="manifesto" id="story">
      <p className="section-index">01 — The idea</p>
      <h2>Your story,<br/><em>shaped by hand.</em></h2>
      <p className="manifesto-copy">We make custom hats and clothing for people who would rather keep one good thing than collect a hundred forgettable ones. Every piece begins with a conversation and ends with something unmistakably yours.</p>
    </section>

    <section className="hat-lab" id="atelier">
      <div className="lab-intro">
        <p className="section-index">02 — Shape yours</p>
        <h2>Meet your<br/><em>future hat.</em></h2>
        <p>Choose a silhouette, pull the shaper, then make the details yours. This is a starting point—our hatter refines every proportion by hand.</p>
      </div>
      <div className="hat-stage" style={{"--felt": felt.value, "--crown": `${crownHeight}%`, "--brim": `${brimWidth}%`} as React.CSSProperties}>
        <div className="orbit-label"><span>Drag to shape</span><span>Live atelier preview</span></div>
        <div className="hat-render-wrap" aria-label={`${felt.name} ${selected.name} preview`} style={{transform:`scaleX(${.94 + brimWidth / 1500}) scaleY(${.94 + crownHeight / 1500}) rotate(${(shape - 50) * .025}deg)`}}><img className="hat-render" src="./range-made-hat-v2.png" alt="Custom black felt cowboy hat with a silver buckle" style={{filter:feltFilter}}/><span className="hat-monogram">{initials}</span></div>
        <div className="shaper"><span>Soft</span><input aria-label="Adjust hat shape" type="range" min="0" max="100" value={shape} onChange={(event) => setShape(Number(event.target.value))}/><span>Sharp</span></div>
      </div>
      <div className="lab-controls">
        <div className="slide-title"><span>0{slide + 1}</span><div><h3>{selected.name}</h3><p>{selected.note}</p></div><strong>${selected.price}</strong></div>
        <div className="slide-nav" aria-label="Hat styles">{hatShapes.map((hat, index) => <button key={hat.name} onClick={() => setSlide(index)} className={slide === index ? "active" : ""} aria-label={`Show ${hat.name}`}><span/></button>)}</div>
        <fieldset><legend>Felt color <span>{felt.name}</span></legend><div className="felt-options">{feltColors.map((color) => <button key={color.name} aria-label={color.name} aria-pressed={felt.name === color.name} style={{background:color.value}} onClick={() => setFelt(color)}/>)}</div></fieldset>
        <fieldset><legend>Hat band <span>{band}</span></legend><div className="segmented">{["Leather", "Grosgrain", "Braided"].map((option) => <button key={option} className={band === option ? "active" : ""} onClick={() => setBand(option)}>{option}</button>)}</div></fieldset>
        <fieldset><legend>Branding <span>Up to 3 characters</span></legend><input className="initials" aria-label="Initials for hat" maxLength={3} value={initials} onChange={(event) => setInitials(event.target.value.toUpperCase())}/></fieldset>
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
    <footer><a className="wordmark" href="#top">Range / Made</a><p>Bespoke hats & custom clothing<br/>Phoenix, Arizona</p><div><a href="mailto:studio@rangemade.com">studio@rangemade.com</a><span>Instagram &nbsp; Pinterest</span></div><small>© 2026 Range / Made</small></footer>
  </main>;
}
