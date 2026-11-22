import { addBotanicalDesk } from './desk-botanical.js';
import * as T from 'three';

// Original modeled desk accessories inspired by a busy creative studio.
export function addDeskDetails({ G, M, rb, cyl, sph, ct, pl, cable, DS, mon, cg }) {
  // Fine woven fabric on the cubicle walls; deterministic to keep the scene stable.
  const fabric = ct(256, 256, (g, w, h) => {
    g.fillStyle = '#9c9da5'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 3) for (let x = 0; x < w; x += 3) {
      g.fillStyle = (x + y) % 4 ? '#a7a8ae' : '#8f9099';
      g.fillRect(x, y, 1, 2);
    }
  });
  fabric.wrapS = fabric.wrapT = T.RepeatWrapping; fabric.repeat.set(4, 3);
  G.children.filter(o => o.isMesh && o.material?.color?.getHexString() === 'a3a3ac').forEach(o => {
    o.material = new T.MeshStandardMaterial({ map: fabric, roughness: .95 });
  });
  // Cork pinboard overlay and handwritten pinned notes.
  const cork = ct(512, 256, (g, w, h) => {
    g.fillStyle = '#ad845f'; g.fillRect(0, 0, w, h);
    let seed = 17;
    for (let i = 0; i < 6500; i++) {
      seed = (seed * 16807) % 2147483647; const x = seed % w;
      seed = (seed * 16807) % 2147483647; const y = seed % h;
      g.fillStyle = i % 2 ? '#98714f' : '#c49b70'; g.fillRect(x, y, 2, 2);
    }
  });
  pl(4.8, 2.4, cork, 5.5, 4.1, .116);
  const notes = ['BUILD. PLAY. REPEAT.', 'ship something good', 'LEVEL DESIGN', 'NEXT: BOSS AI', 'make it feel alive', 'CLASS OF 2027', 'new ideas here', 'PRESS PLAY'];
  [[4.2,4.8,'#d9ccf5'],[4.9,4.4,'#f1e7a8'],[5.7,4.9,'#fff'],[6.4,4.3,'#d9ccf5'],[4.6,3.6,'#fff'],[5.3,3.5,'#f1e7a8'],[6.1,3.6,'#d9ccf5'],[6.8,4.7,'#f1e7a8']].forEach(([x,y,c],i) => {
    const note = ct(160,160,(g,w,h) => {
      g.fillStyle=c;g.fillRect(0,0,w,h);g.fillStyle='#40384d';g.font='italic 22px serif';g.textAlign='center';
      notes[i].split(' ').forEach((word,k)=>g.fillText(word,w/2,45+k*27));
    });
    pl(.48,.48,note,x,y,.151).rotation.z=(i-4)*.04;
    sph(.026,'#6b3fe0',x,y+.22,.18);
  });
  addBotanicalDesk({ G, M, rb, cyl, sph, ct, pl, DS, mon });
  // Neighboring workstation returns visible beyond the partition walls.
  rb(8,.14,2.25,'#dedce2',3.65,DS-.15,-1.75);
  rb(2.25,.14,7.7,'#dedce2',-1.75,DS-.15,3.7);
  rb(.12,1.95,2.15,'#a9a9b1',7.55,1.02,-1.75);
  rb(2.15,1.95,.12,'#a9a9b1',-1.75,1.02,7.45);
  rb(2.15,1.75,1.7,'#aaaab2',1.25,.9,6.6);
  // Narrow metal cabinet with four distinct fronts and inset pulls.
  for(let i=0;i<4;i++){
    const y=.35+i*.4;
    rb(.045,.36,1.53,'#c7c5cd',2.34,y,6.6);
    rb(.055,.055,.5,'#72717c',2.375,y+.07,6.6);
  }
  // Desk clock, pencil erasers and paper corners at the workstation edge.
  rb(.16,.06,.11,'#e4a1aa',6.55,DS+.04,2.13).rotation.y=.3;
  // File tray with individual paper edges and labeled spines.
  rb(.85,.07,1.35,'#7194ad',.9,DS+.04,3.35);
  rb(.06,.85,1.35,'#7194ad',.5,DS+.45,3.35);
  rb(.85,.85,.06,'#7194ad',.9,DS+.45,2.7);
  for(let i=0;i<9;i++) rb(.65,.035,1.05,'#fcfbf5',.91,DS+.12+i*.055,3.4).rotation.z=-.04;
  // A succulent with separate tapered leaves rather than a spherical canopy.
  const succulent=(x,z,s=1)=>{
    cyl(.25*s,.19*s,.3*s,'#d0835e',x,DS+.15*s,z);
    cyl(.22*s,.22*s,.025,'#413c33',x,DS+.31*s,z);
    for(let i=0;i<13;i++){
      const a=i*2.4,r=i<5?.08:.17;
      const leaf=sph(.13*s,i%2?'#428371':'#639c79',x+Math.cos(a)*r*s,DS+(.4+(i<5?.1:0))*s,z+Math.sin(a)*r*s);
      leaf.scale.set(.55,1.5,.65);leaf.rotation.z=Math.sin(a)*.65;leaf.rotation.x=Math.cos(a)*.65;
    }
  };succulent(1.65,6.35,.8);
  // Coffee surface, notebook stitching, loose pencil and ruler.
  cyl(.165,.165,.008,'#583622',6.9,DS+.324,2.1);
  const pencil=cyl(.025,.025,.8,'#e4a852',6.12,DS+.035,2.02);pencil.rotation.z=Math.PI/2;pencil.rotation.y=.3;
  rb(.8,.018,.14,'#d9c6a4',6.1,DS+.018,1.7).rotation.y=.25;
  for(let i=0;i<9;i++)rb(.012,.006,.04,'#54453a',5.76+i*.08,DS+.03,1.7);
  // Metal spring toy and speaker details.
  const spring=[];for(let i=0;i<=240;i++){const a=i/240*Math.PI*20;spring.push(new T.Vector3(6.65+Math.cos(a)*.16,DS+.05+i/240*.8,1.3+Math.sin(a)*.16));}
  G.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(spring),240,.012,5),M('#9d9da5',.25,.75)));
  for(const [x,z] of [[-1.65,1.2],[1.65,.6]]){
    rb(.35,.65,.4,'#dfdacc',x,DS+.325,z,mon);
    const cone=cyl(.115,.115,.02,'#39343c',x,DS+.28,z+.21,mon);cone.rotation.x=Math.PI/2;
    sph(.045,'#b9b3a8',x,DS+.28,z+.23,mon);
    sph(.028,'#38323e',x,DS+.52,z+.21,mon);
  }
  // Chair upholstery seams and chrome caster hubs.
  for(const x of [-.64,.64]) rb(.018,1.2,.018,'#9c78ed',x,2.0,-.715,cg);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;sph(.055,'#b7b6bf',Math.sin(a)*1.2,.15,Math.cos(a)*1.2,cg);}
  cable([[2,DS,.4],[1.4,1.7,.4],[1.1,.6,.4],[1.2,.08,1.2],[2,.08,1.6]],'#56515f',.018);
}
