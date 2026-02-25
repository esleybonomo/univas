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
        
    }
}