'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";

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
        
        // Explicitly type the raw data as array of arrays
        const rawData = XLSX.utils.sheet_to_json(ws, { 
          header: 1, 
          defval: null 
        }) as (string | number | null)[][];
  
        // Type-safe filtering
        const filteredData = rawData
          .slice(1) // Remove header row
          .filter((row): row is (string | number)[] => 
            Array.isArray(row) && 
            row.length > 0 && 
            row.some(cell => cell !== null)
          );
  
        const parsedData: ExcelRow[] = filteredData.map((row) => {
          // Now TypeScript knows row is an array
          return {
            Vendor: String(row[0] || ''),
            'PO Number': String(row[1] || ''),
            Currency: String(row[2] || ''),
            'PO Value': Number(row[3]) || 0,
            'PO Value with VAT': Number(row[4]) || 0
          };
        });
  
        console.log('Parsed Data:', parsedData);
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
      await axios.post('/api/post-po', { data });
      console.log('Data posted successfully');
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
        />
      </div>

      {(uploading || posting) && (
        <div className="my-6">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500 mt-2">
            {uploading ? 'Processing file...' : 'Posting to database...'}
          </p>
        </div>
      )}

      {data.length > 0 && (
        <div className="mt-6">
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                    PO Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                    Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                    PO Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                    PO Value with VAT
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border">
                      {row.Vendor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border">
                      {row['PO Number']}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border">
                      {row.Currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border">
                      {row['PO Value'].toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border">
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {posting ? 'Posting...' : 'Post to Database'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}