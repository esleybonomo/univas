const net = require('net');
const readline = require('readline');

const client = net.connect({ port: 3000, host: 'localhost' }, () => {
  console.log('Conectado ao servidor!');
  console.log('Digite uma mensagem para enviar (ou "sair" para encerrar):');

  rl.prompt();
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on('line', (line) => {
  const message = line.trim();
  if (!message) {
    rl.prompt();
    return;
  }

  if (message.toLowerCase() === 'sair' || message.toLowerCase() === 'exit') {
    console.log('Encerrando cliente...');
    client.end();
    return;
  }

  client.write(message);
  rl.prompt();
});

client.on('data', (data) => {
  console.log('\nResposta do servidor:', data.toString());
  rl.prompt();
});

client.on('error', (err) => {
  console.error('Erro:', err.message);
});

client.on('close', () => {
  console.log('Conexão encerrada.');
  rl.close();
});

