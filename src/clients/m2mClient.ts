// src/clients/m2mClient.ts
import axios from 'axios';
import { Contact } from '../types/m2m';


const M2M_LOGIN_URL        = 'https://api.m2msystems.cloud/login';
const M2M_CREATE_TOUR_URL  = 'https://api-cleaning.m2msystems.cloud/v3/cleanings/create_with_placement';

const { M2M_EMAIL, M2M_PASSWORD } = process.env;

const DEFAULT_CLEANER_IDS   = ['f9afe0ee-424e-4eb8-b294-ae9ff20d4257']; // ✅ 本番用 ID に戻す
const DEFAULT_PHOTO_TOUR_ID = '9f5af4d1-412f-4951-9692-061c698711b4';

export const makingTour = async (contact: Contact): Promise<string> => {
  /* ===== ① ログイン ===== */
  const loginRes = await axios.post(M2M_LOGIN_URL, {
    email: M2M_EMAIL!,
    password: M2M_PASSWORD!,
  });
  const token = loginRes.data.accessToken;
  if (!token) throw new Error('M2M APIトークン取得に失敗');

  /* ===== ② Payload ===== */
  const cleaningDate = new Date().toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\//g, '-');
  console.log('[makingTour] cleaningDate =', cleaningDate);
  const payload = {
    placement:   'listing',
    listingId:   contact.properties.listing_id,
    cleaningDate,
    note:        `リードタイムPoC + ${contact.properties.submission_id}`,
    cleaners:    DEFAULT_CLEANER_IDS,
    submissionId: contact.properties.submission_id,
    photoTourId: DEFAULT_PHOTO_TOUR_ID,
  };

  /* ===== ③ リクエスト ===== */
  const res = await axios.post(M2M_CREATE_TOUR_URL, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status !== 200 || res.data?.error) {
    throw new Error(`ツアー作成に失敗: ${JSON.stringify(res.data)}`);
  }
  
  console.log('[makingTour] res.data =', JSON.stringify(res.data, null, 2));

  return res.data as string;       // 成功時のみ戻す
};
