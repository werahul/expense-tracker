import app from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`Expense tracker API listening on port ${env.PORT}`);
});
