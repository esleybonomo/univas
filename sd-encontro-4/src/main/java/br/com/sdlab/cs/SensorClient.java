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
        

    }
}