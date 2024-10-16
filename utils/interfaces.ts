export interface Project {
  id: number;
  name: string;
}

export interface Participant {
  name: string;
  excludes: string[];
}

export interface BEParticipant {
  projectId: Number;
  name: string;
}

export interface ProjectDetails {
  id: Number;
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
