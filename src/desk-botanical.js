import * as T from 'three';

export function addBotanicalDesk({G,M,rb,cyl,sph,ct,pl,DS,mon}) {
  const rod=(a,b,r,c,p=G)=>{
    const A=new T.Vector3(...a), B=new T.Vector3(...b), d=B.clone().sub(A);
    const mesh=new T.Mesh(new T.CylinderGeometry(r,r,d.length(),12),M(c,.4,.35));
    mesh.position.copy(A.add(B).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());p.add(mesh);return mesh;
  };
  const leaf=(x,y,z,a,s,p=G)=>{
    const shape=new T.Shape();shape.moveTo(0,0);shape.bezierCurveTo(-.18,.2,-.16,.52,0,.68);shape.bezierCurveTo(.19,.45,.16,.15,0,0);
    const mesh=new T.Mesh(new T.ShapeGeometry(shape,8),new T.MeshStandardMaterial({color:s%2?'#276d54':'#49936c',roughness:.75,side:T.DoubleSide}));
    mesh.position.set(x,y,z);mesh.rotation.set(.25+Math.cos(a)*.5,a,Math.sin(a)*.7);mesh.scale.setScalar(.6+s*.04);p.add(mesh);
    rod([x,y,z],[x,y+.29,z],.005,'#81aa78',p);return mesh;
  };
  const pot=(x,z,r,color)=>{
    cyl(r,r*.72,.4,color,x,DS+.2,z);
    const lip=new T.Mesh(new T.TorusGeometry(r,.035,8,32),M(color));lip.rotation.x=Math.PI/2;lip.position.set(x,DS+.405,z);G.add(lip);
    cyl(r*.88,r*.88,.025,'#3d3027',x,DS+.39,z);
  };
  // Branching indoor plant, with separate pointed leaves and flower clusters.
  pot(7.35,.85,.3,'#ece8df');
  rod([7.35,DS+.4,.85],[7.35,DS+1.55,.85],.035,'#8c6942');
  for(let i=0;i<9;i++){
    const a=i*2.4,y=DS+.72+i*.09,x=7.35+Math.cos(a)*.33,z=.85+Math.sin(a)*.33;
    rod([7.35,y-.15,.85],[x,y+.13,z],.014,'#69844b');
    leaf(x,y,z,a,i);leaf(x+.1*Math.cos(a+1),y+.12,z+.1*Math.sin(a+1),a+1,i+2);
    if(i%3===0){for(let k=0;k<5;k++){const b=k*Math.PI*2/5;const petal=sph(.055,'#e6c9ee',x+Math.cos(b)*.065,y+.32+Math.sin(b)*.065,z);petal.scale.z=.4;}sph(.035,'#f0c855',x,y+.32,z+.035);}
  }
  // Ribbed cactus with a small purple bloom in a terracotta pot.
  pot(1.8,7.2,.27,'#cd855f');
  const cactus=sph(.22,'#3d865c',1.8,DS+.73,7.2);cactus.scale.y=1.7;
  for(let i=0;i<10;i++){const a=i*Math.PI/5;rod([1.8+Math.cos(a)*.2,DS+.5,7.2+Math.sin(a)*.2],[1.8+Math.cos(a)*.17,DS+.94,7.2+Math.sin(a)*.17],.008,'#82ad79');}
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const petal=sph(.065,'#b596ea',1.8+Math.cos(a)*.07,DS+1.12,7.2+Math.sin(a)*.07);petal.scale.y=.5;}sph(.04,'#f8d967',1.8,DS+1.15,7.2);

  // Articulated task light with paired arms, pivot bolts and a white shade.
  const lamp=new T.Group();lamp.position.set(6.45,DS,.62);lamp.scale.x=-1;G.add(lamp);
  cyl(.33,.4,.1,'#d7d9dc',0,.05,0,lamp);cyl(.17,.22,.07,'#a3a7ac',0,.12,0,lamp);
  const joints=[[0,.16,0],[-.22,.95,0],[.42,1.65,0],[.72,1.65,0]];
  for(let i=0;i<2;i++)for(const z of [-.065,.065]){const a=[...joints[i]],b=[...joints[i+1]];a[2]=b[2]=z;rod(a,b,.025,'#b8bdc3',lamp);}
  joints.forEach(([x,y,z])=>{const bolt=cyl(.065,.065,.19,'#72777e',x,y,z,lamp);bolt.rotation.x=Math.PI/2;sph(.026,'#d9dde0',x,y,.11,lamp);});
  rod(joints[2],joints[3],.035,'#bec3c9',lamp);
  const shade=new T.Group();shade.position.set(.74,1.58,0);shade.rotation.z=-.5;lamp.add(shade);
  const shell=new T.Mesh(new T.CylinderGeometry(.12,.34,.42,40,1,true),new T.MeshStandardMaterial({color:'#f0efeb',roughness:.35,metalness:.12,side:T.DoubleSide}));shade.add(shell);
  const rim=new T.Mesh(new T.TorusGeometry(.34,.018,8,40),M('#c4c7c9'));rim.rotation.x=Math.PI/2;rim.position.y=-.21;shade.add(rim);
  const bulb=sph(.095,'#fff4cf',0,-.13,0,shade);bulb.material=new T.MeshBasicMaterial({color:'#fff4cf'});
  const light=new T.PointLight('#ffe9b8',.7,3,2);light.position.set(0,-.28,0);shade.add(light);

  // CRT chassis seams, ventilation slots, drive bays and tactile front controls.
  for(const side of [-1,1])for(let i=0;i<11;i++)rb(.013,.035,.65,'#c3bdad',side*1.156,DS+1.1+i*.075,-.25,mon,.004);
  for(let i=0;i<12;i++)rb(.065,.012,.6,'#c9c3b4',-.55+i*.1,DS+2.455,-.25,mon,.004);
  rb(2.16,.018,.012,'#b6b09f',0,DS+.53,1.212,mon,.003);
  rb(.78,.15,.025,'#d5cebc',-.5,DS+.27,1.22,mon,.012);
  rb(.6,.024,.012,'#59554e',-.5,DS+.285,1.24,mon,.002);
  rb(.09,.045,.02,'#b4ac98',-.22,DS+.23,1.24,mon,.006);
  for(let i=0;i<8;i++)rb(.018,.095,.012,'#c1baa8',.68+i*.045,DS+.27,1.23,mon,.003);
  pl(.5,.12,ct(256,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#6b6356';g.font='bold 30px monospace';g.textAlign='center';g.fillText('BASIM / 01',w/2,42);}),-.4,DS+.63,.98,0,mon,{transparent:true});
  // Subtle scanlines give the glass a CRT finish while keeping the video visible.
  const lines=ct(256,256,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='rgba(5,14,10,.1)';for(let y=0;y<h;y+=4)g.fillRect(0,y,w,1);});
  pl(1.62,1.22,lines,0,DS+1.55,1.015,0,mon,{transparent:true,depthWrite:false});
}
