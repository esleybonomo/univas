/**
 * Gera um ID simples e único para fins didáticos.
 * Não é um UUID robusto para produção, mas suficiente para o exemplo.
 */
export function newId(): string {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}
