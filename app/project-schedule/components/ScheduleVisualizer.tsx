"use client";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, FolderKanban } from "lucide-react";

type Activity = {
    name: string;
    start?: string;
    finish?: string;
    children?: Activity[];
  };
  
  // Palette for WBS levels (expand as needed)
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
  
  function ScheduleWBS({ activity, level = 0 }: { activity: Activity; level?: number }) {
    if (!isWBS(activity)) {
      // Activity row (no color, no bold on dates)
      return (
        <>
          <div className="py-2 w-full">
            <div className="grid grid-cols-[minmax(300px,75%),minmax(60px,12.5%),minmax(60px,12.5%)] items-center w-full">
              <span className="font-medium truncate" style={{ paddingLeft: (level + 1) * 24 }}>
                {activity.name}
              </span>
              <span className="text-xs text-muted-foreground">{formatDate(activity.start)}</span>
              <span className="text-xs text-muted-foreground justify-self-end">{formatDate(activity.finish)}</span>
            </div>
          </div>
          <div className="border-b border-gray-200" />
        </>
      );
    }
  
    // WBS/group row: color-coded, bold, indent only the first column
    const { minStart, maxFinish } = getWBSDateRange(activity);
    const bgClass = wbsBgColors[Math.min(level, wbsBgColors.length - 1)];
  
    return (
      <Accordion type="multiple" className="w-full">
        <AccordionItem value={activity.name}>
          <AccordionTrigger>
            <div className={`grid grid-cols-[minmax(300px,75%),minmax(60px,12.5%),minmax(60px,12.5%)] items-center w-full rounded ${bgClass}`}>
              <span className="flex items-center gap-2 font-bold text-base" style={{ paddingLeft: level * 24 }}>
                <FolderKanban size={18} className="text-indigo-500" />
                {activity.name}
              </span>
              <span className="text-xs text-muted-foreground font-bold">
                {minStart && formatDate(minStart)}
              </span>
              <span className="text-xs text-muted-foreground font-bold justify-self-end">
                {maxFinish && formatDate(maxFinish)}
              </span>
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
          <div className="grid grid-cols-[minmax(300px,75%),minmax(60px,12.5%),minmax(60px,12.5%)] text-xs text-gray-500 mb-2">
            <span>Activity</span>
            <span>Start</span>
            <span className="justify-self-end">Finish</span>
          </div>
          <div className="border-b border-gray-300" />
          <ScheduleWBS activity={data} />
        </div>
      </div>
    );
  }