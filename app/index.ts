import express from 'express'
import routes from '../src/routes';
import cors from 'cors';
import { errorHandler } from '../src/middlewares/errorHandler';

import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api", routes)

app.use(errorHandler);

app.listen(process.env.PORT || 3000, () =>
  console.log(`Server ready at: http://localhost:${process.env.PORT || 3000}`),
)
