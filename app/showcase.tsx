"use client";

import { useMemo, useState } from "react";

const directions = [
  { id: "studio", number: "01", name: "Studio", note: "Clean + editorial" },
  { id: "signal", number: "02", name: "Signal", note: "Bold + energetic" },
  { id: "field", number: "03", name: "Field", note: "Warm + crafted" },
] as const;
const products = [
  { id: "tee", label: "Heavy tee", price: 28, glyph: "T" },
  { id: "tote", label: "Canvas tote", price: 24, glyph: "▱" },
  { id: "cap", label: "Five-panel cap", price: 32, glyph: "⌒" },
  { id: "goods", label: "Custom goods", price: 18, glyph: "✦" },
] as const;
const colors = [
  { name: "Natural", value: "#e9e1d1" }, { name: "Ink", value: "#24221f" },
  { name: "Persimmon", value: "#ed6542" }, { name: "Moss", value: "#66705a" },
] as const;
type Direction = (typeof directions)[number]["id"];
type Product = (typeof products)[number];

export default function Showcase() {
  const [direction, setDirection] = useState<Direction>("studio");
  const [product, setProduct] = useState<Product>(products[0]);
  const [color, setColor] = useState(colors[0]);
  const [placement, setPlacement] = useState("Center");
  const [mark, setMark] = useState("MAKE\nSOMETHING");
  const [quantity, setQuantity] = useState(24);
  const [added, setAdded] = useState(false);
  const unitPrice = useMemo(() => Math.max(12, product.price - (quantity >= 100 ? 6 : quantity >= 50 ? 4 : quantity >= 24 ? 2 : 0)), [product, quantity]);

  return <main className={`site direction-${direction}`}>
    <div className="announcement"><span>Small-run custom goods, made thoughtfully</span><span>Free setup on 24+ pieces</span></div>
    <header><a className="brand" href="#top"><span className="brand-mark">P/O</span><span>Patch / Object</span></a><nav aria-label="Main navigation"><a href="#make">Make</a><a href="#process">How it works</a><a href="#work">Past work</a></nav><a className="bag-link" href="#quote">Quote list <span>{added ? "1" : "0"}</span></a></header>
    <section className="direction-bar" aria-label="Select a design direction"><p>View this template in</p><div>{directions.map((item) => <button key={item.id} onClick={() => setDirection(item.id)} className={direction === item.id ? "active" : ""}><b>{item.number}</b><span>{item.name}<small>{item.note}</small></span></button>)}</div></section>

    <section className="maker" id="top">
      <div className="maker-copy"><p className="kicker">Your idea, made tangible.</p><h1>Goods worth<br/>holding onto.</h1><div><p className="lede">Design custom apparel and everyday objects without the usual back-and-forth. Start with a piece, make it yours, and see the numbers as you go.</p><div className="proof"><span>4.9 / 5 client rating</span><span>Made in Phoenix, AZ</span></div></div></div>
      <div className="configurator" id="make">
        <div className="product-stage" style={{ "--product-color": color.value } as React.CSSProperties}>
          <div className={`product product-${product.id}`} aria-label={`${color.name} ${product.label} preview`}>
            {product.id === "tee" && <i className="collar"/>}{product.id === "tote" && <i className="handles"/>}{product.id === "cap" && <i className="bill"/>}
            <span className={`imprint placement-${placement.toLowerCase().replace(" ", "-")}`}>{mark.split("\n").map((line, i) => <span key={i}>{line}</span>)}</span>
          </div><span className="stage-label">Live preview · Not to scale</span>
        </div>
        <div className="controls">
          <div className="control-heading"><span>Build yours</span><strong>${unitPrice}<small> / piece</small></strong></div>
          <fieldset><legend><b>01</b> Choose a base</legend><div className="product-options">{products.map((item) => <button key={item.id} className={product.id === item.id ? "selected" : ""} onClick={() => setProduct(item)}><i>{item.glyph}</i><span>{item.label}<small>from ${item.price}</small></span></button>)}</div></fieldset>
          <fieldset><legend><b>02</b> Pick a color <em>{color.name}</em></legend><div className="swatches">{colors.map((item) => <button key={item.name} aria-label={item.name} aria-pressed={color.name === item.name} onClick={() => setColor(item)} style={{background:item.value}} />)}</div></fieldset>
          <fieldset><legend><b>03</b> Add your mark</legend><div className="mark-row"><textarea aria-label="Text on product" maxLength={28} value={mark} onChange={(e) => setMark(e.target.value.toUpperCase())}/><select aria-label="Print placement" value={placement} onChange={(e) => setPlacement(e.target.value)}><option>Center</option><option>Left chest</option><option>Oversized</option></select></div></fieldset>
          <fieldset><legend><b>04</b> Quantity</legend><div className="quantity-row"><button onClick={() => setQuantity(Math.max(12, quantity - 12))} aria-label="Decrease quantity">−</button><output>{quantity} pieces</output><button onClick={() => setQuantity(quantity + 12)} aria-label="Increase quantity">+</button><span>Save more at 50+</span></div></fieldset>
          <div className="quote-total"><span>Estimated total<small>Shipping calculated with your final quote.</small></span><strong>${(unitPrice * quantity).toLocaleString()}</strong></div>
          <button id="quote" className="quote-button" onClick={() => setAdded(true)}>{added ? "Added — we’ll make it real" : "Add to quote list"}<span>↗</span></button>
        </div>
      </div>
    </section>
    <section className="steps" id="process"><p className="kicker">Simple by design</p><h2>From loose idea<br/>to favorite thing.</h2><div className="step-grid"><article><b>01</b><h3>Build it</h3><p>Pick a base, color, placement, and quantity. Your estimate updates along the way.</p></article><article><b>02</b><h3>Refine it</h3><p>A real person checks every detail and sends a production-ready proof.</p></article><article><b>03</b><h3>Get the goods</h3><p>We print, pack, and send it your way in about 10–14 business days.</p></article></div></section>
    <section className="work" id="work"><div><p className="kicker">Recently made</p><h2>Objects with a point of view.</h2></div><div className="work-card card-one"><span>Desert Run Club</span><b>48 hats</b></div><div className="work-card card-two"><span>Good Day Coffee</span><b>120 totes</b></div><div className="work-card card-three"><span>Soft Focus Studio</span><b>36 tees</b></div></section>
    <footer><a className="brand" href="#top"><span className="brand-mark">P/O</span><span>Patch / Object</span></a><p>Custom pieces for good people.<br/>Phoenix, Arizona.</p><div><a href="mailto:hello@patchandobject.com">hello@patchandobject.com</a><span>© 2026 Patch / Object</span></div></footer>
  </main>;
}
