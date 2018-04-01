function matDebug(m) { 
        document.getElementById("fps").innerHTML = '<br>' +
  "<table>"+
        "<tr><td>"+m[0].toFixed(2) + '</td><td>'+ m[4].toFixed(2) + '</td><td>'+ m[8].toFixed(2) + '</td><td>'+ m[12].toFixed(2) + '</td></tr>'+ 
        "<tr><td>"+m[1].toFixed(2) + '</td><td>'+ m[5].toFixed(2) + '</td><td>'+ m[9].toFixed(2) + '</td><td>'+ m[13].toFixed(2) + '</td></tr>'+ 
        "<tr><td>"+m[2].toFixed(2) + '</td><td>'+ m[6].toFixed(2) + '</td><td>'+ m[10].toFixed(2) + '</td><td>'+ m[14].toFixed(2) + '</td></tr>'+ 
        "<tr><td>"+m[3].toFixed(2) + '</td><td>'+ m[7].toFixed(2) + '</td><td>'+ m[11].toFixed(2) + '</td><td>'+ m[15].toFixed(2) + '</td></tr>'+
        "</table>";
}


function main(model) {

  var transform_loc = gl.getUniformLocation(model.program, "transform");
  rHeight = window.innerHeight * .7;
  rWidth = Math.floor(rHeight * (16/9));

  function drawFrame(v) {

    gl.setSize(rWidth,rHeight);
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var projectionMat = p4Matrix();

    var cam = [v.t.x,v.t.y,v.t.z];
    var tar = [0,0,0];

    cameraMat = lookAt(cam,tar);

    //var viewMat = invert([],cameraMat);
    var viewMat = cameraMat;

    var viewProjMat = mProduct(projectionMat,viewMat);

    //var p = vecProd([0,0,0,1],viewProjMat);
    //document.getElementById("fps").innerHTML = c[0].toFixed(0)+' '+ c[1].toFixed(0)+' '+ c[2].toFixed(0)+':'+p[0].toFixed(0)+' '+ p[1].toFixed(0)+' '+p[2].toFixed(0); 
   
   matDebug(viewProjMat);

    gl.uniformMatrix4fv(transform_loc,false,viewProjMat);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(model.program);
    gl.bindVertexArray(model.vao);
    gl.drawArrays(gl.TRIANGLES, 0, model.verts.length/3);


  }

  var lastFrame = 0;
  var active = true;
  var radPerSec	= (Math.PI / 180.0)*180;
  var fps = 65;
  var moves = { m: {w:0.5, n:0, z:0},
                t: {x:0, y:0, z:-50},
                r: {x:0, y:0, z:0},
                s: {x:1, y:1, z:1},
                f: {x:1, y:0, z:0},
                wt: {x:0, y:0, z:0},
                wr: {x:0, y:0, z:0}, }
  moves.wt.x -= model.midx; moves.wt.y -= model.midy; moves.wt.z -= model.midz; moves.t.z -= 42;

  drawFrame(moves);
  if (active) window.requestAnimationFrame(run);
  document.getElementById("c").onclick = function() {
    active = (active==true? false : true);
    if (active) window.requestAnimationFrame(run);
  }

  function run(now) {

    var dt = (now - lastFrame)/1000;
    if (dt > 1/fps ) {

      if (keys.up) moves.r.x -= 50*dt;
      if (keys.down) moves.r.x += 50*dt;
      if (keys.left) moves.r.y -= 50*dt;
      if (keys.right) moves.r.y += 50*dt;
      if (keys.w) moves.t.y += 50*dt;
      if (keys.s) moves.t.y -= 50*dt;
      if (keys.a) moves.t.x -= 50*dt;
      if (keys.d) moves.t.x += 50*dt;
      if (keys.q) moves.t.z += 50*dt;
      if (keys.e) moves.t.z -= 50*dt;
      if (keys.z) moves.r.z += 50*dt;
      if (keys.x) moves.r.z -= 50*dt;


      drawFrame(moves);
      lastFrame = now;
    }
    if (active) window.requestAnimationFrame(run); 

  }
} //end main



