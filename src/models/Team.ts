 
export type TeamType = {
    teamId?: string;
    teamName: string;
    teamLocation: string;
    coach: string;
    roster: string;    
    plain: string;     
    description: string;
    active?: boolean;
    createdBy?: {
        email: string;
        photoURL: string;
      };
      // author: string;
      
};