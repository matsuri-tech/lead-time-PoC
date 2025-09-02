# HubSpot API使用状況まとめ

## 使用しているHubSpot API

### 1. Meetings API
- **エンドポイント**: `GET /crm/v3/objects/meetings/{meetingId}`
- **ファイル**: `src/clients/hubspotClient.ts:37`
- **関数**: `fetchMeeting(meetingId: string)`
- **取得プロパティ**: 
  - `hs_meeting_start_time` (ミーティング開始時刻)
  - `hs_meeting_end_time` (ミーティング終了時刻)
- **関連**: `contacts` (関連するコンタクト情報)
- **用途**: ミーティング詳細の取得とJST時刻への変換

### 2. Contacts API
- **エンドポイント**: `GET /crm/v3/objects/contacts/{contactId}`
- **ファイル**: `src/clients/hubspotClient.ts:66`
- **関数**: `fetchContact(contactId: string)`
- **取得プロパティ**: 
  - `selection_amenity_or_cleaning_or_both`
  - `cleaning_spot`
  - `cleaning_photo`
  - `rule2`
  - `recleaning_type`
  - `sheets`
  - `dubet`
  - `bathtowl`
  - `facetowl`
  - `amenity`
  - `request`
  - `furniture_photo`
  - `lastname`
  - `firstname`
  - `reservation_code`
  - `email`
  - `submission_id`
  - `slack_thread`
  - `listing_id`
- **用途**: コンタクト詳細情報の取得

## API設定
- **ベースURL**: `https://api.hubapi.com`
- **認証**: Bearer token (`HUBSPOT_API_TOKEN` 環境変数)
- **HTTPクライアント**: axios

## 使用フロー
1. Webhookでミーティング作成を検知 (`src/handlers/webhookHandler.ts:24`)
2. ミーティング詳細を取得 (`src/services/hubspotWebhookService.ts:10`)
3. 関連コンタクト情報を取得 (`src/services/hubspotWebhookService.ts:14`)
4. 取得したデータを使ってツアー作成・Slack通知・DB保存を実行