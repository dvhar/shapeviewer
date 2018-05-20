//#include <stdio.h>
#include <math.h>
#include <string.h>
#include <stdlib.h>
#include <emscripten/emscripten.h>

int main(int argc, char ** argv) {
    //printf("WebAssembly module loaded\n");
    int a=0;
}

int nindex=0;
int ncalls=0;

void norm (float va,float vb,float vc,float vd,float ve,float vf,float vg,float vh,float vi,float*norms){

  float px = vd - va;
  float py = ve - vb;
  float pz = vf - vc;

  float pxx = vg - va;
  float pyy = vh - vb;
  float pzz = vi - vc;

  float pxxx = py * pzz - pz * pyy;
  float pyyy = pz * pxx - px * pzz;
  float pzzz = px * pyy - py * pxx;

  float ox,oy,oz;
  float mag = sqrt(pxxx * pxxx + pyyy * pyyy + pzzz * pzzz);
  if (mag){
    ox = pxxx/mag; oy = pyyy/mag; oz= pzzz/mag;
  }else{
    ox=0;oy=0;oz=0;
  }
  norms[nindex++] = ox;
  norms[nindex++] = oy;
  norms[nindex++] = oz;
  norms[nindex++] = ox;
  norms[nindex++] = oy;
  norms[nindex++] = oz;
  norms[nindex++] = ox;
  norms[nindex++] = oy;
  norms[nindex++] = oz;

}

float hx,lx,hy,ly,hz,lz;

int parse (char*a, float*vertArray, int vertArrayLen, float*normArray) {


  float biglist[50000];
  //memset(biglist,0,sizeof(biglist));
  //memset(vertArray,0,vertArrayLen);
  //memset(normArray,0,vertArrayLen);
  int len = strlen(a), vindex=1,i=0,vi=0,v,vv,vvv;
  char * endline, *endword;
  char * line = strtok_r(a,"\n",&endline);
  float x,y,z,xx,yy,zz,xxx,yyy,zzz;
  nindex=0;

  while (line != NULL){
    line = strtok_r(NULL,"\n",&endline);

    switch (line[0]){
      case 'V':
        strtok_r(line," \n",&endword);
        strtok_r(NULL," ",&endword);
          xx = atof(strtok_r(NULL," ",&endword));
            biglist[vindex++] = xx;
            if (vi==0 && ncalls==0) hx=lx=xx;

            else { if (xx<lx) lx = xx; if (xx>hx) hx = xx; }
          xx = atof(strtok_r(NULL," ",&endword));
            biglist[vindex++] = xx;
            if (vi==0 && ncalls==0) hy=ly=xx;

            else { if (xx<ly) ly = xx; if (xx>hy) hy = xx; }
          xx = atof(strtok_r(NULL," ",&endword));
            biglist[vindex++] = xx;
            if (vi==0 && ncalls==0) hz=lz=xx;

            else { if (xx<lz) lz = xx; if (xx>hz) hz = xx; }
        break;

      case 'F':
        strtok_r(line," ",&endword);
        strtok_r(NULL," ",&endword);
          v = 3*atoi(strtok_r(NULL," ",&endword));
            x = biglist[v-2];
            y = biglist[v-1];
            z = biglist[v];
          vv = 3*atoi(strtok_r(NULL," ",&endword));
            xx = biglist[vv-2];
            yy = biglist[vv-1];
            zz = biglist[vv];
          vvv = 3*atoi(strtok_r(NULL," ",&endword));
            xxx = biglist[vvv-2];
            yyy = biglist[vvv-1];
            zzz = biglist[vvv];
        vertArray[vi++] = x;
        vertArray[vi++] = y;
        vertArray[vi++] = z;
        vertArray[vi++] = xx;
        vertArray[vi++] = yy;
        vertArray[vi++] = zz;
        vertArray[vi++] = xxx;
        vertArray[vi++] = yyy;
        vertArray[vi++] = zzz;

        norm(x,y,z,xx,yy,zz,xxx,yyy,zzz,normArray);
        break;
    }

  } //loop

  ncalls++;
  return vi;
}

void getcenter (float*center){
  center[0] = (lx+hx)/2.0;
  center[1] = (ly+hy)/2.0;
  center[2] = (lz+hz)/2.0;
}

