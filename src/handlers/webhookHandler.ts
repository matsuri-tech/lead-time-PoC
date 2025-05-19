// src/handlers/webhookHandler.ts
import { Request, Response } from 'express';
import { processWebhook } from '../services/hubspotWebhookService';
import { sendSlackNotification } from '../clients/slackClient';

const MEETINGS_TYPE_ID        = '0-47';
const CHANGE_SOURCE_MEETINGS  = 'MEETINGS';

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const events = Array.isArray(req.body) ? req.body : [req.body];

    for (const ev of events) {
      const { subscriptionType, objectTypeId, objectId, changeSource } = ev;

      /* ── ① イベントフィルタ ───────────────── */
      if (
        subscriptionType !== 'object.creation' ||
        objectTypeId      !== MEETINGS_TYPE_ID  ||
        changeSource      !== CHANGE_SOURCE_MEETINGS
      ) {
        console.log(`⏩ Ignored: ${subscriptionType} / ${objectTypeId ?? 'n/a'}`);
        continue;                       // 次のイベントへ
      }
      if (!objectId) {
        console.warn('⚠️ objectId missing');
        continue;
      }

      /* ── ② 個別イベント処理 ───────────────── */
      try {
        console.log('📩 Meeting created. objectId:', objectId);
        await processWebhook(String(objectId));
      } catch (err: any) {
        /* ツアー作成や DB 保存が失敗したときだけここに来る */
        console.error('processWebhook failed:', err);

        // ここで 1 回だけ Slack 通知（重複が気にならなければそのまま）
        await sendSlackNotification(
          `🚨 Tour 作成エラー\n• objectId: ${objectId}\n• message: ${err.message ?? err}`
        );

        // ★ エラーを外に投げず握りつぶす → ループ継続
      }
    }

    /* ── ③ すべてのイベントを処理し終わったら ───────────────── */
    res.status(204).end();              // 成功応答 ⇒ HubSpot はリトライしない

  } catch (err) {
    /* フィルタ処理や JSON 解析で想定外の例外が起きたときのみ 500 */
    console.error('❌ Webhook handler fatal error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
