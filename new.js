var filePath =  "/cw/webgltest/tut/shape/";
var models = []; readyCount = 0; //14 total
var rois = [10, 11, 12, 13, 17, 18, 26, 49, 50, 51, 52, 53, 54, 58];


function parseMesh (txt) {

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

  return model;

}

function whenLoaded(num){
  setTimeout(()=>{ readyCount==num ?  document.write("done") : whenLoaded(num); },100);
}


function loadMeshFile(fileName) {
  var meshRequest = new XMLHttpRequest();
  meshRequest.open("GET", fileName, true);
  meshRequest.onreadystatechange = function() {
    if (meshRequest.readyState == 4 && meshRequest.status == 200){
      mesh = meshRequest.responseText;
      models.push(parseMesh(mesh));
      readyCount++;
      console.log(fileName);
    }
  }
  meshRequest.send(null);
}


for (var x in rois){
  fileName = `${filePath}resliced_mesh_${rois[x]}.m`;
  loadMeshFile(fileName);
}

whenLoaded(rois.length);
