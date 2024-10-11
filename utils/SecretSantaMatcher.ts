import { Assignment, Participant } from "@/app/projects/[name]/[id]";
import Graph from "graphology";

interface NodeAttributes {
  excludes: string[];
}

export default class SecretSantaMatcher {
  private graph: Graph<NodeAttributes>;
  private participants: Participant[];
  private retryCount = 0;

  constructor(participants: Participant[]) {
    this.graph = new Graph<NodeAttributes>();
    this.participants = participants;

    participants.forEach((participant) => {
      this.graph.addNode(participant.name, { excludes: participant.excludes });
    });

    participants.forEach((giver) => {
      participants.forEach((receiver) => {
        if (receiver.name !== giver.name && !giver.excludes.includes(receiver.name)) {
          this.graph.addEdge(giver.name, receiver.name);
        }
      });
    });
  }

  findMatches(): Assignment[] {
    const matches: Record<string, string> = {};
    const assignments: Assignment[] = [];
    const availableGivers = new Set(this.participants.map((p) => p.name));
    const availableReceivers = new Set(this.participants.map((p) => p.name));

    while (availableGivers.size > 0 && availableReceivers.size > 0) {
      let giver = Array.from(availableGivers)[0]; // Start from the first available giver
      let potentialReceivers = this.graph
        .outNeighbors(giver)
        .filter((receiver) => receiver !== giver && availableReceivers.has(receiver) && receiver !== matches[giver]);

      if (potentialReceivers.length > 0) {
        let selectedReceiver = potentialReceivers[Math.floor(Math.random() * potentialReceivers.length)];
        matches[giver] = selectedReceiver;

        assignments.push({ from: giver, to: selectedReceiver });

        // Remove from the available pool
        availableGivers.delete(giver);
        availableReceivers.delete(selectedReceiver);
      } else {
        // If no available receivers, break to avoid infinite loop
        break;
      }
    }

    // Verify every participant has been matched, if not, we need to shuffle or re-run the match
    if (assignments.length < this.participants.length) {
      if (this.retryCount < 10) {
        this.retryCount++;
        console.warn("Not all participants could be matched, rerunning the match...");
        return this.findMatches(); // Optionally re-run the matching to try again
      }
      else{
        console.error("Not all participants could be matched and max retries reached.");
        throw new Error("Not all participants could be matched.");
      }
    }

    return assignments;
  }
}
