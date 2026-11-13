import{A as e,E as t,Et as n,G as r,M as i,R as a,S as o,W as s,c,d as l,f as u,l as d,m as f,n as p,nt as m,p as h,r as g,rt as _,s as v,st as y,t as b,z as x}from"./three-BKSKVEZW.js";import{n as S,t as C}from"./index-DTqBKS86.js";var w=`// Cuadro a pantalla completa en espacio de recorte (independiente de la cámara)
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,T=`// Fotografía del hero como superficie líquida:
// - "cover" exacto según proporciones de pantalla e imagen
// - Ken Burns controlado por scroll (uZoom) hacia la luz de la ventana
// - corriente lenta (simplex) + ondas concéntricas alrededor del puntero
// - leve aberración cromática y brillo cáustico en la cresta de las ondas

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uImageSize;
uniform vec2 uPointer;
uniform vec2 uFocus;
uniform float uTime;
uniform float uZoom;
uniform float uRipple;

varying vec2 vUv;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

// Simplex 3D — Ian McEwan, Stefan Gustavson (Ashima Arts). Licencia MIT.
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec2 coverUv(vec2 uv) {
  float screenRatio = uResolution.x / uResolution.y;
  float imageRatio = uImageSize.x / uImageSize.y;
  vec2 scale = screenRatio > imageRatio ? vec2(1.0, imageRatio / screenRatio) : vec2(screenRatio / imageRatio, 1.0);
  return (uv - 0.5) * scale + 0.5;
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);

  // Ken Burns hacia el foco de luz
  vec2 base = (coverUv(uv) - uFocus) / (1.0 + uZoom) + uFocus;

  // Corriente lenta en toda la superficie
  vec2 flow = vec2(snoise(vec3(uv * 2.2, uTime * 0.05)), snoise(vec3(uv * 2.2 + 5.2, uTime * 0.05)));

  // Ondas alrededor del puntero
  vec2 toPointer = (uv - uPointer) * aspect;
  float d = length(toPointer);
  vec2 dir = toPointer / max(d, 1e-4);
  float envelope = exp(-d * 5.5);
  float ring = sin(d * 36.0 - uTime * 3.2) * envelope;

  vec2 offset = flow * 0.0022 + dir * ring * 0.011 * uRipple;
  float aberration = 0.0028 * uRipple * envelope;

  vec3 color;
  color.r = texture2D(uTexture, base + offset + dir * aberration).r;
  color.g = texture2D(uTexture, base + offset).g;
  color.b = texture2D(uTexture, base + offset - dir * aberration).b;

  // Brillo cálido en las crestas
  color += vec3(1.0, 0.85, 0.62) * max(ring, 0.0) * 0.045 * uRipple;

  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}
`,E=[`object`],D=i({__name:`HeroLiquidSurface`,props:{src:{},active:{type:Boolean}},emits:[`ready`,`error`],setup(e,{emit:n}){let r=e,i=n,o={uTexture:{value:null},uResolution:{value:new f(1,1)},uImageSize:{value:new f(1376,768)},uPointer:{value:new f(.5,.5)},uFocus:{value:new f(.66,.6)},uTime:{value:0},uZoom:{value:.04},uRipple:{value:0}},m=new d(2,2),y=new u({vertexShader:w,fragmentShader:T,uniforms:o,depthTest:!1,depthWrite:!1}),b=new c(m,y);b.frustumCulled=!1;let D=_(b),O=null;new h().load(r.src,e=>{e.colorSpace=l,e.minFilter=v,e.generateMipmaps=!1;let t=e.image;t?.width&&t.height&&o.uImageSize.value.set(t.width,t.height),O=e,o.uTexture.value=e,i(`ready`)},void 0,()=>i(`error`));let{sizes:k}=g(),{onBeforeRender:A,start:j,stop:M}=p(),N=new f(0,0),P=0;function F(e,t,n,r){return e+(t-e)*(1-Math.exp(-n*r))}let{off:I}=A(({delta:e,elapsed:t})=>{let n=Math.min(e,.05);o.uTime.value=t,o.uResolution.value.set(k.width.value||1,k.height.value||1);let r=S.pointerX*.5+.5,i=S.pointerY*.5+.5,a=o.uPointer.value;a.x=F(a.x,r,5,n),a.y=F(a.y,i,5,n);let s=Math.hypot(r-N.x,i-N.y)/Math.max(n,.001);N.set(r,i),P=F(P,Math.min(s*.6,1),3,n),o.uRipple.value=F(o.uRipple.value,.18+P*.82,2.5,n),o.uZoom.value=.035+Math.sin(t*.06)*.012+C.progress*.2});return s(()=>r.active,e=>{e?j():M()}),a(()=>{I(),m.dispose(),y.dispose(),O?.dispose(),O=null}),(e,n)=>(x(),t(`primitive`,{object:D.value},null,8,E))}}),O=i({__name:`HeroLiquidCanvas`,props:{src:{},tier:{},active:{type:Boolean}},emits:[`fallback`],setup(i,{emit:a}){let s=i,c=a,l=m(!1),u=o(()=>s.tier===`full`?1.5:1.15);return(a,o)=>(x(),t(`div`,{class:n([`absolute inset-0 transition-opacity duration-[1400ms] ease-(--ease-silk)`,l.value?`opacity-100`:`opacity-0`]),"aria-hidden":`true`},[e(y(b),{antialias:!1,dpr:[1,u.value],"power-preference":`high-performance`,"render-mode":`always`},{default:r(()=>[e(D,{src:i.src,active:i.active,onReady:o[0]||=e=>l.value=!0,onError:o[1]||=e=>c(`fallback`)},null,8,[`src`,`active`])]),_:1},8,[`dpr`])],2))}});export{O as default};