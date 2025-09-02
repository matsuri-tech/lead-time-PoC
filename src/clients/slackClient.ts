import { ContactResponse as Contact }  from '../types/hubspot';
import { MeetingResponse as Meeting }  from '../types/hubspot';

const SLACK_TOKEN   = process.env.SLACK_TOKEN!;
const SLACK_CHANNEL_ID               =  'CDMDK9V96'//''C08F1E5BP9U; // TODO: 本番に差し替え
const SLACK_CHANNEL_FOR_NOTIFICATION = 'C08PD3ZNWHY'//C08F1E5BP9U'C08PD3ZNWHY'; // TODO: 本番に差し替え

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
    ? '✅ ゲストがフォームに回答しました！✅'
    : `💀 ゲストがフォームに回答しましたが、ツアーの作成に失敗しました💀`;

  const cleaningUrlAdmin   = success
    ? `https://manager-cleaning.m2msystems.cloud/operations/${cleaningId}`
    : '—';
  const cleaningUrlCleaner = success
    ? `https://cleaner-cleaning.m2msystems.cloud/operations/${cleaningId}`
    : '—';

  const fallbackText = `<!subteam^S05NVPXMSNP> ${head}`;

  /* ---------- Block Kit payload 構築 ---------- */
  const payload: Record<string, unknown> = {
    channel: SLACK_CHANNEL_ID,
    text: fallbackText,
    attachments: [
      {
        color: success ? "#2eb886" : "#ff6b6b",
        title: "フォーム回答",
        text: `ステータス: ${success ? '受付済み' : 'エラー'}`
      }
    ],
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: head, emoji: true }
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: `<!subteam^S05NVPXMSNP>\n以下の回答内容を確認して、対応項目を実施してください🏃` }
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: "*・対応項目*" }
      },
      {
        type: "rich_text",
        elements: [
          {
            type: "rich_text_list",
            style: "ordered",
            elements: success ? [
              {
                type: "rich_text_section",
                elements: [{ type: "text", text: "\"OP-配送-サポート便\"ツアーを作成" }]
              },
              {
                type: "rich_text_section", 
                elements: [{ type: "text", text: "時間を設定する" }]
              },
              {
                type: "rich_text_section",
                elements: [{ type: "text", text: "アサインする" }]
              },
              {
                type: "rich_text_section",
                elements: [{ type: "text", text: "ドライバーに連絡" }]
              }
            ] : [
              {
                type: "rich_text_section",
                elements: [{ type: "text", text: "\"OP-トラブル-サポート便\"ツアーを作成し、taskチームをアサインする" }]
              },
              {
                type: "rich_text_section",
                elements: [{ type: "text", text: "\"OP-配送-サポート便\"ツアーを作成" }]
              },
              {
                type: "rich_text_section",
                elements: [{ type: "text", text: "時間を設定する" }]
              },
              {
                type: "rich_text_section",
                elements: [{ type: "text", text: "アサインする" }]
              },
              {
                type: "rich_text_section",
                elements: [{ type: "text", text: "ドライバーに連絡" }]
              }
            ]
          }
        ]
      },
      { type: "divider" },

      {
        type: "section",
        text: { type: "mrkdwn", text: "*👤 ゲスト情報*" }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*🔅予約コード*\n${contact.properties.reservation_code ?? '不明'}` },
          { type: "mrkdwn", text: `*🔅Submission-ID*\n${contact.properties.submission_id ?? '不明'}` }
        ]
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*🔅物件ID*\n${contact.properties.listing_id ?? '不明'}` },
          { type: "mrkdwn", text: `*🔅姓名*\n${contact.properties.firstname ?? '不明'} ${contact.properties.lastname ?? ''}` }
        ]
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*🔅メールアドレス*\n<mailto:${contact.properties.email ?? 'none'}|${contact.properties.email ?? '未設定'}>` },
          { type: "mrkdwn", text: `*🔅Contact-ID*\n${contact.id ?? '不明'}` }
        ]
      },

      { type: "divider" },
      {
        type: "section",
        text: { type: "mrkdwn", text: "*✋ 希望する対応*" }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*🔅対応内容*\n${contact.properties.selection_amenity_or_cleaning_or_both2 ?? '未設定'}` },
          { type: "mrkdwn", text: `*🔅到着希望時間*\n開始: ${meeting.properties.hs_meeting_start_time_jst}\n終了: ${meeting.properties.hs_meeting_end_time_jst}` }
        ]
      },

      { type: "divider" },
      {
        type: "section",
        text: { type: "mrkdwn", text: "*🧹 再清掃希望詳細*" }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*🔅再清掃箇所*\n${contact.properties.cleaning_spot ?? '未設定'}` },
          { type: "mrkdwn", text: `*🔅同意事項*\n${contact.properties.rule2 ?? '未設定'}` }
        ]
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*🔅再清掃箇所の写真*\n${contact.properties.cleaning_photo ?? '未設定'}` },
          { type: "mrkdwn", text: `*🔅再清掃実施方法*\n${contact.properties.recleaning_type ?? '未設定'}` }
        ]
      },

      { type: "divider" },
      {
        type: "section",
        text: { type: "mrkdwn", text: "*🛌 アメニティ不備希望詳細*" }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*🔅シーツ枚数(ベッド用)*\n${contact.properties.bed_sheets ?? '未設定'}` },
          { type: "mrkdwn", text: `*🔅シーツ枚数(布団用)*\n${contact.properties.futon_sheets ?? '未設定'}` }
        ]
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*🔅掛け布団カバー枚数(ベッド・2段ベッド用)*\n${contact.properties.bed_duvet ?? '未設定'}` },
          { type: "mrkdwn", text: `*🔅布団掛け布団カバー枚数(布団用)*\n${contact.properties.futon_duvet ?? '未設定'}` }
        ]
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*🔅バスタオル枚数*\n${contact.properties.bathtowl ?? '未設定'}` },
          { type: "mrkdwn", text: `*🔅フェイスタオル枚数*\n${contact.properties.facetowl ?? '未設定'}` }
        ]
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*🔅アメニティ類*\n${contact.properties.amenity ?? '未設定'}` }
        ]
      },

      { type: "divider" },
      {
        type: "section",
        text: { type: "mrkdwn", text: "*🏃 その他希望詳細*" }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*🔅その他配送希望物品*\n${contact.properties.request ?? '未設定'}` },
          { type: "mrkdwn", text: `*🔅交換希望物品写真*\n${contact.properties.furniture_photo ?? '未設定'}` }
        ]
      },

      { type: "divider" },
      {
        type: "section",
        text: { type: "mrkdwn", text: "*👩‍💻 m2mへのURL*" }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: success ? `*🔅管理者画面*\n<${cleaningUrlAdmin}|リンク>` : `*🔅管理者画面*\n作成失敗` },
          { type: "mrkdwn", text: success ? `*🔅Cleaner 画面*\n<${cleaningUrlCleaner}|リンク>` : `*🔅Cleaner 画面*\n作成失敗` }
        ]
      }
    ]
  };

  // アクションボタンは成功時のみ追加
  if (success) {
    (payload.blocks as any[]).push({
      type: "actions",
      elements: [
        { type: "button", text: { type: "plain_text", text: "管理者画面を開く" }, url: cleaningUrlAdmin },
        { type: "button", text: { type: "plain_text", text: "Cleaner画面を開く" }, url: cleaningUrlCleaner }
      ]
    });
  }

  // エラー詳細を表示する場合
  if (!success && error) {
    (payload.blocks as any[]).push(
      { type: "divider" },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*❌ エラー詳細*\n\`\`\`${error?.message ?? 'unknown error'}\`\`\`` }
      }
    );
  }

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
export const sendSlackNotification = async (
  contact: Contact,
  _meeting: Meeting,
  error: any,
  _contactId: string
) => {
  // メイン通知と同じBlock Kit形式のペイロードを作成
  const head = '💀 ゲストがフォームに回答しましたが、ツアーの作成に失敗しました💀';
  
  const payload = {
    channel: SLACK_CHANNEL_FOR_NOTIFICATION,
    text: "エラー通知",
    attachments: [
      {
        color: "#ff6b6b",
        title: "フォーム回答",
        text: "ステータス: エラー"
      }
    ],
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: head, emoji: true }
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: `<!subteam^S05NVPXMSNP>\n以下の回答内容を確認して、対応項目を実施してください🏃` }
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: "*・対応項目*" }
      },
      {
        type: "rich_text",
        elements: [
          {
            type: "rich_text_list",
            style: "ordered",
            elements: [
              {
                type: "rich_text_section",
                elements: [{ type: "text", text: "\"OP-トラブル-サポート便\"ツアーを作成し、taskチームをアサインする" }]
              },
              {
                type: "rich_text_section",
                elements: [{ type: "text", text: "\"OP-配送-サポート便\"ツアーを作成" }]
              },
              {
                type: "rich_text_section",
                elements: [{ type: "text", text: "時間を設定する" }]
              },
              {
                type: "rich_text_section",
                elements: [{ type: "text", text: "アサインする" }]
              },
              {
                type: "rich_text_section",
                elements: [{ type: "text", text: "ドライバーに連絡" }]
              }
            ]
          }
        ]
      },
      { type: "divider" },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*⚠️ エラー詳細*\n\`${error?.message ?? 'unknown error'}\`` }
      },
      { type: "divider" },
      {
        type: "section",
        text: { type: "mrkdwn", text: "*👤 ゲスト情報*" }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*🔅予約コード*\n${contact.properties.reservation_code ?? '未設定'}` },
          { type: "mrkdwn", text: `*🔅Submission-ID*\n${contact.properties.submission_id ?? '未設定'}` }
        ]
      },
      {
        type: "section", 
        fields: [
          { type: "mrkdwn", text: `*🔅物件ID*\n${contact.properties.listing_id ?? '未設定'}` },
          { type: "mrkdwn", text: `*🔅姓名*\n${contact.properties.lastname ?? ''} ${contact.properties.firstname ?? ''}` }
        ]
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*🔅メールアドレス*\n<mailto:${contact.properties.email ?? ''}|${contact.properties.email ?? '未設定'}>` }
        ]
      }
    ]
  };

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
