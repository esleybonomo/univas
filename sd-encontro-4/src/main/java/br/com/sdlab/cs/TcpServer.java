package br.com.sdlab.cs;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;

import br.com.sdlab.cs.ClientHandler;

public class TcpServer {
    public static void main(String[] args) throws Exception {
        int port = (args.length >= 1) ? Integer.parseInt(args[0]) : 9000;

        System.out.println("[server] starting on port " + port);

        // TODO (Aula 1): criar ServerSocket e loop accept
        // Para cada conexão: criar ClientHandler e rodar em uma Thread
        
    }
}