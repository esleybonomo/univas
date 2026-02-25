package br.com.sdlab.cs;

import br.com.sdlab.common.KvCodec;
import br.com.sdlab.common.Message;

import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.Random;

public class SensorClient {
    public static void main(String[] args) throws Exception {
        String nodeId = (args.length >= 1) ? args[0] : "sensor-1";
        String host = (args.length >= 2) ? args[1] : "localhost";
        int port = (args.length >= 3) ? Integer.parseInt(args[2]) : 9000;

        Random rnd = new Random();

        System.out.println("[client " + nodeId + "] connecting to " + host + ":" + port);

        // TODO (Aula 1): abrir Socket e um PrintWriter (autoFlush=true)
        // Em loop: gerar value (ex.: 20.0 a 35.0), criar Message.newClientServer e
        // enviar (encode + println)
        // Dormir 1000ms
        // Obs.: tratar quebra de conexão (o servidor pode cair)
        Socket socket = null;
        try {
            socket = new Socket(host, port);
            System.out.println("[client " + nodeId + "] connected to server");
            PrintWriter writer = new PrintWriter(
                    new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8), true);
                    System.out.println("[client " + nodeId + "] writer created");
            while (true) {
                double value = 20.0 + rnd.nextDouble() * 15.0; // 20.0 a 35.0
                Message m = Message.newClientServer(nodeId, "TEMP", String.format("%.1f", value));
                System.out.println("[client " + nodeId + "] sending: " + m);
                writer.println(KvCodec.encode(m));
                Thread.sleep(1000);
            }
        } catch (Exception e) {
            System.out.println("[client " + nodeId + "] error: " + e.getMessage());
        } finally {
            try {
                if (socket != null) socket.close();
            } catch (Exception e) {
                System.out.println("[client " + nodeId + "] error closing socket: " + e.getMessage());
            }
        }

    }
}