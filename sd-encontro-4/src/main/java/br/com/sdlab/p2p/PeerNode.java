package br.com.sdlab.p2p;

import br.com.sdlab.common.KvCodec;
import br.com.sdlab.common.Message;

import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class PeerNode {
    private final String peerId;
    private final int listenPort;
    private final List<HostPort> neighbors;
    private final Set<String> seen = ConcurrentHashMap.newKeySet();

    public PeerNode(String peerId, int listenPort, List<HostPort> neighbors) {
        this.peerId = peerId;
        this.listenPort = listenPort;
        this.neighbors = neighbors;
    }

    public static void main(String[] args) throws Exception {
        // args: peerId listenPort neighbor1,neighbor2
        String peerId = (args.length >= 1) ? args[0] : "A";
        int port = (args.length >= 2) ? Integer.parseInt(args[1]) : 10001;
        String neigh = (args.length >= 3) ? args[2] : "";

        List<HostPort> neighbors = HostPort.parseList(neigh);
        PeerNode node = new PeerNode(peerId, port, neighbors);
        node.start();
    }

    public void start() throws Exception {
        System.out.println("[" + peerId + "] starting on port " + listenPort + " neighbors=" + neighbors);

        // TODO (Aula 2): iniciar ServerSocket e aceitar conexões
        // Para cada conexão: criar PeerHandler(this, socket) em Thread

    }

    public void onMessage(Message m, String from) {
        // TODO (Aula 2): implementar anti-loop:
        // - se já viu m.id: ignorar
        // - senão: marcar visto, logar, e se m.ttl > 0 reenviar com ttl-1 para vizinhos (exceto 'from')

    }

    public void sendToNeighbors(Message m, String exclude) {
        // TODO (Aula 2): para cada vizinho diferente de exclude:
        // - abrir Socket, enviar uma linha (KvCodec.encode), fechar
        // Dica: aqui pode ser "fire and forget" (sem manter conexão persistente)

    }

    public String peerId() { return peerId; }

    public record HostPort(String host, int port) {
        public static List<HostPort> parseList(String csv) {
            if (csv == null || csv.isBlank()) return List.of();
            String[] parts = csv.split(",");
            List<HostPort> list = new ArrayList<>();
            for (String p : parts) {
                String s = p.trim();
                if (s.isEmpty()) continue;
                String[] hp = s.split(":");
                list.add(new HostPort(hp[0], Integer.parseInt(hp[1])));
            }
            return list;
        }
        @Override public String toString() { return host + ":" + port; }
    }
}