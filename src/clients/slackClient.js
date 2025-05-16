"use strict";
// src/clients/slackClient.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSlackMessage = void 0;
const SLACK_TOKEN = process.env.SLACK_TOKEN;
const SLACK_CHANNEL_ID = 'C08F1E5BP9U'; //本番変更必要
const sendSlackMessage = (contact, meeting, cleaning_id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    const thread_ts = contact.properties.slack_thread;
    const cleaning_id_value = cleaning_id;
    const cleaning_url_admin = `https://manager-cleaning.m2msystems.cloud/operations/${cleaning_id_value}`;
    const cleaning_url_cleaner = `https://cleaner-cleaning.m2msystems.cloud/operations/${cleaning_id_value}`;
    const text = `🧾 フォームに回答がありました！急いでツアーをつくってください🏃‍♀️

  

👤 *ゲスト情報*
- 予約コード: ${(_a = contact.properties.reservation_code) !== null && _a !== void 0 ? _a : '不明'} 
- submission-id: ${(_b = contact.properties.submission_id) !== null && _b !== void 0 ? _b : '不明'} 
- 物件id: ${(_c = contact.properties.listing_id) !== null && _c !== void 0 ? _c : '不明'} 

- 名前: ${(_d = contact.properties.firstname) !== null && _d !== void 0 ? _d : '不明'} ${(_e = contact.properties.lastname) !== null && _e !== void 0 ? _e : ''}
- メール: ${(_f = contact.properties.email) !== null && _f !== void 0 ? _f : '未設定'}

✋ *希望する対応*
- 希望する対応: ${(_g = contact.properties.selection_amenity_or_cleaning_or_both) !== null && _g !== void 0 ? _g : '未設定'}
- 再清掃箇所: ${(_h = contact.properties.cleaning_spot) !== null && _h !== void 0 ? _h : '未設定'}
- 再清掃箇所の写真: ${(_j = contact.properties.cleaning_photo) !== null && _j !== void 0 ? _j : '未設定'}
- 同意事項: ${(_k = contact.properties.rule) !== null && _k !== void 0 ? _k : '未設定'}
- 希望する再清掃実施方法: ${(_l = contact.properties.recleaning_type) !== null && _l !== void 0 ? _l : '未設定'}
- リネン枚数: ${(_m = contact.properties.sheets) !== null && _m !== void 0 ? _m : '未設定'}
- 掛け布団カバー枚数: ${(_o = contact.properties.dubet) !== null && _o !== void 0 ? _o : '未設定'}
- バスタオル枚数: ${(_p = contact.properties.bathtowl) !== null && _p !== void 0 ? _p : '未設定'}
- フェイスタオル枚数: ${(_q = contact.properties.facetowl) !== null && _q !== void 0 ? _q : '未設定'}
- 希望するアメニティ: ${(_r = contact.properties.amenity) !== null && _r !== void 0 ? _r : '未設定'}
- その他配送希望物品: ${(_s = contact.properties.request) !== null && _s !== void 0 ? _s : '未設定'}
- 交換希望物品写真: ${(_t = contact.properties.furniture_photo) !== null && _t !== void 0 ? _t : '未設定'}


📅 *到着希望時間*
- 開始: ${meeting.properties.hs_meeting_start_time_jst}
- 終了: ${meeting.properties.hs_meeting_end_time_jst}

🔗 *M2M管理画面リンク*
- 管理者画面: ${cleaning_url_admin}
- Cleaner画面: ${cleaning_url_cleaner}

`;
    const response = yield fetch("https://slack.com/api/chat.postMessage", {
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
    const data = yield response.json();
    if (!data.ok)
        throw new Error(`Slack送信失敗: ${data.error}`);
});
exports.sendSlackMessage = sendSlackMessage;
