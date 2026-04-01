const net = require('net');

const client = net.connect(
    { port: 3000, host: 'localhost' },
    () => {
        console.log('Conectado ao servidor!');
        // client.write('Olá, servidor!');
        // client.write('{"acao":"ping","id":1}');
        // client.write('A'.repeat(10000));

        client.write(Buffer.from([0x48, 0x69]));

    }
);

client.on('data', (data) => {
    console.log('Resposta:', data.toString());
    client.end();
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

client.on('error', (err) => {
    console.error('Erro:', err.message);
    //implementar um retry ou algo do tipo
    sleep(5000).then(() => {
        console.log('Tentando reconectar...');
        client.connect({ port: 3000, host: 'localhost' });
    });
    
});

client.on('close', () => {
    console.log('Conexão encerrada.');
});

