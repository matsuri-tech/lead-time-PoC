import { BigQuery } from '@google-cloud/bigquery';
import { ContactResponse as Contact } from '../types/hubspot';
import { MeetingResponse as Meeting } from '../types/hubspot';

const bigquery = new BigQuery();
const datasetId = 'su_wo';
const tableId = 'hubspot_forms_delivery_PoC';

export const saveToDatabase = async ({
  contact,
  meeting,
  cleaningId,
  
}: {
  contact: Contact;
  meeting: Meeting;
  cleaningId: string | null;
  
}) => {
  const nowJST = new Date(Date.now() + 9 * 60 * 60 * 1000); // JST = UTC + 9h
  const conversion_date = formatDateToJSTString(nowJST);     // e.g., "2025-06-08 20:58:11"

  const row = {
    agreement: contact.properties.rule2 ?? null,
    desired_action: contact.properties.selection_amenity_or_cleaning_or_both2 ?? null,
    listing_id: contact.properties.listing_id ?? null,
    submission_id: contact.properties.submission_id ?? null,
    slack_thread: contact.properties.slack_thread ?? null,
    reservation_code: contact.properties.reservation_code ?? null,
    mail: contact.properties.email ?? null,
    first_name: contact.properties.firstname ?? null,
    last_name: contact.properties.lastname ?? null,
    areas_recleaning: contact.properties.cleaning_spot ?? null,
    photo_of_areas_recleaning: contact.properties.cleaning_photo ?? null,
    recleaning_type: contact.properties.recleaning_type ?? null,
    bed_sheets: toInt(contact.properties.bed_sheets),
    futon_sheets: toInt(contact.properties.futon_sheets),
    bed_duvet: toInt(contact.properties.bed_duvet),
    futon_duvet: toInt(contact.properties.futon_duvet),
    bath_towel: toInt(contact.properties.bathtowl),
    face_towel: toInt(contact.properties.facetowl),
    amenity: contact.properties.amenity ?? null,
    exchange_item: contact.properties.request ?? null,
    photo_of_exchange_item: contact.properties.furniture_photo ?? null,
    conversion_date, // ← ここを現在時刻（JST）に
    contact_first_name: contact.properties.firstname ?? null,
    contact_last_name: contact.properties.lastname ?? null,
    contact_email: contact.properties.email ?? null,
    contact_id: contact.id ?? null,
    request_start_time: meeting.properties.hs_meeting_start_time_jst ?? null,
    request_end_time: meeting.properties.hs_meeting_end_time_jst ?? null,
    cleaning_id: cleaningId ?? null,
  };

  await bigquery.dataset(datasetId).table(tableId).insert([row]);
  console.log('[saveToDatabase] BigQuery insert complete:', row);
};

function toInt(val: string | null | undefined): number | null {
  const parsed = parseInt(val ?? '', 10);
  return isNaN(parsed) ? null : parsed;
}

function formatDateToJSTString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}
