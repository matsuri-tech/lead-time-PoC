import axios from 'axios';
import { Contact, Meeting } from '../types/m2m';
import { Tour } from '../types/slack';


const M2M_LOGIN_URL = 'https://api.m2msystems.cloud/login';
const M2M_CREATE_TOUR_URL = 'https://api-cleaning.m2msystems.cloud/v3/cleanings/create_with_placement';

const M2M_EMAIL = process.env.M2M_EMAIL!;
const M2M_PASSWORD = process.env.M2M_PASSWORD!;

// クリーンナIDなどは用途に応じて調整
const TEST_CLEANER_IDS = ['4afd3785-5ae8-452f-b35f-d7df7db79674'];// task:f9afe0ee-424e-4eb8-b294-ae9ff20d4257
//const DEFAULT_CLEANER_IDS = ['f9afe0ee-424e-4eb8-b294-ae9ff20d4257'];// task:f9afe0ee-424e-4eb8-b294-ae9ff20d4257
const DEFAULT_PHOTO_TOUR_ID = '9f5af4d1-412f-4951-9692-061c698711b4';


  

export const makingTour = async (contact: Contact, meeting: Meeting): Promise<Tour> => {
  // M2Mトークン取得
  const loginResponse = await axios.post(M2M_LOGIN_URL, {
    email: M2M_EMAIL,
    password: M2M_PASSWORD,
  });
  console.log('レスポンス内容:', loginResponse.data); // ← ここ追加
  

  const token = loginResponse.data.accessToken;
  if (!token) throw new Error('M2M APIトークン取得に失敗');
  const meetingStart = meeting.properties.hs_meeting_start_time_jst;
  console.log('🧪 hs_meeting_start_time_jst:', meeting.properties.hs_meeting_start_time_jst);

  const cleaningDate = meetingStart.split(' ')[0];


  // ペイロード構築
  const payload = {
    placement:'listing',
    listingId: contact.properties.listing_id, // 'c6a768e5-d0ca-461f-92b7-8573496f7481', // テスト用
    cleaningDate: cleaningDate, 
    note: `リードタイムPoC`,
    cleaners: TEST_CLEANER_IDS,
    submissionId: contact.properties.submission_id,
    photoTourId: DEFAULT_PHOTO_TOUR_ID,
  };
// ツアー作成リクエストの直前に追加
console.log('📦 M2Mに送信するpayload:', JSON.stringify(payload, null, 2));

  // ツアー作成リクエスト
  const response = await axios.post(M2M_CREATE_TOUR_URL, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  console.log("response"+response.data);

  if (response.status !== 200 || response.data?.error) {
    throw new Error(`ツアー作成に失敗: ${JSON.stringify(response.data)}`);
  }

  console.log('✅ ツアー作成成功');
  return response.data;
};
