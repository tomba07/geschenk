import { Assignment, Participant } from "./interfaces";

// Function to shuffle an array
function shuffle(array: string[]): string[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

// Helper function to check if a giver can give to a receiver
function isValid(giver: string, receiver: string, exclusionMap: Map<string, Set<string>>): boolean {
  if (giver === receiver) return false;
  if (exclusionMap.has(giver) && exclusionMap.get(giver)?.has(receiver)) {
    return false;
  }
  return true;
}

// Backtracking algorithm to find valid assignments
function findAssignment(
  givers: string[],
  receivers: string[],
  assignment: [string, string][],
  exclusionMap: Map<string, Set<string>>
): [string, string][] | false {
  if (givers.length === 0) return assignment;

  const giver = givers[0];
  const shuffledReceivers = shuffle(receivers.slice()); // Shuffle to randomize

  for (let i = 0; i < shuffledReceivers.length; i++) {
    const receiver = shuffledReceivers[i];
    if (isValid(giver, receiver, exclusionMap)) {
      assignment.push([giver, receiver]);
      const nextGivers = givers.slice(1);
      const nextReceivers = receivers.filter((r) => r !== receiver);
      const result = findAssignment(nextGivers, nextReceivers, assignment, exclusionMap);
      if (result) return result;
      assignment.pop(); // Backtrack
    }
  }
  return false;
}

// Function to find matches for Secret Santa
export function findMatches(participants: Participant[]): Assignment[] {
  const names = participants.map((p) => p.name);
  const exclusions: [string, string][] = [];

  // Create exclusion pairs
  participants.forEach((participant) => {
    participant.excludes.forEach((excluded) => {
      exclusions.push([participant.name, excluded]);
    });
  });

  // Create exclusion map for quick exclusion checks
  const exclusionMap = new Map<string, Set<string>>();
  exclusions.forEach(([a, b]) => {
    if (!exclusionMap.has(a)) exclusionMap.set(a, new Set());
    if (!exclusionMap.has(b)) exclusionMap.set(b, new Set());
    exclusionMap.get(a)?.add(b);
    exclusionMap.get(b)?.add(a);
  });

  // Shuffle the names to randomize the order of givers and receivers
  const shuffledNames = shuffle(names.slice());
  const assignment = findAssignment(shuffledNames, shuffledNames.slice(), [], exclusionMap);

  if (assignment) {
    return assignment.map(([giver, receiver]) => ({ from: giver, to: receiver }));
  } else {
    console.error("Not all participants could be matched.");
    throw new Error("Not all participants could be matched.");
  }
}
