// src/handlers/webhookHandler.ts
import { Request, Response } from 'express';
import { processWebhook } from '../services/hubspotWebhookService';

const MEETINGS_TYPE_ID        = '0-47';
const CHANGE_SOURCE_MEETINGS  = 'MEETINGS';

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const events = Array.isArray(req.body) ? req.body : [req.body];

    for (const ev of events) {
      const { subscriptionType, objectTypeId, objectId, changeSource } = ev;
      if (
        subscriptionType !== 'object.creation' ||
        objectTypeId      !== MEETINGS_TYPE_ID ||
        changeSource      !== CHANGE_SOURCE_MEETINGS
      ) {
        continue;
      }
      if (!objectId) continue;

      // processWebhook 内で成功/失敗を完結
      await processWebhook(String(objectId));
    }

    // 常に 204 → HubSpot にリトライさせない
    res.status(204).end();
  } catch (err) {
    console.error('fatal error in handleWebhook:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

