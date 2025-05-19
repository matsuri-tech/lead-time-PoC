import axios from 'axios';
import { Contact, Meeting } from '../types/m2m';
import { Tour } from '../types/slack';
import { sendSlackNotification } from '../clients/slackClient';   // ← 追加


const M2M_LOGIN_URL = 'https://api.m2msystems.cloud/login';
const M2M_CREATE_TOUR_URL = 'https://api-cleaning.m2msystems.cloud/v3/cleanings/create_with_placement';

const M2M_EMAIL = process.env.M2M_EMAIL!;
const M2M_PASSWORD = process.env.M2M_PASSWORD!;

// クリーンナIDなどは用途に応じて調整
//const TEST_CLEANER_IDS = ['4afd3785-5ae8-452f-b35f-d7df7db79674'];// task:f9afe0ee-424e-4eb8-b294-ae9ff20d4257
const ERROR_TEST_CLEANER_IDS = ['AAA'];
//const DEFAULT_CLEANER_IDS = ['f9afe0ee-424e-4eb8-b294-ae9ff20d4257'];// task:f9afe0ee-424e-4eb8-b294-ae9ff20d4257
const DEFAULT_PHOTO_TOUR_ID = '9f5af4d1-412f-4951-9692-061c698711b4';


  

export const makingTour = async (contact: Contact, meeting: Meeting): Promise<Tour> => {
  try {
    /* ===== ① ログイン & トークン取得 ===== */
    const loginRes = await axios.post(M2M_LOGIN_URL, {
      email: M2M_EMAIL,
      password: M2M_PASSWORD,
    });
    const token = loginRes.data.accessToken;
    if (!token) throw new Error('M2M APIトークン取得に失敗');

    /* ===== ② Payload 準備 ===== */
    const cleaningDate = meeting.properties.hs_meeting_start_time_jst.split(' ')[0];
    const payload = {
      placement:   'listing',
      listingId:   contact.properties.listing_id,
      cleaningDate,
      note:        'リードタイムPoC',
      cleaners:    ERROR_TEST_CLEANER_IDS,
      submissionId: contact.properties.submission_id,
      photoTourId: DEFAULT_PHOTO_TOUR_ID,
    };

    /* ===== ③ ツアー作成リクエスト ===== */
    const res = await axios.post(M2M_CREATE_TOUR_URL, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // 成功判定
    if (res.status !== 200 || res.data?.error) {
      throw new Error(`ツアー作成に失敗: ${JSON.stringify(res.data)}`);
    }

    console.log('✅ ツアー作成成功');
    return res.data as Tour;
  } catch (err: any) {
    /* ===== ④ 失敗時は Slack へ通知 ===== */

    // ターミナルログ出力
  console.error('❌ makingTour failed:', {
    message: err?.message,
    response: err?.response?.data,
    status: err?.response?.status,
  });

    const message = [
      '🚨 *リードタイムPoCのツアー作成に失敗しました*',
      `• Error: \`${err.message ?? err}\``,
      `• ListingID: ${contact.properties?.listing_id ?? 'n/a'}`,
      `• SubmissionID: ${contact.properties.submission_id ?? 'n/a'}`,
    ].join('\n');

    try {
      await sendSlackNotification(message);
    } catch (notifyErr) {
      console.error('Slack 通知も失敗:', notifyErr);
    }

    // 呼び出し元にもエラーを返す
    throw err;
  }
};
