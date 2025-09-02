import axios from 'axios';

const token = process.env.HUBSPOT_API_TOKEN;
const BASE_URL = 'https://api.hubapi.com';

// 1. 上で定義しておく
function formatToJSTString(isoString: string): string {
    console.log('🧪 isoString (input):', isoString);
  
    // ① UTC → Date
    const utcDate = new Date(isoString);
    console.log('🕓 UTC Date:', utcDate.toISOString());
  
    // ② JST（+9h）へ変換
    const jstMillis = utcDate.getTime() + 9 * 60 * 60 * 1000;
    const jstDate   = new Date(jstMillis);
    console.log('🕙 JST Date:', jstDate.toISOString());
  
    // ③ “UTC 系アクセサ”で値を取り出す
    const year    = jstDate.getUTCFullYear();
    const month   = String(jstDate.getUTCMonth() + 1).padStart(2, '0');
    const day     = String(jstDate.getUTCDate()).padStart(2, '0');
    const hours   = String(jstDate.getUTCHours()).padStart(2, '0');
    const minutes = String(jstDate.getUTCMinutes()).padStart(2, '0');
  
    const result = `${year}-${month}-${day} ${hours}:${minutes}`;
    console.log('📝 formatToJSTString result:', result);
  
    return result; // 例: 2025-05-14 15:40
  }
  

  
  
  // 2. fetchMeeting内では呼び出すだけ
  export async function fetchMeeting(meetingId: string) {
    const url = `${BASE_URL}/crm/v3/objects/meetings/${meetingId}`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        properties: 'hs_meeting_start_time,hs_meeting_end_time',
        associations: 'contacts',
      },
    });
  
    const raw = res.data;
  
    return {
      ...raw,
      properties: {
        ...raw.properties,
        hs_meeting_start_time_jst: formatToJSTString(raw.properties.hs_meeting_start_time),
        hs_meeting_end_time_jst: formatToJSTString(raw.properties.hs_meeting_end_time),
      },
    };
  }
  
  



// 複数のURL（セミコロン区切り）をハイパーリンク形式で返す
function formatUrlsAsHyperlinks(urlString: string): string {
  if (!urlString) return urlString;
  
  const urls = urlString.split(';').map(url => url.trim()).filter(url => url);
  const hyperlinks: string[] = [];
  
  for (let i = 0; i < urls.length; i++) {
    // Slackのハイパーリンク形式: <URL|表示テキスト>
    hyperlinks.push(`<${urls[i]}|写真${i + 1}>`);
  }
  
  return hyperlinks.join('\n');
}

// 複数回答（セミコロン区切り）を箇条書き形式にフォーマット
function formatMultipleAnswers(answerString: string): string {
  if (!answerString) return answerString;
  
  const answers = answerString.split(';').map(answer => answer.trim()).filter(answer => answer);
  
  if (answers.length <= 1) {
    return answerString; // 単一回答の場合はそのまま返す
  }
  
  return answers.map(answer => `• ${answer}`).join('\n');
}

// アメニティ用: セミコロン区切りを「/」区切りの横並びにフォーマット
function formatAmenityAsSlashSeparated(answerString: string): string {
  if (!answerString) return answerString;
  
  const answers = answerString.split(';').map(answer => answer.trim()).filter(answer => answer);
  
  if (answers.length <= 1) {
    return answerString; // 単一回答の場合はそのまま返す
  }
  
  return answers.join(' / ');
}

export async function fetchContact(contactId: string) {
  const properties = [
    'selection_amenity_or_cleaning_or_both2','cleaning_spot','cleaning_photo','rule2',
    'recleaning_type','bed_sheets','futon_sheets','bed_duvet','futon_duvet','bathtowl','facetowl','amenity','request',
    'furniture_photo','lastname','firstname','reservation_code','email','submission_id','slack_thread','listing_id']

  const url = `${BASE_URL}/crm/v3/objects/contacts/${contactId}`;
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    params: { properties: properties.join(',') },
  });
  
  const contact = res.data;
  
  // HubSpot Contact API 生レスポンス全体をログ出力
  console.log('🔍 [HubSpot Contact API] 完全レスポンス:');
  console.log(JSON.stringify(contact, null, 2));
  
  // デバッグ: 変換前の生データをログ出力
  console.log('📋 [fetchContact] 変換前データ:');
  console.log('   cleaning_photo:', contact.properties.cleaning_photo);
  console.log('   furniture_photo:', contact.properties.furniture_photo);
  console.log('   selection_amenity_or_cleaning_or_both2:', contact.properties.selection_amenity_or_cleaning_or_both2);
  console.log('   amenity:', contact.properties.amenity);
  
  // cleaning_photo と furniture_photo をハイパーリンク形式に変換
  if (contact.properties.cleaning_photo) {
    console.log('📷 cleaning_photo (変換前):', contact.properties.cleaning_photo);
    contact.properties.cleaning_photo = formatUrlsAsHyperlinks(contact.properties.cleaning_photo);
    console.log('📷 cleaning_photo (ハイパーリンク変換後):', contact.properties.cleaning_photo);
  }
  
  if (contact.properties.furniture_photo) {
    console.log('🖼️ furniture_photo (変換前):', contact.properties.furniture_photo);
    contact.properties.furniture_photo = formatUrlsAsHyperlinks(contact.properties.furniture_photo);
    console.log('🖼️ furniture_photo (ハイパーリンク変換後):', contact.properties.furniture_photo);
  }
  
  // selection_amenity_or_cleaning_or_both2 を箇条書き形式にフォーマット
  if (contact.properties.selection_amenity_or_cleaning_or_both2) {
    console.log('🔄 selection_amenity_or_cleaning_or_both2フォーマット開始...');
    const originalValue = contact.properties.selection_amenity_or_cleaning_or_both2;
    contact.properties.selection_amenity_or_cleaning_or_both2 = formatMultipleAnswers(contact.properties.selection_amenity_or_cleaning_or_both2);
    console.log('✅ selection_amenity_or_cleaning_or_both2フォーマット完了:');
    console.log('   変換前:', originalValue);
    console.log('   変換後:', contact.properties.selection_amenity_or_cleaning_or_both2);
  }
  
  // amenity を「/」区切りの横並び形式にフォーマット
  if (contact.properties.amenity) {
    console.log('🔄 amenityフォーマット開始...');
    const originalValue = contact.properties.amenity;
    contact.properties.amenity = formatAmenityAsSlashSeparated(contact.properties.amenity);
    console.log('✅ amenityフォーマット完了:');
    console.log('   変換前:', originalValue);
    console.log('   変換後:', contact.properties.amenity);
  }
  
  return contact;
}