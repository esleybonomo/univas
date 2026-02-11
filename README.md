# README — Encontro 2 (Semana 1) — Docker + Spring Boot + WebClient (Service A ↔ Service B)

Este guia monta **do zero** dois serviços Spring Boot (**service-a** e **service-b**), com **REST**, **Swagger/OpenAPI**, **testes locais**, **integração via WebClient** e **subida via Docker Compose**.

---

## 1) Requisitos (instalação)

### 1.1 Java 17 (JDK)
**Opção recomendada (cross-platform):** Eclipse Temurin 17 (Adoptium)

1. Baixe o JDK 17:  
   - https://adoptium.net/temurin/releases/?version=17
2. Instale.
3. Verifique no terminal:

```bash
java -version
```

Resultado esperado: algo como `openjdk version "17.x"`.

> **Windows (dica):** se tiver múltiplos JDKs, configure `JAVA_HOME` e ajuste o `Path`.

---

### 1.2 Maven
Você pode usar Maven instalado **ou** usar Maven Wrapper (recomendado).

**Opção A — Maven instalado**
1. Baixe: https://maven.apache.org/download.cgi  
2. Instale e configure `MAVEN_HOME` e `Path`.
3. Verifique:

```bash
mvn -v
```

**Opção B — Maven Wrapper (recomendado)**
Se você gerar o projeto no Spring Initializr, pode rodar com `./mvnw` (Linux/macOS) ou `mvnw.cmd` (Windows) sem instalar Maven globalmente.

---

### 1.3 Docker + Docker Compose
**Windows/macOS:** instale Docker Desktop  
- https://www.docker.com/products/docker-desktop/

**Linux:** instale Docker Engine + Compose Plugin  
- https://docs.docker.com/engine/install/

Verifique:

```bash
docker --version
docker compose version
```

---

### 1.4 IDE (opcional, mas recomendado)
- VS Code

---

## 2) Criando os serviços no Spring Initializr (spring.io)

Vamos criar **2 projetos** separados.

### 2.1 Service B (service-b)
Acesse: https://start.spring.io/

Use:
- **Project:** Maven
- **Language:** Java
- **Spring Boot:** (versão estável atual)
- **Group:** `com.univas.sd`
- **Artifact:** `service-b`
- **Name:** `service-b`
- **Packaging:** Jar
- **Java:** 17

**Dependencies (selecione):**
- Spring Web
- Springdoc OpenAPI UI (se não aparecer, não tem problema — adicionaremos no `pom.xml`)

Clique em **Generate**, baixe o zip e extraia.

---

### 2.2 Service A (service-a)
Repita o processo para o `service-a`, com as mesmas configurações, mas com dependências:

**Dependencies:**
- Spring Web
- Spring WebFlux (para usar **WebClient**)
- Springdoc OpenAPI UI

Baixe e extraia.

---

## 3) Estrutura final recomendada de pastas

Crie uma pasta raiz e organize assim:

```text
sd-encontro-2/
  compose.yaml
  service-a/
  service-b/
```

Coloque os projetos extraídos dentro de `service-a/` e `service-b/`.

---

## 4) Configurando portas e propriedades

### 4.1 service-b — application.properties
Edite `service-b/src/main/resources/application.properties`:

```properties
server.port=8081
spring.application.name=service-b
```

### 4.2 service-a — application.properties
Edite `service-a/src/main/resources/application.properties`:

```properties
server.port=8080
spring.application.name=service-a

# URL do service-b dentro do Docker Compose
services.b.base-url=http://service-b:8081
```

> Em execução local fora do Docker, essa URL `service-b` não resolve.  
> Mais abaixo eu mostro como alternar para local facilmente.

---

## 5) Swagger / OpenAPI (Springdoc)

### 5.1 Dependência Springdoc (se não veio do Initializr)

No **service-a/pom.xml** e **service-b/pom.xml**, garanta:

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>2.5.0</version>
</dependency>
```

> Se você usar WebFlux “puro” nos controllers, existe starter específico.  
> Para este encontro, manter controllers MVC padrão com `@RestController` é o caminho mais simples.

---

## 6) Criando os endpoints REST

### 6.1 service-b — Controller
Crie `service-b/src/main/java/com/univas/sd/serviceb/api/BasicController.java`

```java
package com.univas.sd.serviceb.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BasicController {

    @GetMapping("/ping")
    public String ping() {
        return "pong-b";
    }

    @GetMapping("/slow")
    public String slow(@RequestParam(defaultValue = "1000") long ms) throws InterruptedException {
        Thread.sleep(ms);
        return "ok (slept " + ms + "ms)";
    }
}
```

---

### 6.2 service-a — WebClient Config
Crie `service-a/src/main/java/com/univas/sd/servicea/config/WebClientConfig.java`

```java
package com.univas.sd.servicea.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    WebClient serviceBWebClient(WebClient.Builder builder,
                                @Value("${services.b.base-url}") String baseUrl) {
        return builder.baseUrl(baseUrl).build();
    }
}
```

---

### 6.3 service-a — Cliente do service-b
Crie `service-a/src/main/java/com/univas/sd/servicea/client/ServiceBClient.java`

```java
package com.univas.sd.servicea.client;

import java.time.Duration;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@Component
public class ServiceBClient {

    private final WebClient webClient;

    public ServiceBClient(WebClient serviceBWebClient) {
        this.webClient = serviceBWebClient;
    }

    public Mono<String> ping() {
        return webClient.get()
                .uri("/ping")
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(2))
                .onErrorResume(ex -> Mono.just("fallback: B indisponível ou lento"));
    }

    public Mono<String> slow(long ms) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/slow")
                        .queryParam("ms", ms)
                        .build())
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(2))
                .onErrorResume(ex -> Mono.just("fallback: timeout ao chamar /slow"));
    }
}
```

---

### 6.4 service-a — Controller
Crie `service-a/src/main/java/com/univas/sd/servicea/api/CallBController.java`

```java
package com.univas.sd.servicea.api;

import com.univas.sd.servicea.client.ServiceBClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;

@RestController
public class CallBController {

    private final ServiceBClient client;

    public CallBController(ServiceBClient client) {
        this.client = client;
    }

    @GetMapping("/ping")
    public String ping() {
        return "pong-a";
    }

    @GetMapping("/call-b/ping")
    public Mono<String> callBPing() {
        return client.ping().map(resp -> "A recebeu de B: " + resp);
    }

    @GetMapping("/call-b/slow")
    public Mono<String> callBSlow(@RequestParam(defaultValue = "500") long ms) {
        return client.slow(ms).map(resp -> "A recebeu de B: " + resp);
    }
}
```

---

## 7) Build e testes locais (sem Docker)

### 7.1 Subir o service-b localmente
No terminal:

**Linux/macOS:**
```bash
cd service-b
./mvnw spring-boot:run
```

**Windows:**
```bat
cd service-b
mvnw.cmd spring-boot:run
```

Teste:
- `GET http://localhost:8081/ping`
- `GET http://localhost:8081/slow?ms=300`

Swagger:
- `http://localhost:8081/swagger-ui.html` (ou `/swagger-ui/index.html`)

---

### 7.2 Subir o service-a localmente (ajuste de URL para localhost)
Como o `services.b.base-url` está apontando para `service-b` (DNS do Docker), para rodar local você tem 2 opções:

**Opção A (mais simples no começo):** editar temporariamente no `service-a/application.properties`:

```properties
services.b.base-url=http://localhost:8081
```

Subir:

```bash
cd service-a
./mvnw spring-boot:run
```

Testes:
- `GET http://localhost:8080/ping`
- `GET http://localhost:8080/call-b/ping`
- `GET http://localhost:8080/call-b/slow?ms=500`

Swagger:
- `http://localhost:8080/swagger-ui.html` (ou `/swagger-ui/index.html`)

**Opção B (mais profissional): profiles**
Crie:
- `service-a/src/main/resources/application-local.properties`
- `service-a/src/main/resources/application-docker.properties`

**application-local.properties**
```properties
services.b.base-url=http://localhost:8081
```

**application-docker.properties**
```properties
services.b.base-url=http://service-b:8081
```

Rode local:
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

---

## 8) Dockerizando os serviços

### 8.1 Dockerfile do service-a
Crie `service-a/Dockerfile`:

```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
```

### 8.2 Dockerfile do service-b
Crie `service-b/Dockerfile`:

```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java","-jar","/app/app.jar"]
```

---

## 9) Subindo tudo no Docker Compose

Na raiz `sd-encontro-2/`, crie `compose.yaml`:

```yaml
services:
  service-b:
    build: ./service-b
    ports:
      - "8081:8081"

  service-a:
    build: ./service-a
    ports:
      - "8080:8080"
    depends_on:
      - service-b
    environment:
      - SPRING_PROFILES_ACTIVE=docker
```

> Se você não usar profiles, garanta que o `service-a` esteja com:
> `services.b.base-url=http://service-b:8081`

### Subir:
```bash
docker compose up --build
```

### Testar (no host):
- `GET http://localhost:8080/ping`
- `GET http://localhost:8080/call-b/ping`
- `GET http://localhost:8080/call-b/slow?ms=500`

Swagger:
- `http://localhost:8080/swagger-ui/index.html`
- `http://localhost:8081/swagger-ui/index.html`

Logs:
```bash
docker compose logs -f service-a
docker compose logs -f service-b
```

---

## 10) Testes de falha parcial (parte mais importante do Encontro 2)

1. Pare o B:
```bash
docker compose stop service-b
```

2. Chame:
- `GET http://localhost:8080/call-b/ping`

Resultado esperado: **fallback** (não travar).

3. Suba o B de novo:
```bash
docker compose start service-b
```

---

## 11) Troubleshooting rápido (erros comuns)

### Porta em uso
- Troque `server.port` e ajuste `compose.yaml` mapeando porta.

### “A não consegue chamar B”
- Verifique se A usa `http://service-b:8081` **no Docker**
- Lembre: `localhost` dentro do container é o próprio container.

### Swagger não abre
- Confirme dependência `springdoc-openapi-starter-webmvc-ui`
- Tente:
  - `/swagger-ui.html`
  - `/swagger-ui/index.html`

---

## 12) Critérios de pronto (Definition of Done) do lab
- `service-a` e `service-b` sobem no Docker Compose
- Swagger abre nos dois
- `service-a` chama `service-b` via WebClient usando DNS do compose
- Com `service-b` parado, `service-a` responde com fallback em até `2s`

---

Se você quiser, eu adapto este README para o seu repositório real já com:
- **nomes de pacotes padrão da sua turma**,  
- um domínio mais real (*Pedidos* → *Pagamentos*) mantendo a mesma complexidade,  
- e um `Makefile`/scripts (`run-local`, `run-docker`, `stop`, `logs`) para acelerar as aulas.
