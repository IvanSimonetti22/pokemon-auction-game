import { useRef, useEffect } from 'react';
import { Renderer, Program, Triangle, Mesh, Texture } from 'ogl';

const hexToRgb = hex => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  return m ? [parseInt(m[1],16)/255, parseInt(m[2],16)/255, parseInt(m[3],16)/255] : [0,0,0];
};

const vertex = `#version 300 es
in vec2 position;
out vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

// Pure halftone — no reveal/mouse effect, always shows the print pattern
const fragment = `#version 300 es
precision highp float;

uniform sampler2D tMap;
uniform vec2 iResolution;
uniform vec2 uImageSize;
uniform float uDotSize;
uniform float uDensity;
uniform float uAngle;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform float uContrast;

in vec2 vUv;
out vec4 fragColor;

vec2 uAspect() { return vec2(iResolution.x / max(iResolution.y, 1.0), 1.0); }

vec2 coverUv(vec2 uv) {
  float ia = uImageSize.x / max(uImageSize.y, 1.0);
  float pa = iResolution.x / max(iResolution.y, 1.0);
  vec2 s = pa > ia ? vec2(1.0, ia / pa) : vec2(pa / ia, 1.0);
  return (uv - 0.5) * s + 0.5;
}

vec3 gradeRGB(vec3 c) { return clamp((c - 0.5) * uContrast + 0.5, 0.0, 1.0); }

mat2 rot(float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

void main() {
  vec2 aspect = uAspect();
  vec2 st = vUv * aspect;
  float ang = radians(uAngle);

  // Sample the cell center for luminance
  vec2 rp = rot(ang) * st * uDensity;
  vec2 center = floor(rp) + 0.5;
  vec2 stC = rot(-ang) * (center / uDensity);
  vec2 uvC = stC / aspect;
  vec3 gc = gradeRGB(texture(tMap, clamp(coverUv(uvC), 0.0, 1.0)).rgb);
  float lum = dot(gc, vec3(0.299, 0.587, 0.114));

  // Circle mask
  vec2 f = fract(rp) - 0.5;
  float d = length(f);
  float r = sqrt(clamp(1.0 - lum, 0.0, 1.0)) * 0.72 * uDotSize;
  float w = length(fwidth(rp)) * 0.6 + 1e-4;
  float cov = smoothstep(r + w, r - w, d);

  fragColor = vec4(mix(uPaper, uInk, cov), 1.0);
}`;

// Pure halftone bg — no reveal, no mouse tracking. Just the dot pattern.
const HalftoneReveal = ({
  src = 'https://picsum.photos/seed/halftone-bg/800/600',
  inkColor = '#141414',
  paperColor = '#0a0a0c',
  dotSize = 1.0,
  dotDensity = 60,
  angle = 28,
  contrast = 1.1,
}) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const uniformsRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio||1, 2), alpha: false });
    rendererRef.current = renderer;
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 1);
    gl.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    container.appendChild(gl.canvas);

    const texture = new Texture(gl, { generateMipmaps: false });
    const uniforms = {
      tMap:        { value: texture },
      iResolution: { value: [1, 1] },
      uImageSize:  { value: [1, 1] },
      uDotSize:    { value: dotSize },
      uDensity:    { value: dotDensity },
      uAngle:      { value: angle },
      uInk:        { value: hexToRgb(inkColor) },
      uPaper:      { value: hexToRgb(paperColor) },
      uContrast:   { value: contrast },
    };
    uniformsRef.current = uniforms;

    const program = new Program(gl, { vertex, fragment, uniforms });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => { texture.image = img; uniforms.uImageSize.value = [img.naturalWidth, img.naturalHeight]; };

    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h);
      uniforms.iResolution.value = [gl.canvas.width, gl.canvas.height];
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      renderer.render({ scene: mesh });
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
      rendererRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    const u = uniformsRef.current;
    if (!u) return;
    u.uInk.value   = hexToRgb(inkColor);
    u.uPaper.value = hexToRgb(paperColor);
    u.uDotSize.value  = dotSize;
    u.uDensity.value  = dotDensity;
    u.uAngle.value    = angle;
    u.uContrast.value = contrast;
  }, [inkColor, paperColor, dotSize, dotDensity, angle, contrast]);

  return <div ref={containerRef} style={{ position:'absolute', inset:0, zIndex:0, overflow:'hidden', pointerEvents:'none' }} />;
};

export default HalftoneReveal;
