export interface Contact {
    properties: {
      reservation_code: string;
      submission_id: string;
      listing_id: string;
      placement: 'listing' ;
    };
  }
  
  export interface Meeting {
      properties: {
        hs_meeting_start_time_jst: string;
        hs_meeting_end_time_jst: string;
      };
    }