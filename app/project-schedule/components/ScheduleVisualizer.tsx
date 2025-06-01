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
  
  function formatDate(date?: string) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "2-digit"
    });
  }
  
  function isWBS(activity: Activity) {
    return Array.isArray(activity.children) && activity.children.length > 0;
  }
  
  function ScheduleWBS({ activity, level = 0 }: { activity: Activity; level?: number }) {
    // Leaf: Activity row
    if (!isWBS(activity)) {
      return (
        <>
          <div
            style={{ paddingLeft: (level + 1) * 16 }}
            className="py-2"
          >
            <div className="grid grid-cols-[300px,120px,1fr] items-center">
              <span className="font-medium truncate">{activity.name}</span>
              <span className="text-xs text-muted-foreground pl-3">{formatDate(activity.start)}</span>
              <span className="text-xs text-muted-foreground justify-self-end">{formatDate(activity.finish)}</span>
            </div>
          </div>
          <div className="border-b border-gray-200" />
        </>
      );
    }
  
    // WBS/Section: Accordion
    return (
      <Accordion type="multiple" className="w-full" style={{ paddingLeft: level * 16 }}>
        <AccordionItem value={activity.name}>
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <FolderKanban size={18} className="text-indigo-500" />
              <span className="font-bold text-base">{activity.name}</span>
            </span>
            {(activity.start && activity.finish) && (
              <Badge variant="outline" className="ml-2">
                {formatDate(activity.start)} — {formatDate(activity.finish)}
              </Badge>
            )}
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
      <div className="max-w-4xl mx-auto mt-8 mb-16">
        <div className="bg-white shadow-lg rounded-2xl px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight">{data.name}</h2>
            <Badge className="text-md px-3 py-1" variant="default">
              {formatDate(data.start)} — {formatDate(data.finish)}
            </Badge>
          </div>
          <Separator className="mb-6" />
          {/* Activity header */}
          <div className="grid grid-cols-[300px,120px,1fr] text-xs text-gray-500 mb-2 ml-4">
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