// src/services/hubspotWebhookService.ts
import { sendSlackMessage } from '../clients/slackClient';
import { saveToDatabase }   from '../clients/dbClient';
import { fetchMeeting, fetchContact } from '../clients/hubspotClient';
import { makingTour }       from '../clients/m2mClient';
import { sendSlackNotification }       from '../clients/slackClient';

export const processWebhook = async (objectId: string) => {
  /* ---------- ① HubSpot から詳細取得 ---------- */
  const meeting   = await fetchMeeting(objectId);
  const contactId = meeting.associations?.contacts?.results?.[0]?.id;
  if (!contactId) throw new Error('No associated contact found');

  const contact   = await fetchContact(contactId);

  /* ---------- ② ツアー作成を試行 ---------- */
  let cleaningId: string | null = null;
  let tourError: any = null;

  try {
    cleaningId = await makingTour(contact, meeting); // ← Tour オブジェクト
                                // ★ ID 文字列だけ取り出す
  } catch (err) {
    tourError = err;
    console.error('makingTour failed:', err);
  }

  /* ---------- ③ Slack 通知（必ず実行） ---------- */
  await sendSlackMessage(contact, meeting, cleaningId, tourError);
  // sendSlackMessage のシグネチャ:
  // (contact, meeting, cleaningId: string | null, error?: any)
  if (tourError) {
    /* 失敗時は別チャンネルにも詳細を飛ばす --------------- */
    const errorMessage = `
  <!subteam^S05NVPXMSNP>
  ❌ ツアー作成に失敗しました
  \`${tourError?.message ?? 'unknown error'}\`
  
  👤 *ゲスト情報*
  - Contact-ID : ${contact.id ?? contactId ?? '不明'}
  - 予約コード : ${contact.properties.reservation_code  ?? '不明'}
  - Submission-ID : ${contact.properties.submission_id    ?? '不明'}
  - 物件 ID     : ${contact.properties.listing_id       ?? '不明'}
  `;
  
    await sendSlackNotification(errorMessage.trim());
  }

  /* ---------- ④ DB 保存 ---------- */
  await saveToDatabase({
    meeting,
    contact,
    cleaningId,   // 成功時は ID、失敗時は null
    tourError     // 失敗詳細（null なら成功）
  });
};
