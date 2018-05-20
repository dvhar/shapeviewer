

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
var light_loc = gl.getUniformLocation(program, "u_litdirection");
var filePath =  "/cw/webgltest/tut/shape/";
var models = []; readyCount = 0; //14 total
//var rois = [13];
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

      gl.uniform3fv(light_loc,normalize([1.0,8.0,7.0,1]));//old l direction
      gl.enable(gl.CULL_FACE);
      gl.enable(gl.DEPTH_TEST);
      gl.bindVertexArray(models[i].vao);
      gl.drawArrays(gl.TRIANGLES, 0, models[i].verts.length/3);

    }


  }

  var moves = { t: {x:0, y:0, z:60},
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
      center = getcenter();
      //document.write(JSON.stringify(models[0]));
      for (var i in models){
        for (var x=0; x<models[i].verts.length; x+=3){
          models[i].verts[x] -= center[0];
          models[i].verts[x+1] -= center[1];
          models[i].verts[x+2] -= center[2];
        }
      loadBuffers(models[i]);
      }
      main(); 
      }
    else
      whenLoaded(num); 
  },100);
}


function loadMeshFile(fileName) {
  var meshRequest = new XMLHttpRequest();
  meshRequest.open("GET", fileName, true);
  meshRequest.onreadystatechange = function() {
    if (meshRequest.readyState == 4 && meshRequest.status == 200){
      mesh = meshRequest.responseText;
      model={};
      process(mesh,model);
      models.push(model);
      readyCount++;
      //console.log(fileName);
    }
  }
  meshRequest.send(null);
}

setTimeout(()=>{
    //console.log("running");
    for (var x in rois){
      fileName = `${filePath}resliced_mesh_${rois[x]}.m`;
      loadMeshFile(fileName);
    }
  },800);

whenLoaded(rois.length);



