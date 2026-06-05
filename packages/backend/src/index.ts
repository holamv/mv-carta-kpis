import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(
    `[mv-quejas] API escuchando en http://localhost:${env.PORT} (${env.NODE_ENV})`,
  );
});
