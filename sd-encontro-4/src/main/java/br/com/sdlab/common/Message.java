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