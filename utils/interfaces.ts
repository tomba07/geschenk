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
}

export interface Assignment {
  from: string;
  to: string;
}
