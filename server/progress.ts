// progress.ts
import { EventSource } from "eventsource";
type EventSourceMessageEvent = { data: string };
type ProgressMsg = {
  step: number;
  total: number;
  percent: number;
  message: string;
};

const backend = "http://ec2-54-234-165-21.compute-1.amazonaws.com:5000"; // or http(s)://<ip>:8000
const es = new EventSource(`${backend}/stream?total=30`, { withCredentials: false });

es.addEventListener("status", (ev: EventSourceMessageEvent) => {
  console.log("status:", ev.data);
});

es.addEventListener("progress", (ev: EventSourceMessageEvent) => {
  const data = JSON.parse(ev.data) as ProgressMsg;
  // update your UI here
  console.log(`Progress: ${data.percent}% - ${data.message}`);
  // e.g., document.getElementById("bar")!.style.width = `${data.percent}%`;
});

es.addEventListener("complete", (ev: EventSourceMessageEvent) => {
  console.log("Complete:", ev.data);
  es.close();
});

es.onerror = (e: unknown) => {
  console.error("SSE error:", e);
  // Optionally show retry UI
};
