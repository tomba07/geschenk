export interface Project {
  id: number;
  name: string;
  assigned: boolean;
}

export interface Participant {
  name: string;
  excludes: string[];
}

export interface BEParticipant {
  projectId: string;
  name: string;
}

export interface ProjectDetails {
  id: string;
  name: string;
  participants: Participant[];
  assignments: Assignment[];
}

export interface SimplifiedAssignment {
  fromName: string;
  toName: string;
}

export interface Assignment {
  fromName: string;
  toName: string;
}
