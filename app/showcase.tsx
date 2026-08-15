"use client";

import { Canvas, ThreeEvent } from "@react-three/fiber";
import { Bounds, Center, Decal, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const feltColors = [
  { name: "Bone", value: "#d9cdb5" }, { name: "Tobacco", value: "#8a4f2c" },
  { name: "Sage", value: "#69705d" }, { name: "Black", value: "#171513" },
] as const;
const bandColors: Record<string, string> = { Espresso: "#29150d", Cognac: "#8a4321", Bone: "#c4a579", Black: "#11100f" };
const assetBase = import.meta.env.BASE_URL;
const hatModelUrl = `${assetBase}cava-cowboy-hat.glb`;
type Mark = { position: [number, number, number]; rotation: [number, number, number] };

function makeMarkTexture(label: string) {
  const canvas = document.createElement("canvas"); canvas.width = 1024; canvas.height = 384;
  const context = canvas.getContext("2d")!;
  context.clearRect(0, 0, canvas.width, canvas.height); context.textAlign = "center"; context.textBaseline = "middle";
  context.fillStyle = "#5f2d16"; context.font = label.length <= 3 ? "italic 230px Georgia" : "bold 165px Georgia";
  context.fillText(label, canvas.width / 2, canvas.height / 2 + 8);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.needsUpdate = true;
  return texture;
}

function HatModel({ felt, finish, bandColor, markLabel, mark, placing, onPlace }: {
  felt: string; finish: string; bandColor: string; markLabel: string; mark: Mark | null; placing: boolean; onPlace: (mark: Mark) => void;
}) {
  const { scene } = useGLTF(hatModelUrl);
  const model = useMemo(() => scene.clone(true), [scene]);
  const primaryMesh = useRef<THREE.Mesh | null>(null);
  const markTexture = useMemo(() => makeMarkTexture(markLabel), [markLabel]);
  useEffect(() => () => markTexture.dispose(), [markTexture]);
  useEffect(() => {
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      if (!primaryMesh.current) primaryMesh.current = child;
      const material = (child.material as THREE.MeshStandardMaterial).clone();
      material.color.set(felt); material.roughness = finish === "Matte" ? .96 : finish === "Satin" ? .48 : .78; material.metalness = .02;
      child.material = material; child.castShadow = true; child.receiveShadow = true;
    });
  }, [model, felt, finish]);
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (!placing || !event.face) return; event.stopPropagation();
    const normal = event.face.normal.clone().transformDirection(event.object.matrixWorld);
    const helper = new THREE.Object3D(); helper.position.copy(event.point); helper.lookAt(event.point.clone().add(normal));
    onPlace({ position: event.point.toArray() as [number, number, number], rotation: [helper.rotation.x, helper.rotation.y, helper.rotation.z] });
  };
  return <Center><group>
    <primitive object={model} onClick={handleClick}/>
    <mesh position={[0, -1.05, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.34, .62, 1]} castShadow><torusGeometry args={[1.07, .075, 20, 128]}/><meshStandardMaterial color={bandColor} roughness={.74} metalness={.03}/></mesh>
    {mark && primaryMesh.current && <Decal mesh={primaryMesh} position={mark.position} rotation={mark.rotation} scale={[.8, .3, .3]} map={markTexture} depthTest polygonOffset polygonOffsetFactor={-4}/>} 
  </group></Center>;
}

function HatViewer(props: React.ComponentProps<typeof HatModel>) {
  return <Canvas shadows camera={{ position: [0, 0, 8], fov: 34 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
    <ambientLight intensity={1.1}/><directionalLight position={[4, 7, 6]} intensity={3.2} castShadow/><directionalLight position={[-5, 2, -2]} intensity={1.2} color="#d19a70"/>
    <Suspense fallback={null}><Bounds fit clip observe margin={1.12}><HatModel {...props}/></Bounds><Environment preset="warehouse" environmentIntensity={.65}/></Suspense>
    <OrbitControls makeDefault enablePan={false} minDistance={4} maxDistance={12} autoRotate={!props.placing} autoRotateSpeed={.35}/>
  </Canvas>;
}

export default function Showcase() {
  const [felt, setFelt] = useState(feltColors[0]); const [finish, setFinish] = useState("Matte"); const [initials, setInitials] = useState("CH");
  const [engraving, setEngraving] = useState("Monogram"); const [bandColor, setBandColor] = useState("Espresso"); const [placing, setPlacing] = useState(false);
  const [mark, setMark] = useState<Mark | null>(null); const [requested, setRequested] = useState(false);
  const markLabel = engraving === "Monogram" ? initials : engraving === "Cava Mark" ? "CAVA" : engraving === "Desert Stars" ? "✦ ✦ ✦" : "❦";
  return <main>
    <section className="hero" id="top"><div className="hero-image" aria-hidden="true"/><div className="grain" aria-hidden="true"/><header><button className="menu" aria-label="Open menu"><span>Menu</span><i/><i/></button><a className="wordmark" href="#top">Cava Hat Bar</a><a className="commission" href="#atelier"><em>Start your</em> commission <span>↗</span></a></header><div className="hero-copy"><p className="eyebrow">Custom hat experience · México / United States</p><h1>CAVA<br/><em>HAT BAR</em></h1><p className="hero-sub"><em>Wear</em> something<br/>worth remembering.</p></div><div className="hero-bottom"><span>01 / Custom hat experience</span><a href="#story">Discover Cava <b>↓</b></a><span>Weddings · Events · Pop-ups</span></div></section>
    <section className="manifesto" id="story"><p className="section-index">01 — The idea</p><h2>Your story,<br/><em>shaped by hand.</em></h2><p className="manifesto-copy">Cava brings an elevated custom hat experience to weddings, private events, and pop-ups. Choose your felt, band, finish, and markings—then leave with something unmistakably yours.</p></section>
    <section className="hat-lab" id="atelier"><div className="lab-intro"><p className="section-index">02 — Shape yours</p><h2>Meet your<br/><em>future hat.</em></h2><p>Rotate the actual hat, change its materials, then stamp your mark directly onto the felt. This is the working model—not a floating overlay.</p></div>
      <div className="hat-stage local-3d-stage"><div className="orbit-label"><span>Drag to rotate · pinch to zoom</span><span>Live Cava 3D atelier</span></div><HatViewer felt={felt.value} finish={finish} bandColor={bandColors[bandColor]} markLabel={markLabel} mark={mark} placing={placing} onPlace={(next)=>{setMark(next);setPlacing(false)}}/><div className={`shaper viewer-help ${placing?"placing":""}`}><span>{placing?"Click the felt to stamp your mark":"Real-time material preview"}</span><span>{mark?"Brand attached to hat":"Drag to inspect every angle"}</span></div></div>
      <div className="lab-controls"><div className="slide-title"><span>01</span><div><h3>Cava Signature</h3><p>Western · timeless · elevated</p></div><strong>$320</strong></div>
        <fieldset><legend>Felt color <span>{felt.name}</span></legend><div className="felt-options">{feltColors.map((color)=><button key={color.name} aria-label={color.name} aria-pressed={felt.name===color.name} style={{background:color.value}} onClick={()=>setFelt(color)}/>)}</div></fieldset>
        <fieldset><legend>Material finish <span>{finish}</span></legend><div className="segmented">{["Matte","Satin","Weathered"].map((option)=><button key={option} className={finish===option?"active":""} onClick={()=>setFinish(option)}>{option}</button>)}</div></fieldset>
        <fieldset><legend>Band color <span>{bandColor}</span></legend><div className="segmented band-colors">{Object.keys(bandColors).map((option)=><button key={option} className={bandColor===option?"active":""} onClick={()=>setBandColor(option)}>{option}</button>)}</div></fieldset>
        <fieldset><legend>Branding <span>{engraving}</span></legend><div className="engraving-options">{["Monogram","Cava Mark","Desert Stars","Wild Rose"].map((option)=><button key={option} className={engraving===option?"active":""} onClick={()=>setEngraving(option)}>{option}</button>)}</div>{engraving==="Monogram"&&<input className="initials" aria-label="Initials for hat" maxLength={3} value={initials} onChange={(event)=>setInitials(event.target.value.toUpperCase())}/>}<button className="place-engraving" onClick={()=>setPlacing(true)}>{placing?"Now click the physical hat":mark?"Reposition branding":"Place branding on 3D hat"}<span>◎</span></button></fieldset>
        <button className="request" onClick={()=>setRequested(true)}>{requested?"Your fitting request is ready":"Request a fitting"}<span>↗</span></button><small>Final price depends on felt, finish, and custom details. No payment today.</small></div>
    </section>
    <section className="process"><p className="section-index">03 — The process</p><div className="process-heading"><h2>Made slowly.<br/><em>Worn forever.</em></h2><p>From first sketch to final steam, your piece passes through real hands. No two are shaped exactly alike.</p></div><div className="process-grid"><article><span>01</span><h3>Tell us the story</h3><p>Share the occasion, the feeling, and the references you keep coming back to.</p></article><article><span>02</span><h3>Find your shape</h3><p>We fit, sketch, and choose materials around your face, wardrobe, and life.</p></article><article><span>03</span><h3>Make it personal</h3><p>Color, band, marks, embroidery, and the small details no one else will have.</p></article><article><span>04</span><h3>Wear it in</h3><p>Your finished piece arrives ready to gather miles, stories, and character.</p></article></div></section>
    <section className="closing"><p>Not merch.<br/><em>A future heirloom.</em></p><a href="#atelier">Start your commission <span>↗</span></a></section><footer><a className="wordmark" href="#top">Cava Hat Bar</a><p>Custom hat experience<br/>México · United States</p><div><a href="https://www.instagram.com/cavahatbar/">@cavahatbar</a><span>Weddings · Private Events · Pop-ups</span></div><small>© 2026 Cava Hat Bar</small></footer>
  </main>;
}

useGLTF.preload(hatModelUrl);
