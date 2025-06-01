import scheduleDataJson from "./ scheduleData.json"
import ScheduleVisualizer from "./components/ScheduleVisualizer";

type Activity = {
  name: string;
  start?: string;
  finish?: string;
  children?: Activity[];
};

const scheduleData = scheduleDataJson as Activity;

export default function SchedulePage() {
  return <ScheduleVisualizer data={scheduleData} />;
}
