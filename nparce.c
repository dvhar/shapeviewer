
#include <stdio.h>
#include <math.h>
#include <string.h>
#include <stdlib.h>
#include <emscripten/emscripten.h>

int main(int argc, char ** argv) {
    printf("WebAssembly module loaded\n");
}

int gindex=0;
int ncalls=0;

void norm (double va,double vb,double vc,double vd,double ve,double vf,double vg,double vh,double vi,double*norms){

  double px = vd - va;
  double py = ve - vb;
  double pz = vf - vc;

  double pxx = vg - va;
  double pyy = vh - vb;
  double pzz = vi - vc;

  double pxxx = py * pzz - pz * pyy;
  double pyyy = pz * pxx - px * pzz;
  double pzzz = px * pyy - py * pxx;

  double ox,oy,oz;
  
  double mag = sqrt(pxxx * pxxx + pyyy * pyyy + pzzz * pzzz);
  if (mag){
    ox = pxxx/mag; oy = pyyy/mag; oz= pzzz/mag;
  }else{
    ox=0;oy=0;oz=0;
  }

  norms[gindex++] = ox;
  norms[gindex++] = oy;
  norms[gindex++] = oz;

}




char * EMSCRIPTEN_KEEPALIVE sift (char * a) {

  //printf("starting parse in c\n");

  double biglist[50000];
  double normlist[50000];
  memset(biglist,0,sizeof(biglist));
  memset(normlist,0,sizeof(normlist));

  int len = strlen(a), ini=1,i=0,veci,v,vv,vvv;
  char * out = malloc (2*len * sizeof(char));
  strcpy(out,"[[");
  
  char * endline, *endword;
  char * line = strtok_r(a,"\n",&endline);
  double x,y,z,xx,yy,zz,xxx,yyy,zzz,hx,lx,hy,ly,hz,lz;
  gindex=0;

  while (line != NULL){
    line = strtok_r(NULL,"\n",&endline);


    switch (line[0]){
      case 'V':

        strtok_r(line," \n",&endword);
        strtok_r(NULL," ",&endword);

          xx = atof(strtok_r(NULL," ",&endword));
            biglist[ini++] = xx;
            if (ini==2) hx=lx=xx;
            else { if (xx<lx) lx = xx; if (xx>hx) hx = xx; }
          xx = atof(strtok_r(NULL," ",&endword));
            biglist[ini++] = xx;
            if (ini==3) hy=ly=xx;
            else { if (xx<ly) ly = xx; if (xx>hy) hy = xx; }
          xx = atof(strtok_r(NULL," ",&endword));
            biglist[ini++] = xx;
            if (ini==4) hz=lz=xx;
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
        sprintf(out+strlen(out),"%3.4f,%3.4f,%3.4f,%3.4f,%3.4f,%3.4f,%3.4f,%3.4f,%3.4f,",x,y,z,xx,yy,zz,xxx,yyy,zzz);

        norm(x,y,z,xx,yy,zz,xxx,yyy,zzz,normlist);
        break;
    }


  } //loop
  x=(hx+lx)/2.0;
  y=(hy+ly)/2.0;
  z=(hz+lz)/2.0;


  out[strlen(out)-1]=']';
  sprintf(out+strlen(out),",[");

  //printf("sprintf loop\n");
  for (i=0;i<gindex-1;i+=3){
    sprintf(out+strlen(out),"%3.2f,%3.2f,%3.2f,%3.2f,%3.2f,%3.2f,%3.2f,%3.2f,%3.2f,",normlist[i],normlist[i+1],normlist[i+2],normlist[i],normlist[i+1],normlist[i+2],normlist[i],normlist[i+1],normlist[i+2]);
  }
  //printf("loop done\n");

  out[strlen(out)-1]=']';
  sprintf(out+strlen(out),",[%3.4f,%3.4f,%3.4f]]",x,y,z);



  return out;
}

