export interface Project {
  id: Number;
  name: string;
}

export interface Participant {
  name: string;
  excludes: string[];
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
