export interface MeetingResponse {
    id: string;
    properties: {
        hs_meeting_start_time: string;
        hs_meeting_end_time: string;
        hs_meeting_start_time_jst?: string;
        hs_meeting_end_time_jst?: string;
    };
    associations?: {
      contacts?: {
        results: {
          id: string;
          type: string;
        }[];
      };
    };
  }
  
  export interface ContactResponse {
    id: string;
    properties: {
      selection_amenity_or_cleaning_or_both?: string;
      cleaning_spot?: string;
      cleaning_photo?: string | null;
      rule?: string;
      recleaning_type?: string;
      sheets?: string;
      dubet?: string;
      bathtowl?: string;
      facetowl?: string;
      amenity?: string;
      request?: string;
      furniture_photo?: string | null;
      lastname?: string;
      firstname?: string;
      reservation_code?: string;
      email?: string;
      submission_id?: string | null;
      slack_thread?: string | null;
      listing_id?: string
    };
  }
  