// Remove the isolated floating port noted by the source creator before merging meshes.
const path=require('path');
const {NodeIO}=require(path.resolve(process.argv[2],'node_modules/@gltf-transform/core'));
(async()=>{const io=new NodeIO(),doc=await io.read(process.argv[3]);
const stray=doc.getRoot().listNodes().find(n=>n.getName()==='Plane.005_Brushed nickel_0');
if(!stray)throw Error('Expected isolated source port not found');
stray.dispose();await io.write(process.argv[4],doc);})();
