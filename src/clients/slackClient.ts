import { ContactResponse as Contact }  from '../types/hubspot';
import { MeetingResponse as Meeting }  from '../types/hubspot';

const SLACK_TOKEN   = process.env.SLACK_TOKEN!;
const SLACK_CHANNEL_ID               = 'C08F1E5BP9U'; // TODO: 本番に差し替え
const SLACK_CHANNEL_FOR_NOTIFICATION = 'C08F1E5BP9U'; // TODO: 本番に差し替え

/* ------------------------------------------------------------------ */
/* 1) メイン通知                                                      */
/* ------------------------------------------------------------------ */
export const sendSlackMessage = async (
  contact: Contact,
  meeting: Meeting,
  cleaningId: string | null,   // ★ Tour → string | null
  error?: any                  // ★ 失敗詳細があれば渡す
): Promise<void> => {
  /* ---------- 文面を組み立て ---------- */
  const success = !!cleaningId;    // null / undefined / '' をすべて失敗扱い
  const head    = success
    ? '✅ ツアーを作成しました！'
    : `❌ ツアー作成に失敗しました\n\`${error?.message ?? 'unknown error'}\``;

  const cleaningUrlAdmin   = success
    ? `https://manager-cleaning.m2msystems.cloud/operations/${cleaningId}`
    : '—';
  const cleaningUrlCleaner = success
    ? `https://cleaner-cleaning.m2msystems.cloud/operations/${cleaningId}`
    : '—';

    const text = `
    <!subteam^S05NVPXMSNP>
    ${head}
    
    👤 *ゲスト情報*
    - 予約コード: ${contact.properties.reservation_code ?? '不明'} 
    - Submission-ID: ${contact.properties.submission_id ?? '不明'} 
    - 物件 ID: ${contact.properties.listing_id ?? '不明'} 
    - 名前: ${contact.properties.firstname ?? '不明'} ${contact.properties.lastname ?? ''}
    - メール: ${contact.properties.email ?? '未設定'}
    
    ✋ *希望する対応*
    - 希望する対応: ${contact.properties.selection_amenity_or_cleaning_or_both ?? '未設定'}
    - 再清掃箇所: ${contact.properties.cleaning_spot ?? '未設定'}
    - 再清掃箇所の写真: ${contact.properties.cleaning_photo ?? '未設定'}
    - 同意事項: ${contact.properties.rule ?? '未設定'}
    - 希望する再清掃実施方法: ${contact.properties.recleaning_type ?? '未設定'}
    - リネン枚数: ${contact.properties.sheets ?? '未設定'}
    - 掛け布団カバー枚数: ${contact.properties.dubet ?? '未設定'}
    - バスタオル枚数: ${contact.properties.bathtowl ?? '未設定'}
    - フェイスタオル枚数: ${contact.properties.facetowl ?? '未設定'}
    - 希望するアメニティ: ${contact.properties.amenity ?? '未設定'}
    - その他配送希望物品: ${contact.properties.request ?? '未設定'}
    - 交換希望物品写真: ${contact.properties.furniture_photo ?? '未設定'}
    
    📅 *到着希望時間*
    - 開始: ${meeting.properties.hs_meeting_start_time_jst}
    - 終了: ${meeting.properties.hs_meeting_end_time_jst}
    
    🔗 *M2M 管理画面リンク*
    - 管理者画面: ${cleaningUrlAdmin}
    - Cleaner 画面: ${cleaningUrlCleaner}
    `;

  /* ---------- Slack 送信 ---------- */
  const payload: Record<string, unknown> = {
    channel: SLACK_CHANNEL_ID,
    text,
  };

  const threadTs = contact.properties.slack_thread;
  if (threadTs) payload.thread_ts = threadTs;   // ts があるときだけスレッド化

  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SLACK_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!data.ok) throw new Error(`Slack送信失敗: ${data.error}`);
};

/* ------------------------------------------------------------------ */
/* 2) 汎用ワンショット通知                                            */
/* ------------------------------------------------------------------ */
export const sendSlackNotification = async (text: string) => {
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SLACK_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: SLACK_CHANNEL_FOR_NOTIFICATION,
      text,
    }),
  });

  const data = await res.json();
  if (!data.ok) throw new Error(`Slack送信失敗: ${data.error}`);
};
