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
    server.createContext("/", new ViewHandler());
    server.createContext("/subjects", new ListHandler());
    server.createContext("/scripts", new ScriptHandler());
    server.createContext("/posty", new PostHandler());
    server.setExecutor(null);
    server.start();
		System.out.println("Server running");
	}

  static class MeshHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange t) throws IOException {

      //experimental selector
      /*
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

      String rfile = java.net.URLDecoder.decode(reqData.get("rfile"), "UTF-8");
      //String subjectIdx = java.net.URLDecoder.decode(reqData.get("subject"), "UTF-8");
      
      System.out.println(subjectIdx);
      */
      //end experimental selector


      String uri = t.getRequestURI().toString();
      String rfile = uri.substring(uri.lastIndexOf('/') + 1);
      String fpath = DirFinder.getCurrentDir(0) + rfile;
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

  static class ListHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange t) throws IOException {

      String response = DirFinder.getSubjList();

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

      String response = "path changed to " + DirFinder.getCurrentDir(0) + "\n";
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
  private static List<File> newSubjDirs;


  public static void setSubjParentDir(String path){
    sdir = new File(path.trim());
    if (!sdir.isDirectory()) return;
    dirList = sdir.listFiles();
    newSubjDirs = new ArrayList<File>();


    for (int i=0; i<dirList.length; i++){
      if (dirList[i].isDirectory()){
        subDirList = dirList[i].listFiles();
        foundMeshes = 0;
        for (int x=0; x<subDirList.length; x++)
          if (subDirList[x].getName().contains("resliced_mesh_")) 
            foundMeshes++;
        if (foundMeshes == 14){
          newSubjDirs.add(dirList[i]);
        }
      }

      if (newSubjDirs.size() > 0) subjDirs = newSubjDirs;
    }
  }

  public static String getSubjList(){
    String sList = "[";
    for (int i=0; i<subjDirs.size(); i++){
      sList += "\""+ subjDirs.get(i).getPath()+"/\"";
      if (i<subjDirs.size()-1) sList += ",";
    }
    sList += "]";
    return sList;
  }


  public static String getCurrentDir(int subjectIndex){
    return subjDirs.get(subjectIndex).getPath()+"/";
  }


}

