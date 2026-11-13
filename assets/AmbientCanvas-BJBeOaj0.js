import{A as e,C as t,E as n,G as r,M as i,R as a,S as o,a as s,f as c,i as l,m as u,n as d,o as f,r as p,rt as m,st as h,t as g,u as _,z as v}from"./three-BKSKVEZW.js";import{n as y}from"./index-DTqBKS86.js";var b=`// Polvo dorado y vapor: deriva ascendente orgánica, empuje del puntero y
// arrastre según la velocidad del scroll. aKind: 0 = polvo, 1 = vapor.

uniform float uTime;
uniform float uPixelRatio;
uniform float uIntensity;
uniform float uScrollDrift;
uniform float uScrollEnergy;
uniform vec2 uPointer;
uniform vec2 uBounds;

attribute float aSeed;
attribute float aKind;
attribute float aSize;

varying float vAlpha;
varying float vKind;

void main() {
  vec3 p = position;
  float t = uTime;
  float lane = 0.5 + aSeed;

  // Deriva vertical continua (se envuelve dentro del volumen)
  float rise = t * mix(0.07, 0.03, aKind) * lane + uScrollDrift * mix(0.9, 0.45, aKind) * lane;
  p.y = mod(p.y + rise + uBounds.y, uBounds.y * 2.0) - uBounds.y;

  // Remolino orgánico
  p.x += sin(t * 0.28 * lane + aSeed * 6.2831 + p.y * 0.8) * 0.22 * (1.0 + aKind * 1.5);
  p.z += cos(t * 0.21 * lane + aSeed * 12.0) * 0.25;

  // El puntero aparta las partículas con suavidad
  vec2 delta = p.xy - uPointer;
  float dist = length(delta);
  float push = smoothstep(1.5, 0.0, dist);
  p.xy += (delta / max(dist, 1e-4)) * push * 0.5 * (1.0 - aKind * 0.4);

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float size = aSize * mix(1.0, 11.0, aKind) * (1.0 + uScrollEnergy * 0.35 * (1.0 - aKind));
  gl_PointSize = size * uPixelRatio * (6.0 / -mvPosition.z);

  float twinkle = 0.55 + 0.45 * sin(t * 1.6 * lane + aSeed * 40.0);
  float edgeFade = smoothstep(uBounds.y, uBounds.y * 0.72, abs(p.y));
  vAlpha = uIntensity * mix(twinkle, 0.55, aKind) * edgeFade;
  vKind = aKind;
}
`,x=`uniform vec3 uDustColor;
uniform vec3 uVaporColor;

varying float vAlpha;
varying float vKind;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float dust = pow(smoothstep(0.5, 0.0, d), 2.4);
  float vapor = smoothstep(0.5, 0.05, d);
  vapor = vapor * vapor * 0.16;
  float alpha = mix(dust, vapor, vKind) * vAlpha;
  if (alpha < 0.003) discard;
  gl_FragColor = vec4(mix(uDustColor, uVaporColor, vKind), alpha);
  #include <colorspace_fragment>
}
`,S=[`object`],C=6,w=45,T=.12,E=i({__name:`AmbientParticles`,props:{count:{},pixelRatio:{}},setup(e){let t=e,r=new u(6.5,3.4);function i(e){let t=new Float32Array(e*3),n=new Float32Array(e),i=new Float32Array(e),a=new Float32Array(e);for(let o=0;o<e;o++){t[o*3]=(Math.random()*2-1)*r.x,t[o*3+1]=(Math.random()*2-1)*r.y,t[o*3+2]=(Math.random()*2-1)*2,n[o]=Math.random();let e=Math.random()<T;i[o]=+!!e,a[o]=e?10+Math.random()*12:1.2+Math.random()*2.6}let o=new s;return o.setAttribute(`position`,new l(t,3)),o.setAttribute(`aSeed`,new l(n,1)),o.setAttribute(`aKind`,new l(i,1)),o.setAttribute(`aSize`,new l(a,1)),o}let o={uTime:{value:0},uPixelRatio:{value:t.pixelRatio},uIntensity:{value:1},uScrollDrift:{value:0},uScrollEnergy:{value:0},uPointer:{value:new u(99,99)},uBounds:{value:r.clone()},uDustColor:{value:new f(`#d99b52`)},uVaporColor:{value:new f(`#fffaf2`)}},h=i(t.count),g=new c({vertexShader:b,fragmentShader:x,uniforms:o,transparent:!0,depthWrite:!1,blending:1}),E=new _(h,g);E.frustumCulled=!1;let D=m(E),{sizes:O}=p(),{onBeforeRender:k}=d(),A=new u,j=0,M=0;function N(e,t,n,r){return e+(t-e)*(1-Math.exp(-n*r))}let{off:P}=k(({delta:e,elapsed:t})=>{let n=Math.min(e,.05);o.uTime.value=t;let r=O.width.value||window.innerWidth,i=O.height.value||window.innerHeight,a=Math.tan(w*Math.PI/360)*C,s=r/Math.max(i,1)*a;A.set(y.pointerX*s,y.pointerY*a);let c=o.uPointer.value;c.x>50&&c.copy(A),c.x=N(c.x,A.x,4,n),c.y=N(c.y,A.y,4,n);let l=y.scrollVelocity;j+=l*.0016,M=N(M,Math.min(Math.abs(l)/40,1),6,n),o.uScrollDrift.value=j,o.uScrollEnergy.value=M;let u=Math.min(y.scroll/Math.max(window.innerHeight,1),1);o.uIntensity.value=N(o.uIntensity.value,1-u*.6,3,n)});return a(()=>{P(),h.dispose(),g.dispose()}),(e,t)=>(v(),n(`primitive`,{object:D.value},null,8,S))}}),D={class:`pointer-events-none fixed inset-0 z-30`,"aria-hidden":`true`},O=i({__name:`AmbientCanvas`,props:{tier:{}},setup(i){let a=i,s=o(()=>a.tier===`full`?1.75:1.25),c=o(()=>a.tier===`full`?1400:600),l=o(()=>Math.min(window.devicePixelRatio||1,s.value));return(i,a)=>(v(),n(`div`,D,[e(h(g),{alpha:!0,"clear-alpha":0,antialias:!1,dpr:[1,s.value],"power-preference":`high-performance`,"render-mode":`always`},{default:r(()=>[a[0]||=t(`TresPerspectiveCamera`,{position:[0,0,6],fov:45,near:.1,far:30},null,-1),e(E,{count:c.value,"pixel-ratio":l.value},null,8,[`count`,`pixel-ratio`])]),_:1},8,[`dpr`])]))}});export{O as default};