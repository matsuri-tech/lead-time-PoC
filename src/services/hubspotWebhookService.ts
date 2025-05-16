import { sendSlackMessage } from '../clients/slackClient';
import { saveToDatabase } from '../clients/dbClient';
import { fetchMeeting, fetchContact } from '../clients/hubspotClient';
import { makingTour } from '../clients/m2mClient';

export const processWebhook = async (objectId: string) => {
    const meeting = await fetchMeeting(objectId);
    const contactId = meeting.associations?.contacts?.results?.[0]?.id;
    if (!contactId) throw new Error("No associated contact found");
  
    const contact = await fetchContact(contactId);
  
    
     // src/services/hubspotWebhookService.ts
    const cleaning_id = await makingTour(contact, meeting);//taskチームがアサインされたツアーを作成する
    await sendSlackMessage(contact, meeting, cleaning_id);//フォーム回答次第、元のトラブル報告に通知
    
    await saveToDatabase({ meeting, contact });

    
  };
  