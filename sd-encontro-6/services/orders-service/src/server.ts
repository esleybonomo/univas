import app from './app';

const PORT = 3003;

app.listen(PORT, () => {
  console.log(`🚀 Orders Service rodando em http://localhost:${PORT}`);
});
