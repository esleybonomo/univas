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
        Map<String, String> map = parse(line);
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