"use client";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, FolderKanban } from "lucide-react";

// --- Types ---
type Activity = {
  id?: string; // optional Activity ID (if available)
  name: string;
  duration?: string; // e.g., "14d"
  start?: string;
  finish?: string;
  children?: Activity[];
};

// --- WBS background colors for hierarchy ---
const wbsBgColors = [
  "bg-blue-50",
  "bg-indigo-50",
  "bg-green-50",
  "bg-yellow-50",
  "bg-purple-50",
];

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "2-digit"
  });
}

function isWBS(activity: Activity) {
  return Array.isArray(activity.children) && activity.children.length > 0;
}

function getWBSDateRange(activity: Activity): { minStart?: string; maxFinish?: string } {
  if (!isWBS(activity)) {
    return { minStart: activity.start, maxFinish: activity.finish };
  }
  let minStart: string | undefined;
  let maxFinish: string | undefined;
  for (const child of activity.children!) {
    const { minStart: childMin, maxFinish: childMax } = getWBSDateRange(child);
    if (childMin && (!minStart || childMin < minStart)) minStart = childMin;
    if (childMax && (!maxFinish || childMax > maxFinish)) maxFinish = childMax;
  }
  return { minStart, maxFinish };
}

function getDuration(activity: Activity): string | undefined {
  // If duration is provided, use it; otherwise, calculate days between start and finish
  if (activity.duration) return activity.duration;
  if (activity.start && activity.finish) {
    const start = new Date(activity.start);
    const end = new Date(activity.finish);
    const days = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    return `${days}d`;
  }
  return undefined;
}

function ScheduleWBS({ activity, level = 0 }: { activity: Activity; level?: number }) {
  if (!isWBS(activity)) {
    // Activity row: no color, no bold, with indent and duration
    return (
      <>
        <div className="py-2 w-full">
          <div className="grid grid-cols-[110px,minmax(240px,1fr),80px,120px,120px] items-center w-full text-sm">
            <span className="truncate">{activity.id || ""}</span>
            <span className="truncate" style={{ paddingLeft: (level + 1) * 20 }}>{activity.name}</span>
            <span className="">{getDuration(activity)}</span>
            <span className="">{formatDate(activity.start)}</span>
            <span className="justify-self-end">{formatDate(activity.finish)}</span>
          </div>
        </div>
        <div className="border-b border-gray-200" />
      </>
    );
  }

  // WBS row: bold, shaded, indented, bold dates
  const { minStart, maxFinish } = getWBSDateRange(activity);
  const duration = getDuration({ ...activity, start: minStart, finish: maxFinish });
  const bgClass = wbsBgColors[Math.min(level, wbsBgColors.length - 1)];

  return (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value={activity.name}>
        <AccordionTrigger>
          <div
            className={`grid grid-cols-[110px,minmax(240px,1fr),80px,120px,120px] items-center w-full text-sm rounded ${bgClass}`}
          >
            <span className="font-bold truncate">{activity.id || ""}</span>
            <span className="font-bold truncate" style={{ paddingLeft: level * 20 }}>
              {activity.name}
            </span>
            <span className="font-bold">{duration}</span>
            <span className="font-bold">{minStart && formatDate(minStart)}</span>
            <span className="font-bold justify-self-end">{maxFinish && formatDate(maxFinish)}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div>
            {activity.children?.map((child, idx) => (
              <ScheduleWBS key={idx} activity={child} level={level + 1} />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default function ScheduleVisualizer({ data }: { data: Activity }) {
  return (
    <div className="w-full mt-4 mb-8">
      <div className="bg-white shadow rounded-2xl px-4 py-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight">{data.name}</h2>
        </div>
        <Separator className="mb-6" />
        {/* HEADER ROW - THIS SHOULD BE INSIDE THE RETURN! */}
        <div className="grid grid-cols-[110px,minmax(240px,1fr),80px,120px,120px] text-xs text-gray-500 mb-2">
          <span>Activity ID</span>
          <span>Activity Name</span>
          <span>Duration</span>
          <span>Start</span>
          <span className="justify-self-end">Finish</span>
        </div>
        <div className="border-b border-gray-300" />
        <ScheduleWBS activity={data} />
      </div>
    </div>
  );
}
