# SD Lab — Semana 2 (Encontro 2): Cliente-Servidor e P2P (TCP)

Este laboratório continua o tema “Arquiteturas de Sistemas Distribuídos” com prática em Java:

**Bloco 1**: Cliente-servidor (centralizado): sensores simulados → servidor TCP
**Bloco 2**: P2P (peers): propagação simples (gossip) com prevenção básica de loop

## Pré-requisitos
- Java 17+
- Maven 3.8+
- Git

Verifique:

```bash
java -version
mvn -version
git --version
```

## Estrutura do projeto

```
sd-encontro-3/
  README.md
  pom.xml
  src/main/java/br/com/sdlab/
    common/
      KvCodec.java
      Message.java
    cs/
      TcpServer.java
      ClientHandler.java
      SensorClient.java
    p2p/
      PeerNode.java
      PeerHandler.java
      PeerInjectClient.java
```

## Como compilar

`mvn -q -DskipTests package`

## Bloco 1 — Rodar Servidor e Sensores (Cliente-Servidor)

### Servidor (porta 9000)

`mvn -q exec:java -Dexec.mainClass='br.com.sdlab.cs.TcpServer' -Dexec.args='9000'`

### Sensores (abra 2+ terminais)

```bash
mvn -q exec:java -Dexec.mainClass='br.com.sdlab.cs.SensorClient' -Dexec.args='sensor-1 localhost 9000'
mvn -q exec:java -Dexec.mainClass='br.com.sdlab.cs.SensorClient' -Dexec.args='sensor-2 localhost 9000'
```

#### O que observar
- Logs intercalados no servidor (concorrência)
- Se o servidor cair, os clientes falham (SPOF)


## Bloco 2 — Rodar 3 Peers (P2P com gossip simples)

Suba 3 peers (3 terminais):

### Peer A (porta 10001, vizinho B)

`mvn -q exec:java -Dexec.mainClass='br.com.sdlab.p2p.PeerNode' -Dexec.args='A 10001 localhost:10002'`

### Peer B (porta 10002, vizinhos A e C)

`mvn -q exec:java -Dexec.mainClass='br.com.sdlab.p2p.PeerNode' -Dexec.args='B 10002 localhost:10001,localhost:10003'`

### Peer C (porta 10003, vizinho B)

`mvn -q exec:java -Dexec.mainClass='br.com.sdlab.p2p.PeerNode' -Dexec.args='C 10003 localhost:10002'`

### Injetar uma mensagem no Peer A

Em outro terminal:

`mvn -q exec:java -Dexec.mainClass='br.com.sdlab.p2p.PeerInjectClient' -Dexec.args='localhost 10001 sensor-1 TEMP 27.3'`

#### O que observar
- Mensagem aparece em A, depois em B e C
- Prevenção de loop por messageId + cache de vistos
- TTL limita propagação

### Formato de mensagem (line-delimited)

Cada linha é um payload `key=value;...`: Exemplo: `id=...;origin=A;node=sensor-1;type=TEMP;value=27.3;ts=...;ttl=5`

### Atividades para treinamento
1. Implementar TODOs no código
2. Evidência (log/print):

- 2 sensores enviando ao servidor
- 3 peers propagando uma mensagem

### pom.xml (mínimo, com exec plugin)
Crie/ajuste seu `pom.xml` assim (exemplo pronto):

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>br.com.sdlab</groupId>
  <artifactId>sd-lab-semana2</artifactId>
  <version>1.0.0</version>

  <properties>
    <maven.compiler.release>17</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <build>
    <plugins>
      <plugin>
        <groupId>org.codehaus.mojo</groupId>
        <artifactId>exec-maven-plugin</artifactId>
        <version>3.3.0</version>
      </plugin>
    </plugins>
  </build>
</project>
```

## Esqueleto de código (com TODOs)
Crie os arquivos abaixo. O objetivo é que os alunos preencham **TODOs pequenos e localizados**.

`br/com/sdlab/common/Message.java`

```java
package br.com.sdlab.common;

import java.util.Objects;
import java.util.UUID;

public class Message {
    public final String id;       // messageId (UUID)
    public final String origin;   // peerId ou "server"
    public final String node;     // sensorId
    public final String type;     // TEMP | STOCK | etc.
    public final String value;    // "27.3"
    public final long ts;         // epoch millis
    public final int ttl;         // usado no P2P (gossip)

    public Message(String id, String origin, String node, String type, String value, long ts, int ttl) {
        this.id = id;
        this.origin = origin;
        this.node = node;
        this.type = type;
        this.value = value;
        this.ts = ts;
        this.ttl = ttl;
    }

    public static Message newClientServer(String node, String type, String value) {
        return new Message(UUID.randomUUID().toString(), "server", node, type, value, System.currentTimeMillis(), 0);
    }

    public static Message newP2p(String originPeer, String node, String type, String value, int ttl) {
        return new Message(UUID.randomUUID().toString(), originPeer, node, type, value, System.currentTimeMillis(), ttl);
    }

    @Override
    public String toString() {
        return "Message{" +
                "id='" + id + '\'' +
                ", origin='" + origin + '\'' +
                ", node='" + node + '\'' +
                ", type='" + type + '\'' +
                ", value='" + value + '\'' +
                ", ts=" + ts +
                ", ttl=" + ttl +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Message)) return false;
        Message other = (Message) o;
        return Objects.equals(this.id, other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
```

`br/com/sdlab/common/KvCodec.java`

```java
package br.com.sdlab.common;

import java.util.HashMap;
import java.util.Map;

public class KvCodec {
    // Formato: key=value;key=value;...
    public static String encode(Message m) {
        // TODO (Aula 1): montar uma linha no formato key=value;... com os campos do Message
        // Dica: id=...;origin=...;node=...;type=...;value=...;ts=...;ttl=...
        return null;
    }

    public static Message decode(String line) {
        // TODO (Aula 1): parsear a linha key=value;... para um Map e montar Message
        // Dica: split por ';' e depois split por '=' (apenas no primeiro '=')
        return null;
    }

    static Map<String, String> parse(String line) {
        Map<String, String> map = new HashMap<>();
        if (line == null || line.isBlank()) return map;

        String[] parts = line.split(";");
        for (String p : parts) {
            String part = p.trim();
            if (part.isEmpty()) continue;

            int idx = part.indexOf('=');
            if (idx < 0) continue;

            String k = part.substring(0, idx).trim();
            String v = part.substring(idx + 1).trim();
            map.put(k, v);
        }
        return map;
    }
}
```

## Bloco 1 — Cliente-Servidor

`br/com/sdlab/cs/TcpServer.java`

```java
package br.com.sdlab.cs;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;

public class TcpServer {
    public static void main(String[] args) throws Exception {
        int port = (args.length >= 1) ? Integer.parseInt(args[0]) : 9000;

        System.out.println("[server] starting on port " + port);

        // TODO (Aula 1): criar ServerSocket e loop accept
        // Para cada conexão: criar ClientHandler e rodar em uma Thread
    }
}
```

`br/com/sdlab/cs/ClientHandler.java`

```java
package br.com.sdlab.cs;

import br.com.sdlab.common.KvCodec;
import br.com.sdlab.common.Message;

import java.io.BufferedReader;
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
```

`br/com/sdlab/cs/SensorClient.java`

```java
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
        // Em loop: gerar value (ex.: 20.0 a 35.0), criar Message.newClientServer e enviar (encode + println)
        // Dormir 1000ms
        // Obs.: tratar quebra de conexão (o servidor pode cair)
    }
}
```

## Bloco 2 — P2P

`br/com/sdlab/p2p/PeerNode.java`

```java
package br.com.sdlab.p2p;

import br.com.sdlab.common.KvCodec;
import br.com.sdlab.common.Message;

import java.net.ServerSocket;
import java.net.Socket;
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
            List<HostPort> list = new ArrayList&lt;>();
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
```

`br/com/sdlab/p2p/PeerHandler.java`

```java
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
        String from = socket.getRemoteSocketAddress().toString();
        try {
            // TODO (Aula 2): ler UMA linha (ou várias) e decodificar
            // Chamar node.onMessage(msg, from)
        } catch (Exception e) {
            System.out.println("[" + node.peerId() + "] handler error: " + e.getMessage());
        } finally {
            try { socket.close(); } catch (Exception ignored) {}
        }
    }
}
```

`br/com/sdlab/p2p/PeerInjectClient.java`

```java
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
```