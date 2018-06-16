import java.io.IOException;
import java.io.OutputStream;
import java.io.File;
import java.io.InputStream;
import java.util.*;
import java.net.InetSocketAddress;
import java.net.URI;
import java.lang.String;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;


class Server {
	public static void main(String[] a) throws Exception {

    DirFinder.setSubjParentDir("/home/dave/sync/coding/webdev/webgltest/render/");

    HttpServer server = HttpServer.create(new InetSocketAddress(8000),0);
    server.createContext("/mesh", new MeshHandler());
    server.createContext("/view", new ViewHandler());
    server.createContext("/", new ViewHandler());
    server.createContext("/scripts", new ScriptHandler());
    server.createContext("/posty", new PostHandler());
    server.setExecutor(null);
    server.start();
		System.out.println("Server running");
	}

  static class MeshHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange t) throws IOException {

      String uri = t.getRequestURI().toString();
      String rfile = uri.substring(uri.lastIndexOf('/') + 1);
      //String fpath = "/home/dave/sync/coding/webdev/webgltest/render/verts/" + rfile;
      String fpath = DirFinder.getCurrentDir() + rfile;
      File file = new File(fpath);

      String response = new Scanner(file).useDelimiter("\\Z").next();
      t.sendResponseHeaders(200,response.length());
      OutputStream os = t.getResponseBody();
      os.write(response.getBytes());
      os.close();
    }
  }

  static class ViewHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange t) throws IOException {

      String fpath = "/home/dave/sync/coding/webdev/webgltest/render/served.html";
      File file = new File(fpath);

      String response = new Scanner(file).useDelimiter("\\Z").next();

      t.sendResponseHeaders(200,response.length());
      OutputStream os = t.getResponseBody();
      os.write(response.getBytes());
      os.close();
    }
  }

  static class ScriptHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange t) throws IOException {

      String uri = t.getRequestURI().toString();
      String rfile = uri.substring(uri.lastIndexOf('/') + 1);
      String fpath = "/home/dave/sync/coding/webdev/webgltest/render/" + rfile;
      File file = new File(fpath);

      String response = new Scanner(file).useDelimiter("\\Z").next();

      t.sendResponseHeaders(200,response.length());
      OutputStream os = t.getResponseBody();
      os.write(response.getBytes());
      os.close();
    }
  }

  static class PostHandler implements HttpHandler {


    @Override
    public void handle(HttpExchange t) throws IOException {

      Map<String, String> reqData = new HashMap<String, String>();
      byte[] d = new byte[100];
      InputStream stuff = t.getRequestBody();
      stuff.read(d);
      String totalIn = new String(d,"UTF-8");
      String[] pairs = totalIn.split("&");

      for (int x=0; x<pairs.length; x++){
        String[] pair = pairs[x].split("=");
        reqData.put(pair[0],pair[1]);
      }

      String reqPath = java.net.URLDecoder.decode(reqData.get("finder"), "UTF-8");
      
      System.out.println(reqPath);

      DirFinder.setSubjParentDir(reqPath);

      String response = "path changed to " + DirFinder.getCurrentDir() + "\n";
      System.out.println(response);

      t.sendResponseHeaders(200,response.length());
      OutputStream os = t.getResponseBody();
      os.write(response.getBytes());
      os.close();
    }
  }

}

class DirFinder {

  private static File[] dirList;
  private static File[] subDirList;
  private static File sdir;
  private static int foundMeshes = 0;
  private static List<File> subjDirs;
  private static int currentIndex = 0;


  public static void setSubjParentDir(String path){
    sdir = new File(path.trim());
    if (!sdir.isDirectory()) return;
    dirList = sdir.listFiles();
    subjDirs = new ArrayList<File>();


    for (int i=0; i<dirList.length; i++){
      if (dirList[i].isDirectory()){
        subDirList = dirList[i].listFiles();
        foundMeshes = 0;
        for (int x=0; x<subDirList.length; x++)
          if (subDirList[x].getName().contains("resliced_mesh_")) 
            foundMeshes++;
        if (foundMeshes == 14){
          subjDirs.add(dirList[i]);
          //System.out.println("found: "+dirList[i].getPath());
        }
      }
    }
  }


  public static String getCurrentDir(){
    //System.out.println(subjDirs.get(currentIndex).getPath()+"/");
    return subjDirs.get(currentIndex).getPath()+"/";
  }


}

