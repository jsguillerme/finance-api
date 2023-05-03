import Fastify from "fastify";
import cors from '@fastify/cors';
import { AppRoutes } from "./routes";

const app = Fastify();
app.register(cors, {
  origin: '*'
});
app.register(AppRoutes);

app.listen({port: 9999}, () => {
  console.log('server is running on port 9999');
});