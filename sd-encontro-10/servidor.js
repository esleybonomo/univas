const net = require('net');

const server = net.createServer((socket) => {
  console.log('Cliente conectado!');

  socket.on('data', (data) => {
    console.log('Recebido:', data.toString());
    socket.write('Eco: ' + data);
  });

  socket.on('close', () => {
    console.log('Cliente desconectado.');
  });
});

server.listen(3000, () => {
  console.log('Servidor ouvindo na porta 3000');
});
