#include <stdio.h>
#include <math.h>
#include <string.h>
#include <stdlib.h>
#include <emscripten/emscripten.h>

int main(int argc, char ** argv) {
    printf("WebAssembly module loaded\n");
}

char * norm (char * a) {
  double va = atof(strtok(a,","));
  double vb = atof(strtok(NULL,","));
  double vc = atof(strtok(NULL,","));
  double vd = atof(strtok(NULL,","));
  double ve = atof(strtok(NULL,","));
  double vf = atof(strtok(NULL,","));
  double vg = atof(strtok(NULL,","));
  double vh = atof(strtok(NULL,","));
  double vi = atof(strtok(NULL,","));

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
    sprintf(a,"%3.4f,%3.4f,%3.4f, %3.4f,%3.4f,%3.4f, %3.4f,%3.4f,%3.4f, ",ox,oy,oz,ox,oy,oz,ox,oy,oz);
  }else
    strcpy(a,"0,0,0,0,0,0,0,0,0,");

  return a;
}




char * EMSCRIPTEN_KEEPALIVE sift (char * a) {

  char vertices[2505][100];
  //int nn=0;
  //char normals[9505][300];


  int i=0;
  int len = strlen(a);
  char * out = malloc ( 2* len * sizeof(char));
  char * outr = malloc ( 2* len * sizeof(char));
  char * outn = malloc ( 2* len * sizeof(char));
  strcpy(out,"");
  


  char * endline, *endword, *coord, *vecs1, *vecs2, *vecs3;
  char * line = strtok_r(a,"\n",&endline);
  char chunk[100], vecs[150];
  int w, ii=1, veci;
  double xx,yy,zz,hx,lx,hy,ly,hz,lz;

  while (line != NULL){
    line = strtok_r(NULL,"\n",&endline);


    switch (line[0]){
      case 'V':

        strtok_r(line," \n",&endword);
        strtok_r(NULL," ",&endword);

          coord = strtok_r(NULL," ",&endword);
            strcpy(chunk,coord);
            strcat(chunk,", ");
            xx = atof(coord);
            if (ii==1) hx=lx=xx;
            else { if (xx<lx) lx = xx; if (xx>hx) hx = xx; }
          coord = strtok_r(NULL," ",&endword);
            strcat(chunk,coord);
            strcat(chunk,", ");
            xx = atof(coord);
            if (ii==1) hy=ly=xx;
            else { if (xx<ly) ly = xx; if (xx>hy) hy = xx; }
          coord = strtok_r(NULL," ",&endword);
            strcat(chunk,coord);
            strcat(chunk,", ");
            xx = atof(coord);
            if (ii==1) hz=lz=xx;
            else { if (xx<lz) lz = xx; if (xx>hz) hz = xx; }
          strcpy(vertices[ii++],chunk);
        break;

      case 'F':
        coord = strtok_r(line," ",&endword);
        strtok_r(NULL," ",&endword);

          vecs1 = vertices[atoi(strtok_r(NULL," ",&endword))];
            strcat(out,vecs1);
          vecs2 = vertices[atoi(strtok_r(NULL," ",&endword))];
            strcat(out,vecs2);
          vecs3 = vertices[atoi(strtok_r(NULL," ",&endword))];
            strcat(out,vecs3);

          strcpy(vecs,vecs1);
          strcat(vecs,vecs2);
          strcat(vecs,vecs3);

            norm(vecs);
            //strcpy(normals[nn++],vecs);
            strcat(outn,vecs);
          break;
    }


  } //loop

  xx=(hx+lx)/2.0;
  yy=(hy+ly)/2.0;
  zz=(hz+lz)/2.0;
  out[strlen(out)-2]='\0';
  outn[strlen(outn)-2]='\0';

  char subuf[500];
  memcpy(subuf,&outn[0],499);
  subuf[499]='\0';
  printf("%s\n",subuf);

  sprintf(outr,"[[%s],[%s],[%3.4f,%3.4f,%3.4f]]",out,outn,xx,yy,zz);

  free(outr);
  free(outn);

  return outr;
}


/*

char * EMSCRIPTEN_KEEPALIVE getnorms () {

  char * out = malloc ( 1000000 * sizeof(char));
  strcpy(out,"[");
  int i;
  for (i=0; i<nn; i++){
    strcat(out,normals[i]);
  }
  out[strlen(out)-1]=']';

  return out;

}
*/
