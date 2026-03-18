const net = require('net');

const client = net.connect(
  { port: 3000, host: 'localhost' },
  () => {
    console.log('Conectado ao servidor!');
    client.write('Olá, servidor!');
  }
);

client.on('data', (data) => {
  console.log('Resposta:', data.toString());
  client.end();
});

client.on('error', (err) => {
  console.error('Erro:', err.message);
});

client.on('close', () => {
  console.log('Conexão encerrada.');
});

