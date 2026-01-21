import { app } from './app';
import { env } from './config/env';

app.listen(env.app.port, () => {
  console.info(`http://localhost:${env.app.port}`);
});