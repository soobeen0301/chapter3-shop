import express from 'express';
import connect from './src/schemas/index.js';
import productsRouter from './src/routers/products.router.js';
import dotenv from 'dotenv';

const app = express();
const PORT = 3000;

connect();

dotenv.config();
// console.log(process.env.DB_HOST);
// console.log(process.env.DB_PORT);
// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASSWORD);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = express.Router();

router.get('/', (req, res) => {
  return res.json({ message: 'Hi!' });
});

app.use('/api', productsRouter);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
