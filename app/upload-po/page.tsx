'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface ExcelRow {
  Vendor: string;
  'PO Number': string;
  Currency: string;
  Location: string;
  'PO Value': number;
  'PO Value with VAT': number;
}

export default function UploadPOPage() {
  const [data, setData] = useState<ExcelRow[]>([]);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(20);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets['Sheet4'] || wb.Sheets[wb.SheetNames[0]];

        const rawData = XLSX.utils.sheet_to_json(ws, {
          header: 1,
          defval: null
        }) as (string | number | null)[][];

        const filteredData = rawData
          .slice(1)
          .filter((row): row is (string | number)[] =>
            Array.isArray(row) &&
            row.length > 0 &&
            row.some(cell => cell !== null)
          );

        const parsedData: ExcelRow[] = filteredData.map((row) => ({
          Vendor: String(row[0] || '').trim(),
          'PO Number': String(row[1] || '').trim(),
          Currency: String(row[2] || '').trim(),
          Location: String(row[3] || '').trim(),
          'PO Value': parseFloat(String(row[4]).replace(/,/g, '')) || 0,
          'PO Value with VAT': parseFloat(String(row[5]).replace(/,/g, '')) || 0
        }));

        setData(parsedData);
        setProgress(100);
      } catch (error) {
        console.error('Error processing file:', error);
      } finally {
        setUploading(false);
      }
    };

    reader.onerror = () => {
      console.error('File reading error');
      setUploading(false);
    };

    reader.readAsBinaryString(file);
  };

  const handlePostToDb = async () => {
    if (data.length === 0) return;
    setPosting(true);
    setProgress(20);

    try {
      const response = await fetch('/api/post-po', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });

      if (!response.body) throw new Error('No response body');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const eventData = JSON.parse(line.slice(6));
            if (eventData.progress) {
              setProgress(eventData.progress);
            }
          }
        }
      }

      setProgress(100);
    } catch (error) {
      console.error('Error posting to DB:', error);
      setProgress(0);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* File Upload & Post Button */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="block text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          disabled={uploading || posting}
        />
        {data.length > 0 && (
          <Button
            onClick={handlePostToDb}
            disabled={posting}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            {posting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : 'Post to Database'}
          </Button>
        )}
      </div>

      {/* Progress bar */}
      {(uploading || posting) && (
        <div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500 mt-2">
            {uploading ? 'Processing file...' : `Posting to database... ${progress}%`}
          </p>
        </div>
      )}

      {/* Table Preview */}
      {data.length > 0 && (
        <div>
          <div className="overflow-auto shadow-lg rounded-xl border border-gray-100 max-h-[600px]">
            <table className="min-w-full relative">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 text-gray-600 text-sm font-semibold">
                  <th className="px-6 py-4 text-left border-b">Vendor</th>
                  <th className="px-6 py-4 text-left border-b">PO Number</th>
                  <th className="px-6 py-4 text-left border-b">Currency</th>
                  <th className="px-6 py-4 text-left border-b">Location</th>
                  <th className="px-6 py-4 text-left border-b">PO Value</th>
                  <th className="px-6 py-4 text-left border-b">PO Value with VAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 text-gray-700 text-sm odd:bg-gray-50/50">
                    <td className="px-6 py-4 whitespace-nowrap">{row.Vendor}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row['PO Number']}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.Currency}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.Location}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {row['PO Value'].toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {row['PO Value with VAT'].toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
