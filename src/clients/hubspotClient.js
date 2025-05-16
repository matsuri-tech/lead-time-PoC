"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMeeting = fetchMeeting;
exports.fetchContact = fetchContact;
const axios_1 = __importDefault(require("axios"));
const token = process.env.HUBSPOT_API_TOKEN;
const BASE_URL = 'https://api.hubapi.com';
// 1. 上で定義しておく
function formatToJSTString(isoString) {
    console.log('🧪 isoString (input):', isoString);
    // ① UTC → Date
    const utcDate = new Date(isoString);
    console.log('🕓 UTC Date:', utcDate.toISOString());
    // ② JST（+9h）へ変換
    const jstMillis = utcDate.getTime() + 9 * 60 * 60 * 1000;
    const jstDate = new Date(jstMillis);
    console.log('🕙 JST Date:', jstDate.toISOString());
    // ③ “UTC 系アクセサ”で値を取り出す
    const year = jstDate.getUTCFullYear();
    const month = String(jstDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(jstDate.getUTCDate()).padStart(2, '0');
    const hours = String(jstDate.getUTCHours()).padStart(2, '0');
    const minutes = String(jstDate.getUTCMinutes()).padStart(2, '0');
    const result = `${year}-${month}-${day} ${hours}:${minutes}`;
    console.log('📝 formatToJSTString result:', result);
    return result; // 例: 2025-05-14 15:40
}
// 2. fetchMeeting内では呼び出すだけ
function fetchMeeting(meetingId) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${BASE_URL}/crm/v3/objects/meetings/${meetingId}`;
        const res = yield axios_1.default.get(url, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                properties: 'hs_meeting_start_time,hs_meeting_end_time',
                associations: 'contacts',
            },
        });
        const raw = res.data;
        return Object.assign(Object.assign({}, raw), { properties: Object.assign(Object.assign({}, raw.properties), { hs_meeting_start_time_jst: formatToJSTString(raw.properties.hs_meeting_start_time), hs_meeting_end_time_jst: formatToJSTString(raw.properties.hs_meeting_end_time) }) });
    });
}
function fetchContact(contactId) {
    return __awaiter(this, void 0, void 0, function* () {
        const properties = [
            'selection_amenity_or_cleaning_or_both', 'cleaning_spot', 'cleaning_photo', 'rule',
            'recleaning_type', 'sheets', 'dubet', 'bathtowl', 'facetowl', 'amenity', 'request',
            'furniture_photo', 'lastname', 'firstname', 'reservation_code', 'email', 'submission_id', 'slack_thread', 'listing_id'
        ];
        const url = `${BASE_URL}/crm/v3/objects/contacts/${contactId}`;
        const res = yield axios_1.default.get(url, {
            headers: { Authorization: `Bearer ${token}` },
            params: { properties: properties.join(',') },
        });
        return res.data;
    });
}
