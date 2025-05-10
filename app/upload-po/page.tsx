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
          Vendor: String(row[0] || ''),
          'PO Number': String(row[1] || ''),
          Currency: String(row[2] || ''),
          'PO Value': Number(row[3]) || 0,
          'PO Value with VAT': Number(row[4]) || 0
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <input 
          type="file" 
          accept=".xlsx,.xls" 
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          disabled={uploading || posting}
        />
      </div>

      {(uploading || posting) && (
        <div className="my-6">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500 mt-2">
            {uploading ? 'Processing file...' : `Posting to database... ${progress}%`}
          </p>
        </div>
      )}

{data.length > 0 && (
        <div className="mt-6">
          <div className="overflow-auto shadow-lg rounded-xl border border-gray-100 max-h-[600px]">
            <table className="min-w-full relative">
              <colgroup>
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[10%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
              </colgroup>
              
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 text-gray-600 text-sm font-semibold">
                  <th className="px-6 py-4 text-left border-b border-gray-200">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left border-b border-gray-200">
                    PO Number
                  </th>
                  <th className="px-6 py-4 text-left border-b border-gray-200">
                    Currency
                  </th>
                  <th className="px-6 py-4 text-left border-b border-gray-200">
                    PO Value
                  </th>
                  <th className="px-6 py-4 text-left border-b border-gray-200">
                    PO Value with VAT
                  </th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.map((row, idx) => (
                  <tr 
                    key={idx} 
                    className="hover:bg-gray-50 text-gray-700 text-sm odd:bg-gray-50/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.Vendor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row['PO Number']}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.Currency}
                    </td>
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

          <div className="mt-6 flex justify-end">
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
          </div>
        </div>
      )}
    </div>
  );
}