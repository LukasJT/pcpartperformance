import * as T from './vendor/three/build/three.module.min.js';
import {OrbitControls} from './vendor/three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from './vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {MeshoptDecoder} from './vendor/meshoptimizer/meshopt_decoder.js';
import {clone as cloneWithSkeleton} from './vendor/three/examples/jsm/utils/SkeletonUtils.js';
import {createCameraMotion} from './evolution-scene-motion.js';
export function createBuildScene(host,onSelect){
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;host.append(renderer.domElement);
 const canvas=renderer.domElement;canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();host.dispatchEvent(new CustomEvent('scene-failed'))});canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Interactive PC layout. Drag to rotate, pinch or scroll to zoom. Arrow keys pan. Use the view buttons for keyboard rotation.');
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(38,1,.01,20),root=new T.Group();scene.add(root);
 // Metal surfaces need reflected light as well as direct lights to remain legible.
 // Build a small local studio environment only after the user opens the preview.
 const studio=new T.Scene();studio.background=new T.Color(0xaaaaaa);
 const studioGeometry=new T.PlaneGeometry(3,3),studioMaterial=new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide});
 for(const position of [[-3,2,0],[2,3,1],[0,1,-3]]){const panel=new T.Mesh(studioGeometry,studioMaterial);panel.position.set(...position);panel.lookAt(0,0,0);studio.add(panel);}
 const pmrem=new T.PMREMGenerator(renderer),environment=pmrem.fromScene(studio,.08,.1,20,{size:128});scene.environment=environment.texture;pmrem.dispose();studioGeometry.dispose();studioMaterial.dispose();
 scene.add(new T.HemisphereLight(0xffffff,0x647088,3));const key=new T.DirectionalLight(0xffffff,4);key.position.set(1,2,3);scene.add(key);const rim=new T.DirectionalLight(0xadc7ff,2);rim.position.set(-2,1,-1);scene.add(rim);
 const controls=new OrbitControls(camera,canvas);controls.enableDamping=false;controls.minDistance=.08;controls.maxDistance=4;controls.maxPolarAngle=Math.PI*.94;controls.target.set(0,0,0);controls.listenToKeyEvents(canvas);
 const cache=new Map(),parts=[];let currentView='angled';let disposed=false,visible=true,raf=0,revision=0,selected='',exploded=false,panel=false,draws=0,isolatedMode=false,orbit=false,lastFrame=0;
 const motionPreference=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
 const reduced=()=>motionPreference?.matches===true||document.documentElement?.dataset.motion==='reduced';
 function cameraData(){canvas.dataset.cameraDistance=camera.position.distanceTo(controls.target).toFixed(6);canvas.dataset.cameraPosition=camera.position.toArray().map(v=>v.toFixed(6)).join(',');canvas.dataset.cameraTarget=controls.target.toArray().map(v=>v.toFixed(6)).join(',');canvas.dataset.cameraAspect=String(camera.aspect);}
 const motion=createCameraMotion({read:()=>({position:camera.position.toArray(),target:controls.target.toArray()}),apply(value){camera.position.fromArray(value.position);controls.target.fromArray(value.target);controls.update();cameraData();},invalidate,reduced});
 function stopOrbit(reason='interaction'){const changed=orbit;orbit=false;controls.autoRotate=false;canvas.dataset.orbit='false';if(changed)host.dispatchEvent(new CustomEvent('scene-orbit-state',{detail:{active:false,reason}}));}
 function setOrbit(value){stopOrbit('changed');if(value===true&&parts.length&&!disposed&&visible&&!document.hidden&&!reduced()){motion.cancel();orbit=true;lastFrame=0;controls.autoRotate=true;controls.autoRotateSpeed=.55;canvas.dataset.orbit='true';invalidate();host.dispatchEvent(new CustomEvent('scene-orbit-state',{detail:{active:true}}));}return orbit;}
 function preferenceChanged(){if(reduced()){stopOrbit('reduced-motion');motion.finish();invalidate();}host.dispatchEvent(new CustomEvent('scene-preference-state'));}motionPreference?.addEventListener?.('change',preferenceChanged);globalThis.addEventListener?.('pcp:appearance',preferenceChanged);
 const layout={fan:[0,0,0],case:[0,0,0],board:[-.055,.025,-.075],cpu:[-.067,.085,-.06],ram:[0,.069,-.048],gpu:[-.035,-.045,0],ssd:[-.06,-.018,-.06],hdd:[.11,-.176,0],psu:[-.13,-.184,0]};
 function draw(time=performance.now()){raf=0;if(disposed||!visible||document.hidden)return;const moving=motion.step(time);if(orbit){controls.update(lastFrame?Math.min((time-lastFrame)/1000,.05):1/60);cameraData();}lastFrame=time;renderer.render(scene,camera);draws++;canvas.dataset.renderCount=String(draws);canvas.dataset.triangles=String(renderer.info.render.triangles);if(moving||orbit)invalidate();}
 function invalidate(){if(!raf&&!disposed&&visible&&!document.hidden)raf=requestAnimationFrame(draw)}
 function resize(){if(disposed||!host.clientWidth||!host.clientHeight)return;renderer.setSize(host.clientWidth,host.clientHeight,false);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();pose(currentView,{smooth:false});}
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)invalidate();else{stopOrbit('offscreen');motion.cancel();cancelAnimationFrame(raf);raf=0;}});observer.observe(host);
 function visibility(){if(!document.hidden)invalidate();else{stopOrbit('hidden');motion.cancel();cancelAnimationFrame(raf);raf=0;}}document.addEventListener('visibilitychange',visibility);controls.addEventListener('change',invalidate);controls.addEventListener('start',()=>{motion.cancel();stopOrbit();});
 // Fit every bounding-box corner in camera space, including depth toward the lens.
 // A world-axis maximum misses the projected height of tilted fans and tall cases.
 function pose(view='angled',{bounds:chosenBounds=null,smooth=true}={}){
  currentView=['front','side','angled'].includes(view)?view:'angled';view=currentView;stopOrbit('camera-change');
  const bounds=chosenBounds||new T.Box3().setFromObject(root),size=bounds.isEmpty()?new T.Vector3(.45,.45,.3):bounds.getSize(new T.Vector3()),center=bounds.isEmpty()?new T.Vector3():bounds.getCenter(new T.Vector3());
  const dir=new T.Vector3(...(view==='front'?[1,.05,0]:view==='side'?[0,.02,1]:[.75,.35,1])).normalize(),right=new T.Vector3().crossVectors(camera.up,dir).normalize(),up=new T.Vector3().crossVectors(dir,right).normalize();
  const vertical=Math.tan(camera.fov*Math.PI/360),horizontal=vertical*Math.max(camera.aspect,.1);
  let fit=.15;
  for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1]){
   const corner=new T.Vector3(x*size.x/2,y*size.y/2,z*size.z/2),depth=corner.dot(dir);
   fit=Math.max(fit,depth+Math.abs(corner.dot(right))/horizontal*1.2,depth+Math.abs(corner.dot(up))/vertical*1.2);
  }
  const position=center.clone().addScaledVector(dir,fit);canvas.dataset.boundsSize=size.toArray().map(v=>v.toFixed(6)).join(',');canvas.dataset.boundsCenter=center.toArray().map(v=>v.toFixed(6)).join(',');motion.move({position:position.toArray(),target:center.toArray()},{smooth});
 }
 function focusPart(slot){const matches=parts.filter(part=>part.userData.slot===slot);if(!matches.length){pose(currentView);return false;}const bounds=new T.Box3();for(const part of matches)bounds.union(new T.Box3().setFromObject(part));if(bounds.isEmpty()){pose(currentView);return false;}selected=slot;apply();pose(currentView,{bounds});return true;}
 function apply(){for(const obj of parts){obj.position.copy(obj.userData.base);if(exploded&&!isolatedMode&&obj.userData.slot!=='case'){const slot=obj.userData.slot;obj.position.z+=slot==='board'?.06:slot==='cpu'?.3:slot==='ram'?.24:slot==='gpu'?.3:.16;obj.position.x+=slot==='hdd'?.16:slot==='psu'?-.14:0;}obj.traverse(m=>{if(!m.isMesh)return;if(!isolatedMode&&(m.name==='Side_panel'||m.name==='Side panel'))m.visible=panel;for(const mat of (Array.isArray(m.material)?m.material:[m.material])){if(mat.emissive){if(!mat.userData.previewEmission){mat.userData.previewEmission=mat.emissive.clone();mat.userData.previewIntensity=mat.emissiveIntensity;}mat.emissive.copy(mat.userData.previewEmission);mat.emissiveIntensity=mat.userData.previewIntensity;if(!isolatedMode&&obj.userData.slot===selected){mat.emissive.lerp(new T.Color(0x193d76),.12);mat.emissiveIntensity=Math.max(mat.emissiveIntensity,.3);}}}});}invalidate()}
 const localModelPath=url=>typeof url==='string'&&/^\/assets\/models\/(?:completion\/)?[a-zA-Z0-9_.-]+\.glb$/.test(url);
 function releaseTemplate(object){object.traverse(mesh=>{if(mesh.isMesh){mesh.geometry.dispose();for(const material of(Array.isArray(mesh.material)?mesh.material:[mesh.material])){for(const value of Object.values(material))if(value?.isTexture)value.dispose();material.dispose();}}});}
 function boundTextures(object){const textures=new Set();object.traverse(mesh=>{if(mesh.isMesh)for(const material of(Array.isArray(mesh.material)?mesh.material:[mesh.material]))for(const value of Object.values(material))if(value?.isTexture)textures.add(value);});return textures.size;}
 async function load(record){
  const url=record.model;
  if(!cache.has(url)){
   // GLTFLoader otherwise resolves geometry with a null map after an embedded
   // image fails. Keep failures scoped to this model, not a global manager.
   const manager=new T.LoadingManager(),resourceFailures=[];manager.onError=failed=>resourceFailures.push(failed);
   const loader=new GLTFLoader(manager).setMeshoptDecoder(MeshoptDecoder);
   cache.set(url,loader.loadAsync(url).then(g=>{
    if(resourceFailures.length){releaseTemplate(g.scene);throw Error('One or more model image resources could not load.');}
    if(record.status!=='community')return g;
    const obj=g.scene,wrap=new T.Group();wrap.add(obj);const angle=record.attribution?.orientation||[0,0,0];obj.rotation.set(...angle);obj.updateMatrixWorld(true);
    const bounds=new T.Box3().setFromObject(wrap),size=bounds.getSize(new T.Vector3());
    if(Math.min(size.x,size.y,size.z)<=0||![size.x,size.y,size.z].every(Number.isFinite)){releaseTemplate(wrap);throw Error('Invalid model dimensions');}
    if(record.standaloneOnly||record.scaleMode==='uniform-autoframe')wrap.scale.setScalar(.32/Math.max(size.x,size.y,size.z));
    else{const want=record.dimensionsMm||[300,50,120];wrap.scale.set(want[0]/1000/size.x,want[1]/1000/size.y,want[2]/1000/size.z);}
    wrap.updateMatrixWorld(true);const center=new T.Box3().setFromObject(wrap).getCenter(new T.Vector3());obj.position.sub(center.clone().divide(wrap.scale));g.scene=wrap;return g;
   }).catch(error=>{cache.delete(url);throw error}));
  }
  return(await cache.get(url)).scene;
 }
 function clear(){for(const obj of parts){obj.traverse(m=>{if(m.isMesh)for(const mat of (Array.isArray(m.material)?m.material:[m.material]))mat.dispose()});root.remove(obj)}parts.length=0}
 async function update(entries,{references=false}={}){
  const rev=++revision,started=performance.now();isolatedMode=false;canvas.dataset.mode='build';delete canvas.dataset.modelId;canvas.setAttribute('aria-label','Interactive PC layout. Drag to rotate, pinch or scroll to zoom. Arrow keys pan. Use the view buttons for keyboard rotation.');
  // New catalog categories do not inherit the GPU layout or an assumed size.
  // A model also has to belong to this exact selected identity and category.
  const eligible=entry=>entry.record?.id===entry.id&&entry.record.category===entry.slot;
  const chassis=entries.find(entry=>entry.slot==='case'&&eligible(entry))?.record,caseSize=chassis?.dimensionsMm||[447,469,215],dual=chassis?.physical?.dual;
  const boardZ=dual?-caseSize[2]/2000+.101:-.075;
  const settled=await Promise.all(entries.map(async entry=>{
   if(!entry.record?.model)return null;
   if(!eligible(entry))return{e:entry,unplaced:'Model identity or category does not match the selected component.'};
   if(entry.record.standaloneOnly)return{e:entry,unplaced:'This source model opens individually; its installed position has not been reviewed.'};
   if(!Object.hasOwn(layout,entry.slot))return{e:entry,unplaced:'No 3D placement is defined for this component category.'};
   if(!localModelPath(entry.record.model))return{e:entry,unplaced:'Model asset path is not part of the local library.'};
   if(entry.slot==='fan'&&!entry.placement)return{e:entry,unplaced:'Fan mounting position is not available.'};
   try{return{e:entry,template:await load(entry.record)}}catch{return{e:entry,error:true}}
  }));
  if(disposed||rev!==revision)return{stale:true};
  clear();const failed=[],unplaced=[];
  for(const loaded of settled){
   if(!loaded)continue;
   if(loaded.unplaced){unplaced.push({id:loaded.e.id,name:loaded.e.name,reason:loaded.unplaced});continue;}
   if(loaded.error){failed.push(loaded.e.name);continue;}
   const {e,template}=loaded,count=e.slot==='ram'?Math.min(e.modules||1,8):1;
   for(let i=0;i<count;i++){
    const obj=cloneWithSkeleton(template);obj.traverse(mesh=>{if(mesh.isMesh)mesh.material=Array.isArray(mesh.material)?mesh.material.map(material=>material.clone()):mesh.material.clone()});
    const base=new T.Vector3(...layout[e.slot]);
    if(['board','cpu','ram','ssd'].includes(e.slot))base.z+=boardZ+.075;
    if(dual&&e.slot==='psu')base.set(-.08,-.08,-caseSize[2]/2000+.045);
    if(e.slot==='gpu'&&e.record.dimensionsMm)base.x=-caseSize[0]/2000+e.record.dimensionsMm[0]/2000+.012;
    if(e.slot==='fan'){
     const f=e.placement,n=f.ordinal||0,step=(e.record.physical?.size?.[0]||120)/1000,z=boardZ+.09;
     switch(f.position){case'top':base.set((n-1)*step,caseSize[1]/2000-.025,z);obj.rotation.x=-Math.PI/2;break;case'bottom':base.set((n-.5)*step,-caseSize[1]/2000+.025,z);obj.rotation.x=Math.PI/2;break;case'front':base.set(caseSize[0]/2000-.025,(n-.5)*step,z);obj.rotation.y=Math.PI/2;break;case'rear':base.set(-caseSize[0]/2000+.025,.08,z);obj.rotation.y=-Math.PI/2;break;default:base.set(.12,(n-.5)*step,boardZ+.012);}
     if((f.flow==='intake')!==!!e.record.physical?.reverse)obj.rotateY(Math.PI);
     const arrow=new T.ArrowHelper(new T.Vector3(0,0,(f.flow==='intake'?-1:1)*(((f.flow==='intake')!==!!e.record.physical?.reverse)?-1:1)),new T.Vector3(0,0,.02),.055,f.flow==='intake'?0x45bfa1:0xeea257,.013,.008);obj.add(arrow);
    }
    if(e.slot==='ram')base.x+=(e.index*count+i)*.02;
    if(e.slot==='ssd')base.y-=e.index*.032;
    if(e.slot==='gpu')base.y-=e.index*.08;
    if(e.slot==='hdd')base.y+=e.index*.027;
    if(e.slot==='cpu')base.x+=e.index*.08;
    obj.userData={slot:e.slot,base,id:e.id};root.add(obj);parts.push(obj);
   }
  }
  apply();pose(currentView,{smooth:false});canvas.dataset.modelCount=String(parts.length);canvas.dataset.boundTextureCount=String(boundTextures(root));canvas.dataset.loadMs=String(Math.round(performance.now()-started));
  return{failed,unplaced,rendered:parts.length,loadMs:Math.round(performance.now()-started)};
 }
 async function inspectPart(entry){
  const rev=++revision,started=performance.now();clear();isolatedMode=true;canvas.dataset.mode='part';canvas.dataset.modelCount='0';canvas.dataset.boundTextureCount='0';delete canvas.dataset.modelId;canvas.setAttribute('aria-label','Interactive 3D model of '+(entry?.name||'the selected product')+'. Drag to rotate or use the view controls. This appearance does not certify physical fit.');invalidate();
  const record=entry?.record;
  if(!record||record.id!==entry.id||record.category!==entry.slot||!localModelPath(record.model))return{failed:[],unplaced:[{id:entry?.id||'',reason:'Exact selected model or local file is unavailable.'}],rendered:0,loadMs:0};
  let template;
  try{template=await load(record);}catch{return disposed||rev!==revision?{stale:true}:{failed:[entry.name],unplaced:[],rendered:0,loadMs:Math.round(performance.now()-started)};}
  if(disposed||rev!==revision)return{stale:true};
  const obj=cloneWithSkeleton(template);obj.traverse(mesh=>{if(mesh.isMesh)mesh.material=Array.isArray(mesh.material)?mesh.material.map(material=>material.clone()):mesh.material.clone()});
  // Display units only: uniformly preserve authored proportions, including
  // captured bases/cables. Never stretch a scan to a made-up physical envelope.
  const box=new T.Box3().setFromObject(obj),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3()),largest=Math.max(size.x,size.y,size.z);
  if(!Number.isFinite(largest)||largest<=0){obj.traverse(mesh=>{if(mesh.isMesh)for(const material of(Array.isArray(mesh.material)?mesh.material:[mesh.material]))material.dispose()});return{failed:[entry.name],unplaced:[],rendered:0,loadMs:Math.round(performance.now()-started)};}
  const frame=new T.Group();frame.add(obj);obj.position.sub(center);frame.scale.setScalar(.32/largest);frame.userData={slot:entry.slot,id:entry.id,base:new T.Vector3()};root.add(frame);parts.push(frame);selected=entry.slot;
  canvas.dataset.modelId=entry.id;canvas.dataset.modelCount='1';canvas.dataset.boundTextureCount=String(boundTextures(frame));apply();pose(currentView,{smooth:false});
  return{failed:[],unplaced:[],rendered:1,isolated:true,loadMs:Math.round(performance.now()-started)};
 }
 const ray=new T.Raycaster(),pointer=new T.Vector2();let down=null;
 canvas.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});canvas.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(parts,true).find(h=>h.object.visible&&!['Side panel','Side_panel'].includes(h.object.name));if(hit){let obj=hit.object;while(obj&&!obj.userData.slot)obj=obj.parent;if(obj)onSelect(obj.userData.slot)}});
 pose();resize();
 return{update,inspect:inspectPart,select(slot){selected=slot;apply()},focus:focusPart,canFocus:slot=>parts.some(part=>part.userData.slot===slot),orbit:setOrbit,state:()=>({orbit,reducedMotion:reduced(),models:parts.length,view:currentView}),view:pose,explode(value){exploded=value;apply();pose(currentView)},sidePanel(value){panel=value;apply()},quality(value){renderer.setPixelRatio(value?1:Math.min(devicePixelRatio,1.5));canvas.dataset.quality=value?'lower-resolution':'balanced';resize()},zoom(delta){motion.cancel();stopOrbit();camera.position.sub(controls.target).multiplyScalar(delta).add(controls.target);controls.update();cameraData();invalidate()},rotate(direction){motion.cancel();stopOrbit();const delta=camera.position.clone().sub(controls.target).applyAxisAngle(new T.Vector3(0,1,0),direction*.25);camera.position.copy(controls.target).add(delta);controls.update();cameraData();invalidate()},dispose(){disposed=true;revision++;stopOrbit('closed');motion.cancel();cancelAnimationFrame(raf);resizeObserver.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',visibility);motionPreference?.removeEventListener?.('change',preferenceChanged);globalThis.removeEventListener?.('pcp:appearance',preferenceChanged);controls.dispose();clear();for(const promise of cache.values())promise.then(g=>g.scene.traverse(m=>{if(m.isMesh){m.geometry.dispose();for(const material of (Array.isArray(m.material)?m.material:[m.material])){for(const value of Object.values(material))if(value?.isTexture)value.dispose();material.dispose()}}})).catch(()=>{});cache.clear();environment.dispose();renderer.dispose();canvas.remove()}};
}
