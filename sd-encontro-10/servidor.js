const net = require('net');

const server = net.createServer((socket) => {
    console.log('Cliente conectado!');

    //   socket.on('data', (data) => {
    //     console.log('Recebido:', data.toString());
    //     socket.write('Eco: ' + data);
    //   });

    socket.on('data', (data) => {
        const msg = data.toString().trim();

        if (msg === 'PING') {
            socket.write('PONG\n');

        } else if (msg === 'HORA') {
            const hora = new Date().toISOString();
            socket.write(`HORA:${hora}\n`);

        } else {
            socket.write('ERRO:COMANDO_DESCONHECIDO\n');
        }
    });


    socket.on('close', () => {
        console.log('Cliente desconectado.');
    });
});

server.listen(3000, () => {
    console.log('Servidor ouvindo na porta 3000');
});
