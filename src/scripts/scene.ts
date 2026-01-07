import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { lenis } from "./lenis";

const container = document.getElementById("scene");

const isMesh = (obj: THREE.Object3D): obj is THREE.Mesh =>
  (obj as THREE.Mesh).isMesh;

if (container) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 7);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.35);
  keyLight.position.set(4, 6, 8);
  scene.add(ambientLight, keyLight);

  const loader = new GLTFLoader();
  const modelGroup = new THREE.Group();
  scene.add(modelGroup);

  const borderGroup = new THREE.Group();
  const zGroup = new THREE.Group();
  modelGroup.add(borderGroup, zGroup);

  const loadModel = (
    path: string,
    target: THREE.Group,
    scaleTarget = 2.6,
    { polygonOffset = false }: { polygonOffset?: boolean } = {}
  ) => {
    loader.load(
      path,
      (gltf) => {
        const model = gltf.scene;
        target.add(model);

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        const maxAxis = Math.max(size.x, size.y, size.z);
        const scale = scaleTarget / maxAxis;
        model.scale.setScalar(scale);
        target.position.set(0, 0, 0);

        if (polygonOffset) {
          model.traverse((child) => {
            if (isMesh(child)) {
              const material = child.material;
              const applyOffset = (mat: THREE.Material) => {
                mat.polygonOffset = true;
                mat.polygonOffsetFactor = -1;
                mat.polygonOffsetUnits = -1;
              };

              if (Array.isArray(material)) {
                material.forEach(applyOffset);
              } else if (material) {
                applyOffset(material);
              }
              child.renderOrder = 1;
            }
          });
        }
      },
      undefined,
      (error) => {
        console.error(`Failed to load GLB model: ${path}`, error);
      }
    );
  };

  loadModel("/3d-logo/border.glb", borderGroup, 3.6, { polygonOffset: true });
  loadModel("/3d-logo/z3.glb", zGroup, 2.3);

  let scrollProgress = 0;
  let pointerX = 0;
  let pointerY = 0;
  let lastPointerX = window.innerWidth / 2;
  let lastPointerY = window.innerHeight / 2;
  let pointerRaf: number | null = null;

  lenis.on("scroll", ({ progress }) => {
    scrollProgress = progress;
  });

  const handlePointer = (event: PointerEvent) => {
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    if (pointerRaf !== null) {
      return;
    }
    pointerRaf = window.requestAnimationFrame(() => {
      const x = lastPointerX / window.innerWidth;
      const y = lastPointerY / window.innerHeight;
      pointerX = (x - 0.5) * 2;
      pointerY = (y - 0.5) * 2;
      pointerRaf = null;
    });
  };

  window.addEventListener("pointermove", handlePointer, { passive: true });

  const cameraPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.0, 0.5, 7.5),
    new THREE.Vector3(7.2, 0.7, 6.4),
    new THREE.Vector3(5.2, 0.5, 6.0),
    new THREE.Vector3(-1.0, 0.1, 5.3),
    new THREE.Vector3(0.0, -2.0, 4),
  ]);

  const buildTargetPath = (isMobile: boolean) =>
    new THREE.CatmullRomCurve3(
      isMobile
        ? [
            new THREE.Vector3(0.0, 0.0, -1.0),
            new THREE.Vector3(1.0, 0.2, -3.0),
            new THREE.Vector3(2.0, 0.1, 0.0),
            new THREE.Vector3(0.2, 0.2, 0.0),
            new THREE.Vector3(0.0, -0.7, -3.0),
          ]
        : [
            new THREE.Vector3(-3.0, 0.4, -1.0),
            new THREE.Vector3(4.0, 0.2, -3.0),
            new THREE.Vector3(6.0, 0.1, 0.0),
            new THREE.Vector3(0.2, 0.2, 0.0),
            new THREE.Vector3(0.0, -1.4, -3.0),
          ]
    );

  let isMobileTarget = window.innerWidth <= 690;
  let targetPath = buildTargetPath(isMobileTarget);

  const clock = new THREE.Clock();

  const handleResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const nextIsMobile = width <= 690;
    if (nextIsMobile !== isMobileTarget) {
      isMobileTarget = nextIsMobile;
      targetPath = buildTargetPath(isMobileTarget);
    }
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  window.addEventListener("resize", handleResize);

  const animate = () => {
    const t = THREE.MathUtils.clamp(scrollProgress, 0, 1);
    const float = Math.sin(clock.getElapsedTime() * 0.6) * 0.05;

    const camPos = cameraPath.getPointAt(t);
    const camTarget = targetPath.getPointAt(t);
    camera.position.copy(camPos);
    camera.lookAt(camTarget);

    const wiggleX = pointerY * 0.12;
    const wiggleY = pointerX * 0.2;
    modelGroup.rotation.y = t * Math.PI * 2 + wiggleY;
    modelGroup.rotation.x = t * Math.PI * 0.35 + wiggleX;
    modelGroup.position.y = THREE.MathUtils.lerp(0, 0, t) + float;
    borderGroup.rotation.x = t * Math.PI * 2;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();
}
