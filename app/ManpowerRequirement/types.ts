export interface Item {
  "Item No.": string | null;
  Description: string;
  Unit: string;
  "Unit Rate (SAR)": number;
}

export interface WidgetData {
  [group: string]: Item[];
}

// For form entry state
export interface WidgetEntry extends Item {
  days: number;
  persons: number;
  totalHours: number;
  totalValue: number;
}
