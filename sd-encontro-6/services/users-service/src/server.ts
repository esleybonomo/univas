import { createApp } from "./app";

// Define a porta do serviço, usando variável de ambiente ou padrão 3001
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const app = createApp(); // Cria a aplicação Express

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`[users-service] running on http://localhost:${PORT}`);
});
