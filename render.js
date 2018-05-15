

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



