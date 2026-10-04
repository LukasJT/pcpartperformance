// Regression check: every visible bounding corner stays inside the camera frustum.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
(async()=>{
 const T=await import(pathToFileURL(path.resolve('dist/vendor/three/build/three.module.min.js')).href);
 const source=fs.readFileSync('dist/build-scene.js','utf8');
 const pose=source.slice(source.indexOf(" function pose(view='angled')"),source.indexOf('\n function apply()'));
 let tested=0;
 for(const aspect of [342/330,640/470,.45,2.8])for(const size of [[.12,.086,.12],[.14,.087,.14],[.693,.454,.465],[.04,.04,.006],[.3576,.0701,.1493]])for(const view of ['angled','front','side']){
  const root=new T.Group(),mesh=new T.Mesh(new T.BoxGeometry(...size),new T.MeshBasicMaterial());root.add(mesh);root.position.set(.15,.3,-.08);
  const camera=new T.PerspectiveCamera(38,aspect,.01,20),target=new T.Vector3();
  const ctx={T,root,camera,currentView:null,controls:{target,update(){camera.lookAt(target);camera.updateMatrixWorld(true)}},canvas:{dataset:{}},invalidate(){}};
  vm.createContext(ctx);vm.runInContext(pose+'\npose('+JSON.stringify(view)+')',ctx);
  const box=new T.Box3().setFromObject(root);
  for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
   const projected=new T.Vector3(x,y,z).project(camera);
   assert.ok(Math.abs(projected.x)<.85&&Math.abs(projected.y)<.85&&projected.z>-1&&projected.z<1,'Clipped corner: '+JSON.stringify({aspect,size,view,projected}));
  }
  mesh.geometry.dispose();mesh.material.dispose();tested++;
 }
 console.log(tested+' projected camera/part configurations passed with padding.');
})().catch(e=>{console.error(e);process.exitCode=1});
