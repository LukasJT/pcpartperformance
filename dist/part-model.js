import * as THREE from '/vendor/three/build/three.module.min.js';
import {OrbitControls} from '/vendor/three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from '/vendor/three/examples/jsm/loaders/GLTFLoader.js';

for (const button of document.querySelectorAll('.part-model-open')) {
  button.addEventListener('click', async () => {
    const stage = button.closest('.part-model').querySelector('.part-model-stage');
    button.disabled = true;
    button.textContent = 'Loading 3D view…';
    stage.hidden = false;
    stage.replaceChildren();
    try {
      const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, powerPreference: 'low-power'});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.domElement.setAttribute('role', 'img');
      renderer.domElement.setAttribute('aria-label', 'Interactive 3D product. Drag to rotate; scroll or pinch to zoom.');
      stage.append(renderer.domElement);
      const scene = new THREE.Scene();
      scene.add(new THREE.HemisphereLight(0xffffff, 0x68778c, 3));
      const key = new THREE.DirectionalLight(0xffffff, 3);
      key.position.set(1, 2, 3);
      scene.add(key);
      const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 100);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = false;
      const gltf = await new GLTFLoader().loadAsync(button.dataset.model);
      scene.add(gltf.scene);
      const bounds = new THREE.Box3().setFromObject(gltf.scene);
      if (bounds.isEmpty()) throw new Error('Empty mesh');
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      const max = Math.max(size.x, size.y, size.z);
      controls.target.copy(center);
      camera.position.copy(center).add(new THREE.Vector3(1, .8, 1.35).normalize().multiplyScalar(max * 2.1));
      camera.near = Math.max(max / 1000, 0.001);
      camera.far = Math.max(max * 50, 10);
      camera.updateProjectionMatrix();
      controls.minDistance = max * .6;
      controls.maxDistance = max * 8;
      controls.update();
      const draw = () => renderer.render(scene, camera);
      const resize = () => {
        if (!stage.clientWidth) return;
        renderer.setSize(stage.clientWidth, stage.clientHeight, false);
        camera.aspect = stage.clientWidth / stage.clientHeight;
        camera.updateProjectionMatrix();
        draw();
      };
      controls.addEventListener('change', draw);
      new ResizeObserver(resize).observe(stage);
      resize();
      button.hidden = true;
    } catch (error) {
      stage.textContent = '3D view could not load. The product specifications remain available above.';
      button.disabled = false;
      button.textContent = 'Try 3D view again';
    }
  });
}
