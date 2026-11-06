import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createVisualWorld, createFireModel, createBossModel, addVisualLights, frameVisualObjects } from './v4visuals';
import data from './content.json';

export function createScene(host: HTMLElement, onFailure: () => void) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#d4f3e5'); addVisualLights(scene);
  const camera = new THREE.OrthographicCamera(-12,12,12,-12,.1,100);
  const renderer = new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,1.6)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFShadowMap; host.appendChild(renderer.domElement);
  renderer.domElement.addEventListener('webglcontextlost', e=>{e.preventDefault();onFailure()});
  const controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.maxPolarAngle=Math.PI/2-.08; controls.minZoom=.35; controls.maxZoom=8;
  let follow=true; controls.addEventListener('start',()=>follow=false);
  const world=createVisualWorld(data as any); scene.add(world.root);
  const fire=createFireModel(); fire.root.position.set(-6,.06,5); scene.add(fire.root);
  const bosses=data.stages.map((s,i)=>{const b=createBossModel(i); b.group.position.set(s.boss.position[0],0,s.boss.position[1]); b.group.rotation.y=Math.atan2(s.dialoguePoint[0]-s.boss.position[0],s.dialoguePoint[1]-s.boss.position[1]); scene.add(b.group);return b;});
  let w=1,h=1; let lastPosition=fire.root.position.clone();
  const frame=(overview=false, stage=0)=>{const center=frameVisualObjects(camera,overview?[world.root,...bosses.map(b=>b.group)]:[fire.root,bosses[stage].group],w,h);controls.target.copy(center);controls.update();lastPosition.copy(fire.root.position)};
  const resize=()=>{w=Math.max(host.clientWidth,1);h=Math.max(host.clientHeight,1);renderer.setSize(w,h);frame(true)}; new ResizeObserver(resize).observe(host); resize();
  return {
    paths:world.paths, fire,
    update(s:any, time:number, travelProgress:number){
      const reduced=s?.preferences?.reducedMotion;
      if(s?.phase==='travel'){
        const path=world.paths[s.route], p=path.getPointAt(travelProgress), t=path.getTangentAt(travelProgress);fire.root.position.copy(p); fire.root.rotation.y=Math.atan2(t.x,t.z);
        const swing=Math.sin(travelProgress*path.getLength()*6);fire.left.rotation.x=swing*(reduced?.22:.38);fire.right.rotation.x=-fire.left.rotation.x;fire.body.position.y=Math.abs(swing)*(reduced?.015:.04);
        if(follow){const diff=fire.root.position.clone().sub(lastPosition);camera.position.add(diff);controls.target.add(diff)} lastPosition.copy(fire.root.position);
      } else {fire.left.rotation.x=0;fire.right.rotation.x=0;fire.body.position.y=Math.sin(time*2.6)*.015;}
      bosses.forEach((b,i)=>{const resolved=s?data.questions.filter(q=>q.stage===i&&s.progress[q.id].resolved).length:0;b.shields.forEach((x,j)=>x.visible=j<2-resolved);(world.lamps[i].material as THREE.MeshStandardMaterial).emissive.set(s?.clearedStages.includes(i)?'#d59626':'#302509');b.body.rotation.z=s?.phase==='greet'&&s.stage===i?Math.sin(time*3)*.025:0;});
      controls.update();renderer.render(scene,camera);
    },
    setPosition(x:number,z:number){fire.root.position.set(x,.06,z);lastPosition.copy(fire.root.position)},
    turn(angle:number){fire.root.rotation.y=angle},
    angle(){return fire.root.rotation.y},
    frame(stage:number){follow=true;frame(false,stage)}, overview(){follow=false;frame(true)}, follow(stage:number){follow=true;frame(false,stage)}
  }
}
