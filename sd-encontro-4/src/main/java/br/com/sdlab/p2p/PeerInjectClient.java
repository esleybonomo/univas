package br.com.sdlab.p2p;

import br.com.sdlab.common.KvCodec;
import br.com.sdlab.common.Message;

import java.io.PrintWriter;
import java.net.Socket;
import java.nio.charset.StandardCharsets;

public class PeerInjectClient {
    // args: host port nodeId type value
    public static void main(String[] args) throws Exception {
        String host = (args.length >= 1) ? args[0] : "localhost";
        int port = (args.length >= 2) ? Integer.parseInt(args[1]) : 10001;
        String nodeId = (args.length >= 3) ? args[2] : "sensor-1";
        String type = (args.length >= 4) ? args[3] : "TEMP";
        String value = (args.length >= 5) ? args[4] : "27.3";

        // origin aqui pode ser "INJECT"
        Message m = Message.newP2p("INJECT", nodeId, type, value, 5);

        try (Socket s = new Socket(host, port);
             PrintWriter out = new PrintWriter(s.getOutputStream(), true, StandardCharsets.UTF_8)) {
            out.println(KvCodec.encode(m));
        }
        System.out.println("[inject] sent " + m);
    }
}