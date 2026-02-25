package br.com.sdlab.p2p;

import br.com.sdlab.common.KvCodec;
import br.com.sdlab.common.Message;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.Socket;
import java.nio.charset.StandardCharsets;

public class PeerHandler implements Runnable {
    private final PeerNode node;
    private final Socket socket;

    public PeerHandler(PeerNode node, Socket socket) {
        this.node = node;
        this.socket = socket;
    }

    @Override
    public void run() {
        String from = socket.getInetAddress().getHostAddress() + ":" + socket.getPort();
        try {
            // TODO (Aula 2): ler UMA linha (ou várias) e decodificar
            // Chamar node.onMessage(msg, from)
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
            String line = in.readLine();
            if (line != null) {
                Message m = KvCodec.decode(line);
                node.onMessage(m, from);
            }
        } catch (Exception e) {
            System.out.println("[" + node.peerId() + "] handler error: " + e.getMessage());
        } finally {
            try { socket.close(); } catch (Exception ignored) {}
        }
    }
}