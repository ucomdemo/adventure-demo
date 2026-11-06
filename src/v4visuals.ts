import * as THREE from 'three';
export type PetId = 'fire';
export type PetModel = { root: THREE.Group; body: THREE.Group; head: THREE.Group; left: THREE.Group; right: THREE.Group; extra: THREE.Group; eyes: THREE.Mesh[] };
const material = (color: THREE.ColorRepresentation) => new THREE.MeshStandardMaterial({ color, roughness: .84 });
function shape(parent: THREE.Object3D, geometry: THREE.BufferGeometry, color: THREE.ColorRepresentation, pos: [number,number,number], scale: [number,number,number] = [1,1,1]): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material(color)); mesh.position.set(...pos); mesh.scale.set(...scale); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
const ball = (parent: THREE.Object3D, color: THREE.ColorRepresentation, x: number, y: number, z: number, sx: number, sy = sx, sz = sx) => shape(parent, new THREE.SphereGeometry(1, 16, 12), color, [x,y,z], [sx,sy,sz]);
const box = (parent: THREE.Object3D, color: THREE.ColorRepresentation, x: number, y: number, z: number, sx: number, sy: number, sz: number) => shape(parent, new THREE.BoxGeometry(sx,sy,sz), color, [x,y,z]);
const cone = (parent: THREE.Object3D, color: THREE.ColorRepresentation, x: number, y: number, z: number, radius: number, height: number) => shape(parent, new THREE.ConeGeometry(radius,height,7), color, [x,y,z]);
const cylinder = (parent: THREE.Object3D, color: THREE.ColorRepresentation, x: number, y: number, z: number, top: number, bottom: number, height: number, sides = 12) => shape(parent, new THREE.CylinderGeometry(top,bottom,height,sides), color, [x,y,z]);
function eyes(parent: THREE.Group, y: number, z: number, width: number, color = '#263c37') {
  for (const side of [-1,1]) { for(const eye of [ball(parent, '#fffdf4', side*width,y,z,.13,.15,.075),ball(parent,color,side*width,y,z+.065,.066,.09,.035),ball(parent,'#ffffff',side*width-.018,y+.035,z+.096,.025)]) { eye.name='eye'; eye.userData.openY=eye.scale.y; } }
}
export function createFireModel(): PetModel {
  const root=new THREE.Group(),body=new THREE.Group(),head=new THREE.Group(),left=new THREE.Group(),right=new THREE.Group(),extra=new THREE.Group();
  root.name='fire';root.add(body,left,right);body.add(head,extra);
  left.position.set(-.25,.25,0);right.position.set(.25,.25,0);head.position.set(0,1.08,0);
  const main='#ef8b54';
  ball(body,main,0,.72,0,.53,.62,.40);ball(body,'#ffd773',0,.66,.34,.34,.39,.09);
  ball(left,main,0,-.11,.08,.18,.14,.24);ball(right,main,0,-.11,.08,.18,.14,.24);
  ball(head,main,0,-.03,0,.43,.37,.35);eyes(head,.06,.30,.18);
  cone(extra,'#ef7049',0,1.48,0,.30,.52);cone(extra,'#ffc65f',-.12,1.48,.13,.15,.32);cone(extra,'#f7aa50',.18,1.38,-.05,.18,.38);
  ball(body,main,-.47,.65,0,.15,.22,.13);ball(body,main,.47,.65,0,.15,.22,.13);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.57,.62,32),new THREE.MeshBasicMaterial({color:'#4d8b6d',side:THREE.DoubleSide,transparent:true,opacity:.65}));
  ring.rotation.x=-Math.PI/2;ring.position.y=.025;root.add(ring);
  const eyeParts:THREE.Mesh[]=[];head.traverse(o=>{if(o instanceof THREE.Mesh&&o.name==='eye')eyeParts.push(o);});
  return {root,body,head,left,right,extra,eyes:eyeParts};
}
export function createBossModel(index: number): { group: THREE.Group; body: THREE.Group; shields: THREE.Mesh[] } {
  if (!Number.isInteger(index) || index < 0 || index > 2) throw new Error('Boss index must be 0..2');
  const group = new THREE.Group(), body = new THREE.Group(); group.name = `boss-${index}`; body.name = 'body'; group.add(body);
  const color = ['#e89780','#78a586','#b69b6e'][index];
  if (index === 0) {
    ball(body,color,0,1.17,0,.8,.82,.65);
    for(let i=0;i<4;i++) ball(body,color,(i-1.5)*.47,.44,.05,.25,.32,.35);
    cylinder(body,'#405e58',0,2.00,0,.46,.55,.18); cylinder(body,'#405e58',0,2.20,0,.30,.36,.30); ball(body,'#f5d477',0,2.17,.30,.08);
    cylinder(body,'#ddbe72',.70,1.0,.38,.20,.20,.12).rotation.x=Math.PI/2;
  } else if(index===1) {
    box(body,color,0,1.25,0,1.35,1.65,.65); box(body,'#f4e7c8',0,1.25,.35,1.10,1.44,.08);
    for(const side of [-1,1]) { ball(body,color,side*.83,1.05,0,.18,.42,.18).rotation.z=side*-.4; ball(body,'#e8dabe',side*.40,.27,0,.25,.18,.23); }
    box(body,'#d9cbb2',0,.82,.43,.70,.13,.06);
  } else if(index===2) {
    cylinder(body,color,0,1.2,0,.53,.72,1.7,8); ball(body,'#95af77',0,2.06,0,.68,.38,.48);
    for(const side of [-1,1]) { cylinder(body,'#ad9369',side*.75,1.3,0,.12,.14,.8,7).rotation.z=side*-.9; box(body,'#6b7054',side*.18,.75,.58,.23,.22,.08); }

  }
  const face = new THREE.Group(); face.position.set(0,index===1?1.32:1.45,index===1?.40:.58); body.add(face); eyes(face,0,0,.22);
  // Distinct silhouettes and readable accessories.
  if(index === 0) {
    const hand = box(body,'#fff9e7',.70,1.0,.46,.035,.23,.025); hand.rotation.z=-.5;
  } else if(index === 1) {
    for(let i=0;i<5;i++) box(body,'#e5d7b9',0,.76+i*.07,.405,1.03,.012,.015);
    for(let i=0;i<3;i++) cone(body,'#f4e7c8',(i-1)*.18,.73,.47,.12,.30).rotation.z=Math.PI;
  } else if(index === 2) {
    for(const side of [-1,1]) ball(body,'#6f955e',side*.24,1.66,.64,.23,.065,.05).rotation.z=side*-.18;
    box(body,'#795f42',0,.85,.66,.70,.65,.12);
    for(let i=0;i<4;i++) box(body,['#e8c889','#87a894','#cda38a','#aca3c1'][i],(i-1.5)*.14,.87,.75,.10,.43,.08);

  }
  body.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(body);
  const scale=2.65/(bounds.max.y-bounds.min.y);
  body.scale.setScalar(scale); body.position.y=-bounds.min.y*scale;
  const shieldMeshes: THREE.Mesh[]=[];
  for(let i=0;i<2;i++) { const s=ball(group,'#f1cc79',(i-.5)*.40,3.05,0,.14); shieldMeshes.push(s); }
  return { group, body, shields:shieldMeshes };
}


export type VisualData = {
  routes: ReadonlyArray<ReadonlyArray<readonly [number, number]>>;
  stages: ReadonlyArray<{ accent: string; boss: { position: readonly [number, number] } }>;
};
export function createVisualWorld(data: VisualData) {
  const root = new THREE.Group(); root.name = 'island';
  const paths = data.routes.map(points => new THREE.CatmullRomCurve3(
    points.map(([x,z]) => new THREE.Vector3(x,0.06,z)), false, 'centripetal'));
  const samples = paths.flatMap(p => p.getSpacedPoints(90));
  const clear = (x: number,z: number,r: number) =>
    Math.hypot(x,z)<8.9-r && samples.every(p=>Math.hypot(p.x-x,p.z-z)>0.675+r+0.20);
  cylinder(root,'#9eae8b',0,-1.15,0,9.5,9.1,1.8,12);
  cylinder(root,'#e4d5b0',0,-.25,0,9.4,9.5,.30,12);
  cylinder(root,'#d5e3a6',0,-.10,0,9.05,9.4,.20,12);
  // Flat ribbon: not a tube, torus, raised cylinder or inflated pipe.
  for (const [pathIndex,path] of paths.entries()) {
    const positions:number[]=[],indices:number[]=[];
    const count=100, half=.675;
    for(let i=0;i<=count;i++) {
      const p=path.getPointAt(i/count),t=path.getTangentAt(i/count);
      const side=new THREE.Vector3(-t.z,0,t.x).normalize().multiplyScalar(half);
      positions.push(p.x+side.x,.045,p.z+side.z,p.x-side.x,.045,p.z-side.z);
      if(i<count){ const a=i*2; indices.push(a,a+2,a+1,a+1,a+2,a+3); }
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geo.setIndex(indices); geo.computeVertexNormals();
    const road=shape(root,geo,'#f5ebcd',[0,0,0]); road.name='road-'+pathIndex; road.castShadow=false;
  }
  const trees:[number,number][]=[[-8,1],[-7,-4],[-4,-6],[0,-6],[4,-5],[7,-3],[8,3],[6,6],[2,7],[-3,7],[-7,6],[-2,1]];
  for(const [i,[x,z]] of trees.entries()) {
    if(!clear(x,z,.65))continue;
    cylinder(root,'#a89067',x,.42,z,.12,.17,.84,6);
    cone(root,i%2?'#a4c58a':'#b3cc91',x,1.25,z,.7,1.35);
    cone(root,'#c1d69c',x,1.85,z,.48,1.0);
  }
  box(root,'#b99370',-6,.02,5.5,2.2,.10,2.0);
  for(const [x,z] of [[-2,4],[4,4.5]]) {
    box(root,'#b99a77',x,.40,z,1.2,.12,.34);box(root,'#b99a77',x,.72,z-.12,1.2,.40,.10);
    for(const side of [-1,1])box(root,'#927d61',x+side*.43,.2,z,.09,.4,.22);
  }
  for(const [x,z] of [[-3,2],[1,-3],[6,3]]) {
    cylinder(root,'#8d9c7c',x,.6,z,.06,.08,1.2,8);ball(root,'#ffedb2',x,1.28,z,.16);
  }
  const lamps:THREE.Mesh[]=[];
  const towers:THREE.Group[]=[];
  for(const [i,stage] of data.stages.entries()) {
    const [bx,bz]=stage.boss.position;
    const preferred=1.8;
    const candidates=[[preferred,-1],[-preferred,-1],[0,-2.3],[2.3,0],[-2.3,0]];
    const offset=candidates.find(([dx,dz])=>clear(bx+dx,bz+dz,.60))??candidates[0];
    const tower=new THREE.Group();tower.name='lighthouse-'+i;tower.position.set(bx+offset[0],0,bz+offset[1]);root.add(tower);
    cylinder(tower,'#fffaf0',0,.85,0,.38,.55,1.7);
    cylinder(tower,stage.accent,0,1.63,0,.43,.43,.18);
    const lamp=ball(tower,'#f4dc8e',0,1.98,0,.30);
    (lamp.material as THREE.MeshStandardMaterial).emissive.set('#302509');
    lamps.push(lamp);towers.push(tower);
    cone(tower,stage.accent,0,2.33,0,.45,.5);
    cylinder(tower,'#a99573',.55,1.9,0,.025,.025,1.1,6);
    box(tower,stage.accent,.72,2.29,0,.32,.22,.025);
    cylinder(root,'#eee3c1',bx,.018,bz,1.16,1.16,.03,24);
    if(i===1)for(let n=0;n<3;n++) {
      const paper=box(root,'#fff8e6',bx-.8+n*.5,.045,bz-.9,.36,.018,.26);paper.rotation.y=n*.4;
    }
  }
  cylinder(root,'#f2e4bd',0,.03,3.6,1.6,1.6,.06,24);
  const boat=new THREE.Group();boat.name='sailboat';boat.position.set(9,0,6);root.add(boat);
  ball(boat,'#b78e69',0,.18,0,1,.23,.42);cylinder(boat,'#aa8969',0,.85,0,.045,.06,1.4,8);
  const sail=new THREE.Shape();sail.moveTo(0,0);sail.lineTo(0,1.2);sail.lineTo(.8,.1);sail.closePath();
  const cloth=shape(boat,new THREE.ShapeGeometry(sail),'#fff7df',[.04,.35,0]);
  (cloth.material as THREE.MeshStandardMaterial).side=THREE.DoubleSide;
  for(const [x,z,s] of [[-9,3,.7],[8,-5,.6],[3,9,.5]])ball(root,'#9eae9b',x,-.35,z,s,.35,s*.7);
  return { root, paths, lamps, towers };
}
export function addVisualLights(scene:THREE.Scene) {
  const ambient=new THREE.HemisphereLight('#ffffff','#a2bfa0',2.0);
  const sun=new THREE.DirectionalLight('#fff4d5',2.0);
  sun.position.set(-8,22,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:.5,far:60});
  sun.shadow.normalBias=.03;scene.add(ambient,sun);
  return {ambient,sun};
}
// Call on stage arrival and viewport resize, not during every animation frame.
// For conversation, pass hero.root and the current boss.group.
// For overview, pass world.root and all bosses. Interpolate externally unless reduced motion is enabled.
export function frameVisualObjects(camera:THREE.OrthographicCamera, objects:THREE.Object3D[], width:number,height:number) {
  const bounds=new THREE.Box3();
  for(const object of objects){object.updateWorldMatrix(true,true);bounds.expandByObject(object);}
  const center=bounds.getCenter(new THREE.Vector3());
  const aspect=Math.max(width,1)/Math.max(height,1);
  camera.left=-12*aspect;camera.right=12*aspect;camera.top=12;camera.bottom=-12;
  camera.zoom=1;camera.near=.1;camera.far=100;
  const viewOffset=new THREE.Vector3(18,24,23);
  if(objects.length===2){
    const hero=objects[0].getWorldPosition(new THREE.Vector3());
    const boss=objects[1].getWorldPosition(new THREE.Vector3());
    viewOffset.subVectors(hero,boss);viewOffset.y=0;
    if(viewOffset.lengthSq()<.001)viewOffset.set(0,0,1);
    viewOffset.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),.55).multiplyScalar(29);
    viewOffset.y=24;
  }
  camera.position.copy(center).add(viewOffset);camera.lookAt(center);
  camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
  let extentX=.001,extentY=.001;
  for(const object of objects){
    const p=measureVisualPixels(object,camera,width,height);
    extentX=Math.max(extentX,Math.abs(p.x/width*2-1),Math.abs((p.x+p.width)/width*2-1));
    extentY=Math.max(extentY,Math.abs(p.y/height*2-1),Math.abs((p.y+p.height)/height*2-1));
  }
  camera.zoom=THREE.MathUtils.clamp(Math.min(.82/extentX,.74/extentY),.35,6);
  camera.updateProjectionMatrix();
  return center;
}
export function measureVisualPixels(object:THREE.Object3D,camera:THREE.Camera,width:number,height:number) {
  object.updateWorldMatrix(true,true);camera.updateMatrixWorld(true);
  let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;
  object.traverseVisible(node=>{
    if(!(node instanceof THREE.Mesh))return;
    node.geometry.computeBoundingBox();const bounds=node.geometry.boundingBox;
    if(!bounds)return;
    for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
      const p=new THREE.Vector3(x,y,z).applyMatrix4(node.matrixWorld).project(camera);
      const px=(p.x*.5+.5)*width,py=(-p.y*.5+.5)*height;
      x0=Math.min(x0,px);x1=Math.max(x1,px);y0=Math.min(y0,py);y1=Math.max(y1,py);
    }
  });
  return {x:x0,y:y0,width:x1-x0,height:y1-y0};
}