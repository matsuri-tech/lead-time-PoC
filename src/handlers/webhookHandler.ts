import { Request, Response } from 'express';
import { processWebhook } from '../services/hubspotWebhookService';

const MEETINGS_TYPE_ID = '0-47';              // HubSpot Meetings の objectTypeId

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    // HubSpot は配列 or 単一オブジェクトの両方を送りうる
    const events = Array.isArray(req.body) ? req.body : [req.body];

    for (const ev of events) {
      const { subscriptionType, objectTypeId, objectId } = ev;

      // ★ 「object.creation」かつ Meetings 以外は無視
      if (
        subscriptionType !== 'object.creation' ||
        objectTypeId      !== MEETINGS_TYPE_ID
      ) {
        console.log(`⏩  Ignored event: ${subscriptionType} / ${objectTypeId ?? 'n/a'}`);
        continue;                               // 204 を返すので break しない
      }

      if (!objectId) {
        console.warn('⚠️  objectId missing');
        continue;
      }

      console.log('📩 Meeting created. objectId:', objectId);
      await processWebhook(String(objectId));   // 例：DB 保存や Slack 通知など
    }

    // 何も処理しなくても HubSpot へは 2xx を返す
    res.status(204).end();
  } catch (err) {
    console.error('❌ Webhook handler error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
