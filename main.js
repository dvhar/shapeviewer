

function shaderSource(elmID){
	var source = document.getElementById(elmID);
	if(!source || source.text == ""){ console.log(elmID + " shader not found"); return null; }
	return source.text;
}

function createShader(gl, type, source){
	var shader = gl.createShader(type);
	gl.shaderSource(shader,source);
	gl.compileShader(shader);

  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success)
    return shader;
  console.log("no compile: "+gl.getShaderInfoLog(shader));
}

function createProgram(gl,vShader,fShader){
	var prog = gl.createProgram();
	gl.attachShader(prog,vShader);
	gl.attachShader(prog,fShader);
	gl.linkProgram(prog);

  var success = gl.getProgramParameter(prog, gl.LINK_STATUS);
	gl.deleteShader(fShader);
	gl.deleteShader(vShader);
  if (success)
    return prog;
  console.log("no program: "+gl.getProgramInfoLog(program));
}


var canvas = document.getElementById("c");
var gl = canvas.getContext("webgl2");
if (!gl) { console.log("no gl!"); }

var vertShaderSource = shaderSource("vs");
var fragShaderSource = shaderSource("fs");

var vs = createShader(gl, gl.VERTEX_SHADER, vertShaderSource);
var fs = createShader(gl, gl.FRAGMENT_SHADER, fragShaderSource);

gl.setSize = function(w,h){
  this.canvas.style.width = w + "px";
  this.canvas.style.height = h + "px";
  this.canvas.width = w;
  this.canvas.height = h;
  this.viewport(0,0,w,h);
}

function getSubList() {
  var dirRequest = new XMLHttpRequest();
  dirRequest.open("GET", "/subjects", true);
  dirRequest.onreadystatechange = function() {
    if (dirRequest.readyState == 4 && dirRequest.status == 200){
      var subjects = dirRequest.responseText;
      var listDom = document.getElementById("subList");
      var subList = JSON.parse(subjects);
      listDom.innerHTML = "";
      for (var i in subList){
        var subrow = document.createElement('tr');
        var subdiv = document.createElement('td');
        var subname = subList[i].slice(0,subList[i].length-1).split('/').pop();
        subdiv.appendChild(document.createTextNode(subname));
        subrow.appendChild(subdiv);
        listDom.appendChild(subrow);
      }
    }
  }
  dirRequest.send(null);
}

function selectDir(dirName) {
  var dirRequest = new XMLHttpRequest();
  dirRequest.open("POST", "/posty", true);
  dirRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  dirRequest.onreadystatechange = function() {
    if (dirRequest.readyState == 4 && dirRequest.status == 200){
      var subjects = dirRequest.responseText;
      //document.getElementById("fps").innerHTML = subjects;
      getSubList();
    }
  }
  dirRequest.send(`finder=${dirName}`);
}
var program = createProgram(gl, vs, fs);
var positionAttrLoc = gl.getAttribLocation(program, "a_position");
var normal_loc = gl.getAttribLocation(program, "a_normal");
var tnormal_loc = gl.getAttribLocation(program, "a_tnormal");
var worviewproj_loc = gl.getUniformLocation(program, "u_worldviewprojection");
var worldinvtrans_loc = gl.getUniformLocation(program, "u_worldinvtrans");
var world_loc = gl.getUniformLocation(program, "u_world");
var liteworldpos_loc = gl.getUniformLocation(program, "u_liteworldpos");
var litecolor_loc = gl.getUniformLocation(program, "u_litcolor");
var specularcolor_loc = gl.getUniformLocation(program, "u_specularcolor");
var basecolor_loc = gl.getUniformLocation(program, "u_basecolor");
var viewworldpos_loc = gl.getUniformLocation(program, "u_viewworldpos");
var light_loc = gl.getUniformLocation(program, "u_litdirection");
var normtype_loc = gl.getUniformLocation(program, "u_normtype");
var filePath =  "/mesh/";
var models = []; readyCount = 0; //14 total
//var rois = [10];
var rois = [10, 11, 12, 13, 17, 18, 26, 49, 50, 51, 52, 53, 54, 58];
var roicolors = [];
var keys = {};
var rHeight = window.innerHeight;
var rWidth = window.innerWidth;
var aspectRatio = rWidth / rHeight;
var ntype = 0.0;
var dt = 0;
var moves = { t: {x:0, y:-3, z:75},
              r: {x:3.14, y:3.14, z:0}, 
              c: {x:0, y:0, z:0},

              m: {x:0, y:0.0, z:0},
              g: {x:0, y:0.0, z:0}, }
keycodes = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  65: 'a',
  68: 'd',
  87: 'w',
  83: 's',
  81: 'q',
  69: 'e',
  49: '1',
  50: '2',
  51: '3',
  52: '4',
  53: '5',
  54: '6',
  55: '7',
  56: '8',
  90: 'z',
  88: 'x',
  67: 'c',
  82: 'r',
  70: 'f'
}
onkeydown = onkeyup = function(e){
  e = e || event;
  keys[keycodes[e.keyCode]] = e.type == 'keydown';
}

//toggle button for color
function colorgen(model){
  for (let h=0; h<3; h++)
    model.color[h] = Math.random();
}
function colorall(models){
  for (let h=0; h<14; h++)
    colorgen(models[h]);
}
document.getElementById("searchbut").onclick = ()=>{ selectDir(document.getElementById("dirsearch").value); };
document.getElementById("cbut").onclick = ()=>{ colorall(models); };
document.getElementById("nbut").onclick = ()=>{ ntype = (ntype > 0.5 ? 0.0 : 1.0); };
document.getElementById("kbut").onclick = ()=>{ loadnewsubject(); };


//mouse and touchscreen moving
function mover(e){
  movex = ((e.clientX || e.targetTouches[0].clientX) - oldx);
  movey = ((e.clientY || e.targetTouches[0].clientY) - oldy);
  moves.r.y -= 0.5*movex*dt;
  moves.r.x += 0.5*movey*dt;
  oldx = (e.clientX || e.targetTouches[0].clientX);
  oldy = (e.clientY || e.targetTouches[0].clientY);
}

function dropper(e){
  document.removeEventListener("mousup",dropper);
  document.removeEventListener("mousemove",mover);
  document.removeEventListener("touchend",dropper);
  document.removeEventListener("touchmove",mover);
  //document.removeEventListener("touchmove",zoomer);
}

function grabber(e){
  oldx = e.clientX || e.targetTouches[0].clientX;
  oldy = e.clientY || e.targetTouches[0].clientY;
  document.addEventListener("mousemove",mover);
  document.addEventListener("mouseup",dropper);
  document.addEventListener("touchmove",mover);
  document.addEventListener("touchend",dropper);
}
/*
function zoomgrab(e){
  if (e.targetTouches[1]){
    otx1 = e.targetTouches[0].clientX;
    oty1 = e.targetTouches[0].clientY;
    otx2 = e.targetTouches[1].clientX;
    oty2 = e.targetTouches[1].clientY;
    odist = Math.sqrt((otx1-otx2)*(otx1-otx2)+(oty1-oty2)*(oty1-oty2));
    document.addEventListener("touchmove",zoomer);
    document.addEventListener("touchend",dropper);
  }
}
function zoomer(e){
  tx1 = e.targetTouches[0].clientX;
  ty1 = e.targetTouches[0].clientY;
  tx2 = e.targetTouches[1].clientX;
  ty2 = e.targetTouches[1].clientY;
  dist = Math.sqrt((tx1-tx2)*(tx1-tx2)+(ty1-ty2)*(ty1-ty2));
  console.log(dist - odist);
  moves.t.z -= (dist - odist);
  odist = dist;
}
*/
canvas.addEventListener("mousedown",grabber);
canvas.addEventListener("touchstart",grabber);
//canvas.addEventListener("touchstart",zoomgrab);



function drawFrame(v) {

  gl.useProgram(program);
  gl.setSize(rWidth,rHeight);
  gl.clearColor(0,0,0,0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  for (var i in models){

    var projmat = p4Matrix(aspectRatio);

    var cammat = i4Matrix();
    tr4Matrix(v.t.x,v.t.y,v.t.z,cammat);

    var viewmat = i4Matrix();
    viewmat = invert(viewmat,cammat);
    var viewprojmat = mProduct(projmat,viewmat);

    var worldmat = i4Matrix();
    rx4Matrix(v.r.x,worldmat);
    ry4Matrix(v.r.y,worldmat);
    rz4Matrix(v.r.z,worldmat);

    var mm = models[i].center;
    tr4Matrix(mm[0]*v.m.x,mm[1]*v.m.x,mm[2]*v.m.x,worldmat);

    viewprojmat = mProduct(viewprojmat,worldmat);

    var worldinverse = worldmat.slice(0,worldmat.length);;
    var worldinverse = invert(worldinverse);
    var worldinvtrans = i4Matrix();
    worldinvtrans = transpose(worldinvtrans,worldinverse);

    var litmat = i4Matrix();
    tr4Matrix(v.c.x,v.c.y,v.c.z,litmat);
    var litpos = vecProd([0,10,90,1],litmat);

    gl.uniformMatrix4fv(worviewproj_loc,false,viewprojmat);
    gl.uniformMatrix4fv(worldinvtrans_loc,false,worldinvtrans);
    gl.uniformMatrix4fv(world_loc,false,worldmat);
    gl.uniform3fv(liteworldpos_loc,litpos.slice(0,3));
    gl.uniform3fv(litecolor_loc,[1.0,1.0,1.0]);
    gl.uniform3fv(specularcolor_loc,[0.9,0.9,0.5]);
    gl.uniform3fv(basecolor_loc,models[i].color);
    gl.uniform1f(normtype_loc,ntype);

    gl.uniform3fv(viewworldpos_loc,[0,0,0]);//old l direction
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.bindVertexArray(models[i].vao);
    gl.drawArrays(gl.TRIANGLES, 0, models[i].verts.length/3);

  }
}


function main() {

  drawFrame(moves);

  var lastFrame = 0;
  var radPerSec	= Math.PI;
  var fps = 65;
  function run(now) {

    if (now - lastFrame > 100) lastFrame = now;
    dt = (now - lastFrame)/1000;
    if (dt > 1/fps ) {

      if (keys.up) moves.r.x -= radPerSec*dt;
      if (keys.down) moves.r.x += radPerSec*dt;
      if (keys.left) moves.r.y -= radPerSec*dt;
      if (keys.right) moves.r.y += radPerSec*dt;
      if (keys.z) moves.r.z += radPerSec*dt;
      if (keys.x) moves.r.z -= radPerSec*dt;
      if (keys.w) moves.t.y += 40*dt;
      if (keys.s) moves.t.y -= 40*dt;
      if (keys.a) moves.t.x -= 40*dt;
      if (keys.d) moves.t.x += 40*dt;
      if (keys.q) moves.t.z += 40*dt;
      if (keys.e) moves.t.z -= 40*dt;
      if (keys.r) moves.m.x += 2*dt;
      if (keys.f) moves.m.x -= 2*dt;
      if (keys["1"]) moves.c.y += 140*dt;
      if (keys["2"]) moves.c.y -= 140*dt;
      if (keys["3"]) moves.c.x -= 140*dt;
      if (keys["4"]) moves.c.x += 140*dt;
      if (keys["5"]) moves.c.z += 140*dt;
      if (keys["6"]) moves.c.z -= 140*dt;

      drawFrame(moves);
      lastFrame = now;
    }
    if (models.length == rois.length) window.requestAnimationFrame(run); 
  }
  window.requestAnimationFrame(run);


}


var center = { hx:null,lx:null,hy:null,ly:null,hz:null,lz:null,mx:null,my:null,mz:null,count:0 };
rn=0;
function parseMesh(txt,model) {

  txt = txt.trim() + '\n';
  var posA = 0;
  var posB = txt.indexOf("\n",0);
  var vArr = ['',];
  var verts = [];
  var norms = [];
  var tnorms = [];
  var m = { hx:null,lx:null,hy:null,ly:null,hz:null,lz:null,mx:null,my:null,mz:null,c:0 };
  var sharedverts = {};
  let nindex,mag,ind,vi=0,ni=0,findex=0,newnormx,newnormy,newnormz;

  while(posB > posA){

    var line = txt.substring(posA,posB).trim();

    switch(line.charAt(0)){
      // Sample Data
      //Vertex 1 140.753 133.406 99.9389 
      //Face 5000 2499 2501 2502

      case "V":
        line = line.split(" ");
        var x = parseFloat(line[2]);
        var y = parseFloat(line[3]);
        var z = parseFloat(line[4]);

        sharedverts[parseInt(line[1])] = [];

        //set low and high points for this model
        if (m.c == 0) { m.hx=m.lx=x; m.hy=m.ly=y; m.hz=m.lz=z; m.c++; }
        else {
          if (x<m.lx) m.lx=x;
          if (y<m.ly) m.ly=y;
          if (z<m.lz) m.lz=z;
          if (x>m.hx) m.hx=x;
          if (y>m.hy) m.hy=y;
          if (z>m.hz) m.hz=z;
        }
        //set low and high points for all models
        if (center.count == 0) { center.hx=center.lx=x; center.hy=center.ly=y; center.hz=center.lz=z; center.count++; }
        else {
          if (x<center.lx) center.lx=x;
          if (y<center.ly) center.ly=y;
          if (z<center.lz) center.lz=z;
          if (x>center.hx) center.hx=x;
          if (y>center.hy) center.hy=y;
          if (z>center.hz) center.hz=z;
        }

        vArr.push(x,y,z);
        break;

      case "F":
        line = line.split(" ");

        vert = line[2];
        sharedverts[vert].push((findex++)*3);
        ind = vert*3;
        var x1 = vArr[ind-2];
        var y1 = vArr[ind-1];
        var z1 = vArr[ind];

        vert = line[3];
        sharedverts[vert].push((findex++)*3);
        ind = vert*3;
        var x2 = vArr[ind-2];
        var y2 = vArr[ind-1];
        var z2 = vArr[ind];

        vert = line[4];
        sharedverts[vert].push((findex++)*3);
        ind = vert*3;
        var x3 = vArr[ind-2];
        var y3 = vArr[ind-1];
        var z3 = vArr[ind];

        verts[vi++] = x1;
        verts[vi++] = y1;
        verts[vi++] = z1;
        verts[vi++] = x2;
        verts[vi++] = y2;
        verts[vi++] = z2;
        verts[vi++] = x3;
        verts[vi++] = y3;
        verts[vi++] = z3;

        var norm = triNorm(x1,y1,z1,x2,y2,z2,x3,y3,z3);
        tnorms[ni++] = norm[0];
        tnorms[ni++] = norm[1];
        tnorms[ni++] = norm[2];
        tnorms[ni++] = norm[0];
        tnorms[ni++] = norm[1];
        tnorms[ni++] = norm[2];
        tnorms[ni++] = norm[0];
        tnorms[ni++] = norm[1];
        tnorms[ni++] = norm[2];
        break;

    }
    posA = posB+1;
    posB = txt.indexOf("\n",posA);
  }

  model.len = vi;
  model.center = [(m.hx+m.lx)/2.0,(m.hy+m.ly)/2.0,(m.hz+m.lz)/2.0];

  //make smooth vertex normals from discreet tri normals
  for (var sv in sharedverts){
    newnormx = 0.0;
    newnormy = 0.0;
    newnormz = 0.0;
    for (var si in sharedverts[sv]){
      nindex = sharedverts[sv][si];
      newnormx += tnorms[nindex];
      newnormy += tnorms[nindex+1];
      newnormz += tnorms[nindex+2];
    }

    mag = Math.sqrt(newnormx* newnormx+ newnormy* newnormy+ newnormz* newnormz);
    if (mag != 0) { newnormx /= mag; newnormy /= mag; newnormz /= mag; }
    else { newnormx = 0.0; newnormy = 0.0; newnormz = 0.0; }

    for (var si in sharedverts[sv]){
      nindex = sharedverts[sv][si];
      norms[nindex] = newnormx;
      norms[nindex+1] = newnormy;
      norms[nindex+2] = newnormz;
    }
  }

  model.verts = new Float32Array(verts);
  model.norms = new Float32Array(norms);
  model.tnorms = new Float32Array(tnorms);
  model.color = [];
  return model;
}

function loadBuffers(model){


  model.vao = gl.createVertexArray();
  gl.bindVertexArray(model.vao);
  //ready position buffer
  model.positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, model.positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, model.verts, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttrLoc);
  gl.vertexAttribPointer(positionAttrLoc, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  //ready vertex normal buffer
  model.normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, model.norms, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normal_loc);
  gl.vertexAttribPointer(normal_loc, 3, gl.FLOAT, true, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  //ready triangle normal buffer
  model.tnormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, model.tnormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, model.tnorms, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(tnormal_loc);
  gl.vertexAttribPointer(tnormal_loc, 3, gl.FLOAT, true, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

}


function whenLoaded(num){
  setTimeout(()=>{ 
    if (readyCount==num){
      //center the models and load into buffers
      center.mx=(center.lx+center.hx)/2,center.my=(center.ly+center.hy)/2,center.mz=(center.lz+center.hz)/2;
      for (var i in models){
        colorgen(models[i]);
        models[i].center[0] -= center.mx;
        models[i].center[1] -= center.my;
        models[i].center[2] -= center.mz;
        for (var x=0; x<models[i].len; x+=3){
          models[i].verts[x] -= center.mx;
          models[i].verts[x+1] -= center.my;
          models[i].verts[x+2] -= center.mz;
        }
        loadBuffers(models[i]);
      }
      main(); 
    }
    else {
      whenLoaded(num); 
    }
  },10);
}


function loadMeshFile(fileName) {
  var meshRequest = new XMLHttpRequest();
  meshRequest.open("GET", fileName, true);
  //meshRequest.open("GET", fileName+"?subject=0", true);
  meshRequest.onreadystatechange = function() {
    if (meshRequest.readyState == 4 && meshRequest.status == 200){
      mesh = meshRequest.responseText;
      model = {};
      parseMesh(mesh,model);
      models.push(model);
      readyCount++;
    }
  }
  meshRequest.send(null);
}


function loadnewsubject(subject,recenter=false) {
  models = []; readyCount = 0;
  if (recenter)
    moves = { t: {x:0, y:-3, z:75},
              r: {x:3.14, y:3.14, z:0}, 
              c: {x:0, y:0, z:0},
              m: {x:0, y:0.0, z:0},
              g: {x:0, y:0.0, z:0}, }
  for (var x in rois){
    fileName = `${filePath}resliced_mesh_${rois[x]}.m`;
    loadMeshFile(fileName);
  }
  whenLoaded(rois.length);
}

loadnewsubject();

getSubList();
