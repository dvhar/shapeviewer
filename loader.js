

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
  for (var x=0; x<model.verts.length; x+=3) {
    model.verts[x] -= (lx+hx)/2;
    model.verts[x+1] -= (ly+hy)/2;
    model.verts[x+2] -= (lz+hz)/2;
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
  filePath =  "/shape/"+meshFile;
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



