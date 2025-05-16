import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
console.log('HUBSPOT_TOKEN:', process.env.HUBSPOT_API_TOKEN);
import { handleWebhook } from './handlers/webhookHandler';




const app = express();
app.use(express.json());

app.post('/webhook', handleWebhook);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});