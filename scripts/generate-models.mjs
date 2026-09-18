import fs from 'node:fs';
import {createRequire} from 'node:module';
import * as THREE from '../dist/vendor/three/build/three.module.min.js';
const require=createRequire(import.meta.url),refs=require('./model-references.cjs');
// Small, texture-free glTF assets. Millimeter authoring is converted to meters.
function glb(parts){
 const json={asset:{version:'2.0',generator:'PC Part Performance simplified envelopes'},scene:0,scenes:[{nodes:[]}],nodes:[],meshes:[],materials:[],buffers:[{}],bufferViews:[],accessors:[]},chunks=[];let offset=0;
 function accessor(array,type,componentType,count,bounds){const bytes=Buffer.from(array.buffer,array.byteOffset,array.byteLength),pad=(4-bytes.length%4)%4;const view=json.bufferViews.push({buffer:0,byteOffset:offset,byteLength:bytes.length})-1;chunks.push(bytes,Buffer.alloc(pad));offset+=bytes.length+pad;return json.accessors.push({bufferView:view,componentType,count,type,...bounds})-1}
 for(const p of parts){const geo=p.cylinder?new THREE.CylinderGeometry(p.size[0]/2000,p.size[0]/2000,p.size[1]/1000,24):new THREE.BoxGeometry(...p.size.map(v=>v/1000));geo.computeBoundingBox();const pos=geo.attributes.position,norm=geo.attributes.normal;const color=new THREE.Color(p.color);const mat=json.materials.push({name:p.name,pbrMetallicRoughness:{baseColorFactor:[color.r,color.g,color.b,p.alpha??1],metallicFactor:p.metal??.15,roughnessFactor:.6},...(p.alpha?{alphaMode:'BLEND',doubleSided:true}:{})})-1;
 const mesh=json.meshes.push({primitives:[{attributes:{POSITION:accessor(pos.array,'VEC3',5126,pos.count,{min:geo.boundingBox.min.toArray(),max:geo.boundingBox.max.toArray()}),NORMAL:accessor(norm.array,'VEC3',5126,norm.count)},indices:accessor(geo.index.array,'SCALAR',geo.index.array instanceof Uint16Array?5123:5125,geo.index.count),material:mat}]})-1;
 const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(...(p.rotation||[0,0,0])));json.scenes[0].nodes.push(json.nodes.push({mesh,name:p.name,translation:(p.at||[0,0,0]).map(v=>v/1000),rotation:q.toArray()})-1);geo.dispose();}
 json.buffers[0].byteLength=offset;const txt=Buffer.from(JSON.stringify(json)),j=Buffer.concat([txt,Buffer.alloc((4-txt.length%4)%4,32)]),b=Buffer.concat(chunks),out=Buffer.alloc(28+j.length+b.length);out.writeUInt32LE(0x46546c67,0);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);out.writeUInt32LE(j.length,12);out.writeUInt32LE(0x4e4f534a,16);j.copy(out,20);out.writeUInt32LE(b.length,20+j.length);out.writeUInt32LE(0x004e4942,24+j.length);b.copy(out,28+j.length);return out;
}
for(const [id,r] of Object.entries(refs)){
 let p=[];const box=(name,size,at,color='#303b49',extra={})=>p.push({name,size,at,color,...extra});
 if(id.includes('case-')){const [d,h,w]=r.size;box('Base',[d,8,w],[0,-h/2+4,0]);box('Top',[d,8,w],[0,h/2-4,0]);box('Rear',[8,h,w],[-d/2+4,0,0]);box('Back panel',[d,h,3],[0,0,-w/2]);box('Motherboard tray',[330,330,2],[-45,30,-w/2+25]);for(const x of [-d/2+8,d/2-8])for(const z of [-w/2+8,w/2-8])box('Frame rail',[8,h,8],[x,0,z]);for(let z=-92;z<100;z+=18)box('Illustrative front slat',[10,h-20,8],[d/2-6,0,z],'#927154');box('Side panel',[d-18,h-16,2],[0,0,w/2-1],'#a2bdcf',{alpha:.12});}
 else if(id==='b650'){box('PCB',[r.size[0],r.size[1],1.6],[0,0,0],'#223d37');box('Socket envelope',[55,55,8],[-12,60,5],'#8d96a0');for(let i=0;i<4;i++)box('DIMM slot',[5,137,8],[45+i*10,44,5],'#3b434f');box('Primary PCIe slot',[90,7,8],[-40,-45,5]);box('I/O heatsink',[30,125,25],[-100,70,12]);box('VRM heatsink',[95,20,18],[-15,136,10]);box('Chipset heatsink',[45,45,12],[50,-92,7]);}
 else if(id==='rtx4080s'){box('Card envelope',r.size,[0,0,0],'#20262c');box('Upper frame',[304,5,137],[0,28,0],'#69717b',{metal:.65});box('Backplate',[304,3,137],[0,-29,0],'#606974');for(const x of [-97,97])p.push({name:'Illustrative fan recess',size:[91,6],at:[x,32,0],color:'#111820',cylinder:true});box('Bracket',[3,61,137],[-151,0,0],'#9aa6ac');}
 else if(id==='ddr5'){box('Heat spreader',r.size,[0,0,0],'#343b45');box('Contact edge',[2,126,4],[0,0,-17],'#ba9950');box('Top strip',[7,125,2],[0,0,18],'#717f91');}
 else if(id==='9800x3d'){box('Package',[40,40,1.2],[0,0,0],'#2d6658');box('Illustrative heat spreader',[33,33,3.8],[0,0,2.5],'#bcc3ca',{metal:.8});}
 else if(id==='990pro'){box('PCB',[80,22,1],[0,0,0],'#242a30');box('Label envelope',[64,19,1.3],[0,0,1.15],'#363a40');box('Edge connector',[4,20,1],[-38,0,0],'#c0a35b');}
 else if(id==='barracuda2'){box('Drive housing',r.size,[0,0,0],'#323b43');box('Metal cover',[145,2,100],[0,9,0],'#a8b0b6',{metal:.7});}
 else {box('Power supply enclosure',r.size,[0,0,0],'#2a323d');p.push({name:'Fan grille envelope',size:[135,2],at:[0,44,0],color:'#151c24',cylinder:true});}
 fs.writeFileSync('dist/assets/models/'+r.model+'.glb',glb(p));console.log(r.model,p.length,'meshes');
}
