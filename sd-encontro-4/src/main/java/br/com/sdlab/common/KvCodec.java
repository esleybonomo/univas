package br.com.sdlab.common;

import java.util.HashMap;
import java.util.Map;

public class KvCodec {
    // Formato: key=value;key=value;...
    public static String encode(Message m) {
        // TODO (Aula 1): montar uma linha no formato key=value;... com os campos do Message
        // Dica: id=...;origin=...;node=...;type=...;value=...;ts=...;ttl=...
        return "id=" + m.id + ";origin=" + m.origin + ";node=" + m.node + 
               ";type=" + m.type + ";value=" + m.value + ";ts=" + m.ts + ";ttl=" + m.ttl;
    }

    public static Message decode(String line) {
        // TODO (Aula 1): parsear a linha key=value;... para um Map e montar Message
        // Dica: split por ';' e depois split por '=' (apenas no primeiro '=')
        Map<String, String> map = parse(line);
        return new Message(
            map.get("id"),
            map.get("origin"),
            map.get("node"),
            map.get("type"),
            map.get("value"),
            Long.parseLong(map.get("ts")),
            Integer.parseInt(map.get("ttl"))
        );
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