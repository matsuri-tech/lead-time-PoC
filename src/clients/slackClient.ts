// src/clients/slackClient.ts

import { ContactResponse as Contact } from '../types/hubspot'; // ← slack.ts ではなくhubspotの型を使う
import { MeetingResponse as Meeting } from '../types/hubspot';
import { Tour } from '../types/slack';

const SLACK_TOKEN = process.env.SLACK_TOKEN!;

const SLACK_CHANNEL_ID = 'C08F1E5BP9U';//本番変更必要
const SLACK_CHANNEL_FOR_NOTIFICATION = 'C08F1E5BP9U'

export const sendSlackMessage = async (contact: Contact, meeting: Meeting, cleaning_id: Tour): Promise<void> => {
  const thread_ts = contact.properties.slack_thread;
  const cleaning_id_value = cleaning_id;

　const cleaning_url_admin = `https://manager-cleaning.m2msystems.cloud/operations/${cleaning_id_value}`;
　const cleaning_url_cleaner = `https://cleaner-cleaning.m2msystems.cloud/operations/${cleaning_id_value}`;

  
  const text = `
<!subteam^S05NVPXMSNP>
🧾 フォームに回答がありました！急いでツアーをつくってください🏃‍♀️  

👤 *ゲスト情報*
- 予約コード: ${contact.properties.reservation_code ?? '不明'} 
- submission-id: ${contact.properties.submission_id ?? '不明'} 
- 物件id: ${contact.properties.listing_id ?? '不明'} 

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

🔗 *M2M管理画面リンク*
- 管理者画面: ${cleaning_url_admin}
- Cleaner画面: ${cleaning_url_cleaner}

`;

  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SLACK_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: SLACK_CHANNEL_ID,
      text,
      thread_ts,
    }),
  });

  const data = await response.json();
  if (!data.ok) throw new Error(`Slack送信失敗: ${data.error}`);
};

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
