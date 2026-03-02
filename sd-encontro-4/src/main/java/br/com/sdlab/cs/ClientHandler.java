package br.com.sdlab.cs;

import br.com.sdlab.common.KvCodec;
import br.com.sdlab.common.Message;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.Socket;
import java.nio.charset.StandardCharsets;

public class ClientHandler implements Runnable {
    private final Socket socket;

    public ClientHandler(Socket socket) {
        this.socket = socket;
    }

    @Override
    public void run() {
        String remote = socket.getRemoteSocketAddress().toString();
        System.out.println("[server] connected: " + remote);

        // TODO (Aula 1): ler linhas do socket (BufferedReader) até EOF
        // Para cada linha: decode -> Message e logar no console
        // Dica: new BufferedReader(new InputStreamReader(socket.getInputStream(), UTF_8))
        // Ao final: fechar socket em finally
        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
            System.out.println("[server] reader created for " + remote);
            String line;
            while ((line = reader.readLine()) != null) {
                Message m = KvCodec.decode(line);
                System.out.println("[server] received: " + m);
            }
        } catch (Exception e) {
            System.out.println("[server] error handling client: " + e.getMessage());
        } finally {
            try {
                socket.close();
            } catch (IOException e) {
                System.out.println("[server] error closing socket: " + e.getMessage());
            }
        }
    }
}