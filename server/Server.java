import java.io.IOException;
import java.io.OutputStream;
import java.io.File;
import java.util.Scanner;
import java.net.InetSocketAddress;
import java.net.URI;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;


class Server {
	public static void main(String[] a) throws Exception {

    HttpServer server = HttpServer.create(new InetSocketAddress(8000),0);
    server.createContext("/mesh", new MeshHandler());
    server.createContext("/view", new ViewHandler());
    server.createContext("/", new ViewHandler());
    server.createContext("/scripts", new ScriptHandler());
    server.setExecutor(null);
    server.start();
		System.out.println("Server running");
	}

  static class MeshHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange t) throws IOException {

      //String rfile = "resliced_mesh_18.m";
      String uri = t.getRequestURI().toString();
      String rfile = uri.substring(uri.lastIndexOf('/') + 1);
      String fpath = "/home/dave/sync/coding/webdev/webgltest/render/verts/" + rfile;
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


}
