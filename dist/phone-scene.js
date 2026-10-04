import * as THREE from '/vendor/three/build/three.module.min.js';
import {OrbitControls} from '/vendor/three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from '/vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {MeshoptDecoder} from '/vendor/meshoptimizer/meshopt_decoder.js';

export async function createPhoneScene(stage,model,onLost){
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
 const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',model.name+' interactive 3D. Drag or use arrow keys to rotate. Plus and minus zoom.');stage.append(canvas);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.01,1000),controls=new OrbitControls(camera,canvas);
 controls.enableDamping=false;controls.enablePan=false;controls.enableZoom=true;
 scene.add(new THREE.HemisphereLight(0xffffff,0x748398,3));const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(3,4,5);scene.add(key);
 const studio=new THREE.Scene();studio.background=new THREE.Color(0xaaaaaa);
 for(const p of [[-3,2,0],[2,3,1],[0,1,-3]]){const panel=new THREE.Mesh(new THREE.PlaneGeometry(3,3),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));panel.position.set(...p);panel.lookAt(0,0,0);studio.add(panel)}
 const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(studio,.08,.1,20,{size:128});scene.environment=environment.texture;pmrem.dispose();studio.traverse(n=>{n.geometry?.dispose();n.material?.dispose()});
 let root,observer,disposed=false;
 const dispose=()=>{if(disposed)return;disposed=true;observer?.disconnect();controls.dispose();canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('keydown',keyboard);const textures=new Set();scene.traverse(n=>{n.geometry?.dispose();for(const mat of Array.isArray(n.material)?n.material:n.material?[n.material]:[]){for(const v of Object.values(mat))if(v?.isTexture)textures.add(v);mat.dispose()}});textures.forEach(t=>t.dispose());environment.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove()};
 const lost=e=>{e.preventDefault();onLost()};
 const draw=()=>{if(!disposed&&stage.isConnected&&stage.clientWidth)renderer.render(scene,camera)};
 let center,size,max,angle='reset';
 const pose=(view='reset')=>{
  angle=view;const direction=new THREE.Vector3(...({front:[0,0,1],back:[0,0,-1],side:[1,0,0],reset:[.55,.15,1]}[view]||[0,0,1])).normalize();
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),direction),right=new THREE.Vector3(1,0,0).applyQuaternion(q),up=new THREE.Vector3(0,1,0).applyQuaternion(q),tan=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));let distance=0;
  for(const x of [-.5,.5])for(const y of [-.5,.5])for(const z of [-.5,.5]){const corner=new THREE.Vector3(size.x*x,size.y*y,size.z*z);distance=Math.max(distance,corner.dot(direction)+Math.max(Math.abs(corner.dot(up))/tan,Math.abs(corner.dot(right))/(tan*camera.aspect))*1.22)}
  camera.position.copy(center).addScaledVector(direction,distance);controls.target.copy(center);controls.update();draw();canvas.dataset.angle=view;
 };
 const keyboard=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','='].includes(e.key)){e.preventDefault();const offset=camera.position.clone().sub(controls.target),s=new THREE.Spherical().setFromVector3(offset);if(e.key==='ArrowLeft')s.theta-=.2;if(e.key==='ArrowRight')s.theta+=.2;if(e.key==='ArrowUp')s.phi-=.15;if(e.key==='ArrowDown')s.phi+=.15;if(['+','='].includes(e.key))s.radius*=.9;if(e.key==='-')s.radius*=1.1;s.makeSafe();s.radius=THREE.MathUtils.clamp(s.radius,controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(s));controls.update();draw()}};
 try{
  const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('/assets/models/'+model.asset);root=gltf.scene;root.rotation.set(...model.rotation);scene.add(root);
  const bounds=new THREE.Box3().setFromObject(root);if(bounds.isEmpty())throw Error('Empty phone geometry');center=bounds.getCenter(new THREE.Vector3());size=bounds.getSize(new THREE.Vector3());max=Math.max(size.x,size.y,size.z);
  camera.near=max/1000;camera.far=max*50;controls.minDistance=max*.7;controls.maxDistance=max*6;
  const resize=()=>{if(!stage.clientWidth||!stage.clientHeight)return;renderer.setSize(stage.clientWidth,stage.clientHeight,false);camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();pose(angle)};
  controls.addEventListener('change',draw);canvas.addEventListener('keydown',keyboard);canvas.addEventListener('webglcontextlost',lost);observer=new ResizeObserver(resize);observer.observe(stage);resize();canvas.dataset.model=model.asset;
  return {pose,dispose};
 }catch(e){dispose();throw e}
}
