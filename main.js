

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



function createRequest() {
  try {
    request = new XMLHttpRequest();
  } catch (tryMS) {
    try {
      request = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (otherMS) {
      try {
        request = new ActiveXObject("Microsoft.XMLHTTP");
      } catch (failed) {
        request = null;
      }
    }
  }	
  return request;
}

//initial file
if (sessionStorage.getItem("roi") === null) sessionStorage.setItem("roi","10");



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

var keys = {};







function main(model) {

  var transform_loc = gl.getUniformLocation(model.program, "transform");
  rHeight = window.innerHeight * .7;
  rWidth = Math.floor(rHeight * (16/9));

  function drawFrame(v) {

    gl.setSize(rWidth,rHeight);
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    tmat = p4Matrix();
    tr4Matrix(v.t.x,v.t.y,v.t.z,tmat);
    rx4Matrix(v.r.x,tmat);
    ry4Matrix(v.r.y,tmat);
    rz4Matrix(v.r.z,tmat);

    gl.uniformMatrix4fv(transform_loc,false,tmat);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(model.program);
    gl.bindVertexArray(model.vao);
    gl.drawArrays(gl.TRIANGLES, 0, model.verts.length/3);


  }

  var lastFrame = 0;
  var active = false;
  var radPerSec	= Math.PI;
  var fps = 65;
  var keys = {};
  var moves = { t: {x:0, y:0, z:-60},
                r: {x:0, y:0, z:0}, }

  drawFrame(moves);

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






function loader (txt) {

  txt = txt.trim() + '\n';
  var model = {};
  var posA = 0;
  var posB = txt.indexOf("\n",0);
  var vArr = ['',];
  model.verts = [];
  model.norms = [];
  model.colors = [];
  var hx,lx,hy,ly,hz,lz;
  var count = 0;

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
        if (count == 0) { hx=lx=x; hy=ly=y; hz=lz=z; count++; }
        else {if(x<lx)lx=x;if(y<ly)ly=y;if(z<lz)lz=z;if(x>hx)hx=x;if(y>hy)hy=y;if(z>hz)hz=z;}

        vArr.push(x);
        vArr.push(y);
        vArr.push(z);
        break;

      case "F":
        line = line.split(" ");
        var x1 =vArr[line[2]*3-2];
        var y1 =vArr[line[2]*3-1];
        var z1 =vArr[line[2]*3];
        var x2 =vArr[line[3]*3-2];
        var y2 =vArr[line[3]*3-1];
        var z2 =vArr[line[3]*3];
        var x3 =vArr[line[4]*3-2];
        var y3 =vArr[line[4]*3-1];
        var z3 =vArr[line[4]*3];

        model.verts.push(x1);
        model.verts.push(y1);
        model.verts.push(z1);

        model.verts.push(x2);
        model.verts.push(y2);
        model.verts.push(z2);

        model.verts.push(x3);
        model.verts.push(y3);
        model.verts.push(z3);

        var norm = triNorm(x1,y1,z1,x2,y2,z2,x3,y3,z3);
        model.norms = model.norms.concat(norm);
        model.norms = model.norms.concat(norm);
        model.norms = model.norms.concat(norm); break;

    }
    posA = posB+1;
    posB = txt.indexOf("\n",posA);
  }

  //center the model
  let mx=(lx+hx)/2,my=(ly+hy)/2,mz=(lz+hz)/2;
  for (var x=0; x<model.verts.length; x+=3) {
    model.verts[x] -= mx;
    model.verts[x+1] -= my;
    model.verts[x+2] -= mz;
  }

  //set up model program
  model.program = createProgram(gl, vs, fs);
  gl.useProgram(model.program);
  positionAttrLoc = gl.getAttribLocation(model.program, "a_position");
  normal_loc = gl.getAttribLocation(model.program, "a_normal");

  model.vao = gl.createVertexArray();
  gl.bindVertexArray(model.vao);
  //ready position buffer
  model.positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, model.positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.verts), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttrLoc);
  gl.vertexAttribPointer(positionAttrLoc, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);


  //ready normal buffer
  model.normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.norms), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normal_loc);
  gl.vertexAttribPointer(normal_loc, 3, gl.FLOAT, true, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);


  main(model);
}




function loadMeshFile(meshFile) {
  filePath =  "/cw/webgltest/newer/shape/"+meshFile;
  var meshRequest = createRequest();
  meshRequest.open("GET", filePath, true);
  meshRequest.onreadystatechange = function() {
    if (meshRequest.readyState == 4 && meshRequest.status == 200){
      mesh = meshRequest.responseText;
      loader(mesh);
      return mesh;
    }
    else return "not found";
  }
  meshRequest.send(null);
}



firstFile = sessionStorage.getItem("roi");
document.getElementById("fps").innerHTML = firstFile;
firstFile = "resliced_mesh_"+firstFile+".m";
loadMeshFile(firstFile);

function selectFile(roinum) {
  sessionStorage.setItem("roi",roinum);
  location = location;
}



