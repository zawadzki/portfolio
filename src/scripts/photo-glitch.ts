import * as THREE from "three";

const figures = Array.from(
  document.querySelectorAll<HTMLElement>(".about-photo[data-crt]")
);

if (figures.length) {
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const vertexShader = `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uIntensity;
    varying vec2 vUv;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
      float intensity = uIntensity;
      vec2 uv = vUv;

      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.0);
        return;
      }

      float scanline = sin(uv.y * 1100.0) * 0.06 * intensity;
      float vignette = smoothstep(0.9, 0.4, distance(uv, vec2(0.5)));
      float noise = (random(vec2(uv.y * 240.0, uTime)) - 0.5) * 0.05 * intensity;

      float glitchLine = step(0.995, random(vec2(floor(uv.y * 120.0), uTime)));
      float glitchShift = (random(vec2(uTime * 2.0, uv.y)) - 0.5) * 0.03 * intensity;
      glitchShift *= glitchLine;
      vec2 glitchUv = vec2(clamp(uv.x + glitchShift, 0.0, 1.0), uv.y);

      vec3 color = texture2D(uTexture, glitchUv).rgb;
      color += scanline;
      color += noise;

      float mask = sin(uv.x * 800.0) * 0.03 * intensity;
      color.r += mask;
      color.g -= mask * 0.5;
      color.b += mask * 0.2;

      color *= vignette;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  figures.forEach((figure) => {
    const img = figure.querySelector<HTMLImageElement>("img");
    if (!img || !img.src) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    figure.appendChild(renderer.domElement);
    figure.classList.add("has-glitch");

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      uTexture: { value: null as THREE.Texture | null },
      uTime: { value: 0 },
      uIntensity: { value: prefersReduced ? 0 : 0.85 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(img.src, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      uniforms.uTexture.value = texture;
      updateSize();
    });

    const updateSize = () => {
      const width = figure.clientWidth;
      const height = figure.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      if (!uniforms.uTexture.value) return;
      const image = uniforms.uTexture.value.image as HTMLImageElement;
      const imageAspect = image.naturalWidth / image.naturalHeight;
      const containerAspect = width / height;
      const scaleX = containerAspect > imageAspect ? containerAspect / imageAspect : 1;
      const scaleY = containerAspect > imageAspect ? 1 : imageAspect / containerAspect;
      mesh.scale.set(scaleX, scaleY, 1);
    };

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(figure);

    const clock = new THREE.Clock();
    let isVisible = false;
    let targetIntensity = 0;
    const baseIntensity = prefersReduced ? 0 : 0.85;
    let rafId: number | null = null;

    const animate = () => {
      uniforms.uTime.value = clock.getElapsedTime();
      targetIntensity = isVisible ? baseIntensity : 0;
      uniforms.uIntensity.value = THREE.MathUtils.lerp(
        uniforms.uIntensity.value,
        targetIntensity,
        0.08
      );
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    const stop = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      uniforms.uIntensity.value = 0;
    };

    const start = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(animate);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          start();
        } else {
          stop();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(figure);
  });
}
