
//some of this based on glMatrix  https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js

function rtd(r) {
  return r * 180 / Math.PI;
}

function dtr(d) {
  return d * Math.PI / 180;
}


tr4Matrix = function (x=0,y=0,z=0,mat) {
  mat[12] = mat[0] * x + mat[4] * y + mat[8]	* z + mat[12];
  mat[13] = mat[1] * x + mat[5] * y + mat[9]	* z + mat[13];
  mat[14] = mat[2] * x + mat[6] * y + mat[10]	* z + mat[14];
  mat[15] = mat[3] * x + mat[7] * y + mat[11]	* z + mat[15];
  return mat;
},


i4Matrix = function () {
  return [1,0,0,0,
          0,1,0,0,
          0,0,1,0,
          0,0,0,1];
}


sc4Matrix = function (x=1,y=1,z=1,mat) {
  mat[0] *= x;
  mat[1] *= x;
  mat[2] *= x;
  mat[3] *= x;
  mat[4] *= y;
  mat[5] *= y;
  mat[6] *= y;
  mat[7] *= y;
  mat[8] *= z;
  mat[9] *= z;
  mat[10] *= z;
  mat[11] *= z;
  return mat;
}

p4Matrix = function(aspect=1.3333, near=.01, far=2000, fov=dtr(60)) {
  var f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
  var rangeInv = 1.0 / (near - far);

  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * rangeInv, -1,
    0, 0, near * far * rangeInv * 2, 0,
  ];
}


rx4Matrix = function (radian, mat) {
  let s = Math.sin(radian);
  let c = Math.cos(radian);
  let a10 = mat[4];
  let a11 = mat[5];
  let a12 = mat[6];
  let a13 = mat[7];
  let a20 = mat[8];
  let a21 = mat[9];
  let a22 = mat[10];
  let a23 = mat[11];


  mat[4] = a10 * c + a20 * s;
  mat[5] = a11 * c + a21 * s;
  mat[6] = a12 * c + a22 * s;
  mat[7] = a13 * c + a23 * s;
  mat[8] = a20 * c - a10 * s;
  mat[9] = a21 * c - a11 * s;
  mat[10] = a22 * c - a12 * s;
  mat[11] = a23 * c - a13 * s;
  return mat;
}

ry4Matrix = function (radian, mat) {
  let s = Math.sin(radian);
  let c = Math.cos(radian);
  let a00 = mat[0];
  let a01 = mat[1];
  let a02 = mat[2];
  let a03 = mat[3];
  let a20 = mat[8];
  let a21 = mat[9];
  let a22 = mat[10];
  let a23 = mat[11];


  mat[0] = a00 * c - a20 * s;
  mat[1] = a01 * c - a21 * s;
  mat[2] = a02 * c - a22 * s;
  mat[3] = a03 * c - a23 * s;
  mat[8] = a00 * s + a20 * c;
  mat[9] = a01 * s + a21 * c;
  mat[10] = a02 * s + a22 * c;
  mat[11] = a03 * s + a23 * c;
  return mat;
}

rz4Matrix = function (radian, mat) {
  let s = Math.sin(radian);
  let c = Math.cos(radian);
  let a00 = mat[0];
  let a01 = mat[1];
  let a02 = mat[2];
  let a03 = mat[3];
  let a10 = mat[4];
  let a11 = mat[5];
  let a12 = mat[6];
  let a13 = mat[7];


  mat[0] = a00 * c + a10 * s;
  mat[1] = a01 * c + a11 * s;
  mat[2] = a02 * c + a12 * s;
  mat[3] = a03 * c + a13 * s;
  mat[4] = a10 * c - a00 * s;
  mat[5] = a11 * c - a01 * s;
  mat[6] = a12 * c - a02 * s;
  mat[7] = a13 * c - a03 * s;
  return mat;
}







mProduct = function(a, b){ 
    let out = [];
    let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    let b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    return out;	
}




function invert(out,mat) {
		if(mat === undefined) mat = out; //If input isn't sent, then output is also input

	    var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
	        a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
	        a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
	        a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15],

	        b00 = a00 * a11 - a01 * a10,
	        b01 = a00 * a12 - a02 * a10,
	        b02 = a00 * a13 - a03 * a10,
	        b03 = a01 * a12 - a02 * a11,
	        b04 = a01 * a13 - a03 * a11,
	        b05 = a02 * a13 - a03 * a12,
	        b06 = a20 * a31 - a21 * a30,
	        b07 = a20 * a32 - a22 * a30,
	        b08 = a20 * a33 - a23 * a30,
	        b09 = a21 * a32 - a22 * a31,
	        b10 = a21 * a33 - a23 * a31,
	        b11 = a22 * a33 - a23 * a32,

	        // Calculate the determinant
	        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

	    if (!det) {console.log("no inverse"); return false;}
	    det = 1.0 / det;

	    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
	    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
	    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
	    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
	    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
	    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
	    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
	    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
	    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
	    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
}


function vecProd(v, m) {
  out = [];
  let x = v[0], y = v[1], z = v[2], w = v[3];
  out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
  out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
  out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
  out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
  return out;
}

function normalize(v) {
  var mag = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  if (mag === 0) { return [0,0,0]; }
  else { return [ v[0]/mag, v[1]/mag, v[2]/mag ]; }
}

function triNorm(p0x, p0y, p0z, p1x, p1y, p1z, p2x, p2y, p2z) {

  var p1x = p1x - p0x;
  var p1y = p1y - p0y;
  var p1z = p1z - p0z;

  var p2x = p2x - p0x;
  var p2y = p2y - p0y;
  var p2z = p2z - p0z;

  var p3x = p1y * p2z - p1z * p2y;
  var p3y = p1z * p2x - p1x * p2z;
  var p3z = p1x * p2y - p1y * p2x;

  return normalize([p3x,p3y,p3z]);
}

/**
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} cam Position of the viewer
 * @param {vec3} target Point the viewer is looking at
 */
function lookAt(cam, target, up=[0,1,0]) {
  let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
  let camx = cam[0];
  let camy = cam[1];
  let camz = cam[2];
  let upx = up[0];
  let upy = up[1];
  let upz = up[2];
  let targetx = target[0];
  let targety = target[1];
  let targetz = target[2];

  z0 = camx - targetx;
  z1 = camy - targety;
  z2 = camz - targetz;
  let nz = normalize([z0,z1,z2]);

  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  let nx = normalize([x0,x1,x2]);

  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  let ny = normalize([y0,y1,y2]);

  return [ nx[0],ny[0],nz[0],0,
           nx[1],ny[1],nz[1],0,
           nx[2],ny[2],nz[2],0,
           -(nx[0] * camx + nx[1] * camy + nx[2] * camz),
           -(ny[0] * camx + ny[1] * camy + ny[2] * camz),
           -(nz[0] * camx + nz[1] * camy + nz[2] * camz),
           1];
}

function transpose(out, a) {
  if (out === a) {
    let a01 = a[1], a02 = a[2], a03 = a[3];
    let a12 = a[6], a13 = a[7];
    let a23 = a[11];

    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a01;
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a02;
    out[9] = a12;
    out[11] = a[14];
    out[12] = a03;
    out[13] = a13;
    out[14] = a23;
  } else {
    out[0] = a[0];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a[1];
    out[5] = a[5];
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a[2];
    out[9] = a[6];
    out[10] = a[10];
    out[11] = a[14];
    out[12] = a[3];
    out[13] = a[7];
    out[14] = a[11];
    out[15] = a[15];
  }

  return out;
}
