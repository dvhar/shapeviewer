

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


var program = createProgram(gl, vs, fs);
var positionAttrLoc = gl.getAttribLocation(program, "a_position");
var normal_loc = gl.getAttribLocation(program, "a_normal");
var worviewproj_loc = gl.getUniformLocation(program, "u_worldviewprojection");
var worldinvtrans_loc = gl.getUniformLocation(program, "u_worldinvtrans");
var world_loc = gl.getUniformLocation(program, "u_world");
var liteworldpos_loc = gl.getUniformLocation(program, "u_liteworldpos");
var litecolor_loc = gl.getUniformLocation(program, "u_litcolor");
var viewworldpos_loc = gl.getUniformLocation(program, "u_viewworldpos");
var light_loc = gl.getUniformLocation(program, "u_litdirection");
var filePath =  "/cw/webgltest/tut/shape/";
var models = []; readyCount = 0; //14 total
var rois = [10, 11, 12, 13, 17, 18, 26, 49, 50, 51, 52, 53, 54, 58];
var keys = {};
var rHeight = window.innerHeight * .9;
var rWidth = Math.floor(rHeight * (16/9));

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
  67: 'c'
}




function main() {


  function drawFrame(v) {

    gl.useProgram(program);
    gl.setSize(rWidth,rHeight);
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (var i in models){

      var projmat = p4Matrix();

      var cammat = i4Matrix();
      tr4Matrix(v.t.x,v.t.y,v.t.z,cammat);

      var viewmat = i4Matrix();
      viewmat = invert(viewmat,cammat);
      var viewprojmat = mProduct(projmat,viewmat);

      var worldmat = i4Matrix();
      rx4Matrix(v.r.x,worldmat);
      ry4Matrix(v.r.y,worldmat);
      rz4Matrix(v.r.z,worldmat);

      viewprojmat = mProduct(viewprojmat,worldmat);

      var worldinverse = worldmat.slice(0,worldmat.length);;
      var worldinverse = invert(worldinverse);
      var worldinvtrans = i4Matrix();
      worldinvtrans = transpose(worldinvtrans,worldinverse);

      var litmat = i4Matrix();
      tr4Matrix(v.c.x,v.c.y,v.c.z,litmat);
      var litpos = vecProd([20,30,50,1],litmat);

      gl.uniformMatrix4fv(worviewproj_loc,false,viewprojmat);
      gl.uniformMatrix4fv(worldinvtrans_loc,false,worldinvtrans);
      gl.uniformMatrix4fv(world_loc,false,worldmat);
      gl.uniform3fv(liteworldpos_loc,litpos.slice(0,3));
      gl.uniform3fv(litecolor_loc,[1.0,0.6,1.0]);

      //console.log(JSON.stringify(litpos.slice(0,3)));

      gl.uniform3fv(viewworldpos_loc,[0,0,0]);//old l direction
      gl.enable(gl.CULL_FACE);
      gl.enable(gl.DEPTH_TEST);
      gl.bindVertexArray(models[i].vao);
      gl.drawArrays(gl.TRIANGLES, 0, models[i].verts.length/3);

    }


  }

  var moves = { t: {x:0, y:0, z:90},
                r: {x:0, y:0, z:0}, 
                c: {x:0, y:0, z:0}, }

  drawFrame(moves);


  var lastFrame = 0;
  var active = false;
  var radPerSec	= Math.PI;
  var fps = 65;
  function run(now) {

    if (now - lastFrame > 100) lastFrame = now;
    var dt = (now - lastFrame)/1000;
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

      if (keys["1"]) moves.c.y += 140*dt;
      if (keys["2"]) moves.c.y -= 140*dt;
      if (keys["3"]) moves.c.x -= 140*dt;
      if (keys["4"]) moves.c.x += 140*dt;
      if (keys["5"]) moves.c.z += 140*dt;
      if (keys["6"]) moves.c.z -= 140*dt;

      drawFrame(moves);
      lastFrame = now;
    }
    if (active) window.requestAnimationFrame(run); 

  }

  onkeydown = onkeyup = function(e){
    e = e || event;
    keys[keycodes[e.keyCode]] = e.type == 'keydown';
    active = false;
    for (var key in keys)
      if (keys[key])
        active = true;
    if (active) window.requestAnimationFrame(run);
  }



}




var center = { hx:null,lx:null,hy:null,ly:null,hz:null,lz:null,mx:null,my:null,mz:null,count:0 };
function parseMesh(txt,model) {

  txt = txt.trim() + '\n';
  var posA = 0;
  var posB = txt.indexOf("\n",0);
  var vArr = ['',];
  var verts = [];
  var norms = [];
  let ind,vi=0,ni=0;

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

        //set low and high points
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
        ind = line[2]*3;
        var x1 =vArr[ind-2];
        var y1 =vArr[ind-1];
        var z1 =vArr[ind];
        ind = line[3]*3;
        var x2 =vArr[ind-2];
        var y2 =vArr[ind-1];
        var z2 =vArr[ind];
        ind = line[4]*3;
        var x3 =vArr[ind-2];
        var y3 =vArr[ind-1];
        var z3 =vArr[ind];

        //model.verts.push(x1,y1,z1,x2,y2,z2,x3,y3,z3);
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
        norms[ni++] = norm[0];
        norms[ni++] = norm[1];
        norms[ni++] = norm[2];
        norms[ni++] = norm[0];
        norms[ni++] = norm[1];
        norms[ni++] = norm[2];
        norms[ni++] = norm[0];
        norms[ni++] = norm[1];
        norms[ni++] = norm[2];
        break;

    }
    posA = posB+1;
    posB = txt.indexOf("\n",posA);
  }

  model.verts = new Float32Array(verts);
  model.norms = new Float32Array(norms);
  model.len = vi;


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


  //ready normal buffer
  model.normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, model.norms, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normal_loc);
  gl.vertexAttribPointer(normal_loc, 3, gl.FLOAT, true, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

}

function whenLoaded(num){
  setTimeout(()=>{ 
    if (readyCount==num){
      //center the models and load into buffers
      center.mx=(center.lx+center.hx)/2,center.my=(center.ly+center.hy)/2,center.mz=(center.lz+center.hz)/2;
      for (var i in models){
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
  },100);
}


function loadMeshFile(fileName) {
  var meshRequest = new XMLHttpRequest();
  meshRequest.open("GET", fileName, true);
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


for (var x in rois){
  fileName = `${filePath}resliced_mesh_${rois[x]}.m`;
  loadMeshFile(fileName);
}

whenLoaded(rois.length);
