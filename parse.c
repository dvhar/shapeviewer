//#include <stdio.h>
#include <math.h>
#include <string.h>
#include <stdlib.h>
#include <emscripten/emscripten.h>

int main(int argc, char ** argv) {
  emscripten_run_script("wasmloaded()");
}

int nindex=0;

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
int firstcall = 1;

int parse (char*a, float*vertArray, int vertArrayLen, float*normArray) {


  float templist[50000];
  //memset(templist,0,sizeof(templist));
  //memset(vertArray,0,vertArrayLen);
  //memset(normArray,0,vertArrayLen);
  int len = strlen(a), vindex=1,i=0,vi=0,v;
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
          x = atof(strtok_r(NULL," ",&endword));
            templist[vindex++] = x;
            if (vi==0 && firstcall) hx=lx=x;

            else { if (x<lx) lx = x; if (x>hx) hx = x; }
          x = atof(strtok_r(NULL," ",&endword));
            templist[vindex++] = x;
            if (vi==0 && firstcall) hy=ly=x;

            else { if (x<ly) ly = x; if (x>hy) hy = x; }
          x = atof(strtok_r(NULL," ",&endword));
            templist[vindex++] = x;
            if (vi==0 && firstcall) hz=lz=x;

            else { if (x<lz) lz = x; if (x>hz) hz = x; }
        break;

      case 'F':
        strtok_r(line," ",&endword);
        strtok_r(NULL," ",&endword);
          v = 3*atoi(strtok_r(NULL," ",&endword));
            x = templist[v-2];
            y = templist[v-1];
            z = templist[v];
          v = 3*atoi(strtok_r(NULL," ",&endword));
            xx = templist[v-2];
            yy = templist[v-1];
            zz = templist[v];
          v = 3*atoi(strtok_r(NULL," ",&endword));
            xxx = templist[v-2];
            yyy = templist[v-1];
            zzz = templist[v];
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

  firstcall = 0;

  //returns vertex array length
  return vi;
}

void getcenter (float*center){
  center[0] = (lx+hx)/2.0;
  center[1] = (ly+hy)/2.0;
  center[2] = (lz+hz)/2.0;
}

