"use client"

import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BarLoader, PulseLoader } from 'react-spinners';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface SupplierSummary {
  supplierId: number;
  supplier: string;
  location: string;
  totalValueInSAR: number;
  totalWithVATInSAR: number;
}

interface PO {
  poNumber: string;
  currency: string;
  poValue: number;
  poValueWithVAT: number;
  poValueInSAR: number;
  poValueWithVATInSAR: number;
}

export default function SupplierSummaryPage() {
  const [summary, setSummary] = useState<SupplierSummary[]>([]);
  const [filteredSummary, setFilteredSummary] = useState<SupplierSummary[]>([]);
  const [selectedDetails, setSelectedDetails] = useState<PO[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInSAR, setShowInSAR] = useState(true);
  const [loading, setLoading] = useState(true);
  const [rowLoading, setRowLoading] = useState<number | null>(null); // Track loading for specific row
  const [open, setOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);

  useEffect(() => {
    fetch('/api/supplier-summary')
      .then(res => res.json())
      .then(data => {
        setSummary(data);
        setFilteredSummary(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = [...summary];
    if (searchTerm) {
      result = result.filter(s => s.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (selectedSupplier) {
      result = result.filter(s => s.supplier === selectedSupplier);
    }
    setFilteredSummary(result);
  }, [searchTerm, selectedSupplier, summary]);

  const handleRowClick = async (supplierId: number) => {
    setRowLoading(supplierId); // Set row loading state to the clicked row's supplierId
    try {
      const res = await fetch(`/api/supplier-summary/${supplierId}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data: PO[] = await res.json();
      setSelectedDetails(data);
      setOpen(true);
    } catch (err) {
      console.error('Failed to fetch PO details:', err);
      alert('Failed to load PO details.');
    } finally {
      setRowLoading(null); // Reset row loading state
    }
  };

  const formatNumber = (val: any): string => {
    const num = typeof val === 'number' ? val : parseFloat(val);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const grandTotalValue = filteredSummary.reduce((acc, cur) => acc + Number(cur.totalValueInSAR), 0);
  const grandTotalWithVAT = filteredSummary.reduce((acc, cur) => acc + Number(cur.totalWithVATInSAR), 0);

  const topTenSuppliers = [...summary]
    .sort((a, b) => Number(b.totalValueInSAR) - Number(a.totalValueInSAR))
    .slice(0, 10)
    .map((s) => ({
      name: s.supplier.length > 15 ? s.supplier.slice(0, 12) + '…' : s.supplier,
      value: Number(s.totalValueInSAR),
    }));

  const uniqueSuppliers = [...new Set(summary.map(s => s.supplier))];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Purchase Order List By Supplier</h2>
        <Button onClick={() => setChartOpen(true)}>TOP TEN Suppliers</Button>
      </div>

      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Search Supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          value={selectedSupplier || '__all__'}
          onValueChange={(val) => setSelectedSupplier(val === '__all__' ? '' : val)}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by Supplier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Suppliers</SelectItem>
            {uniqueSuppliers.map((supplier) => (
              <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch checked={showInSAR} onCheckedChange={setShowInSAR} />
          <Label>Show in SAR</Label>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center mt-10">
          <BarLoader color="#3b82f6" />
        </div>
      ) : (
        <div className="relative overflow-auto max-h-[500px] rounded-md border border-gray-300">
          <table className="min-w-[800px] w-full text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="border px-4 py-2 text-left w-[40%]">Supplier</th>
                <th className="border px-4 py-2 text-right w-[30%]">Total PO Value</th>
                <th className="border px-4 py-2 text-right w-[30%]">Total PO with VAT</th>
              </tr>
            </thead>
            <tbody>
  {filteredSummary.map((item, idx) => (
    <tr 
      key={`${item.supplierId}-${idx}`} // Make the key unique by adding the index
      className={`hover:bg-blue-50 cursor-pointer even:bg-gray-50 ${rowLoading === item.supplierId ? 'bg-gray-200' : ''}`}
      onClick={() => handleRowClick(item.supplierId)}
    >
      <td className="border px-4 py-2">{item.supplier}</td>
      <td className="border px-4 py-2 text-right">{formatNumber(item.totalValueInSAR)} SAR</td>
      <td className="border px-4 py-2 text-right">{formatNumber(item.totalWithVATInSAR)} SAR</td>
    </tr>
  ))}
</tbody>

            <tfoot className="sticky bottom-0 bg-gray-200 font-semibold">
              <tr>
                <td className="border px-4 py-2">Grand Total</td>
                <td className="border px-4 py-2 text-right">{formatNumber(grandTotalValue)} SAR</td>
                <td className="border px-4 py-2 text-right">{formatNumber(grandTotalWithVAT)} SAR</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>PO Details</DialogTitle></DialogHeader>
          {rowLoading ? (
            <div className="flex justify-center items-center h-48">
              <PulseLoader color="#3b82f6" />
            </div>
          ) : selectedDetails.length === 0 ? (
            <div className="p-4 text-muted-foreground text-center">No PO details available</div>
          ) : (
            <div className="overflow-auto max-h-[400px] mt-4 border rounded-md">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">PO Number</th>
                    <th className="px-4 py-2 text-left">Currency</th>
                    <th className="px-4 py-2 text-right">PO Value</th>
                    <th className="px-4 py-2 text-right">PO w/ VAT</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDetails.map((po, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2">{po.poNumber}</td>
                      <td className="px-4 py-2">{po.currency}</td>
                      <td className="px-4 py-2 text-right">
                        {formatNumber(showInSAR ? po.poValueInSAR : po.poValue)} {showInSAR ? 'SAR' : po.currency}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {formatNumber(showInSAR ? po.poValueWithVATInSAR : po.poValueWithVAT)} {showInSAR ? 'SAR' : po.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-200 font-semibold">
                  <tr>
                    <td className="px-4 py-2" colSpan={2}>Grand Total</td>
                    <td className="px-4 py-2 text-right">
                      {formatNumber(
                        selectedDetails.reduce((acc, r) => acc + (showInSAR ? r.poValueInSAR : r.poValue), 0)
                      )} {showInSAR ? 'SAR' : selectedDetails[0]?.currency || ''}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatNumber(
                        selectedDetails.reduce((acc, r) => acc + (showInSAR ? r.poValueWithVATInSAR : r.poValueWithVAT), 0)
                      )} {showInSAR ? 'SAR' : selectedDetails[0]?.currency || ''}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
          <DialogFooter><Button onClick={() => setOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={chartOpen} onOpenChange={setChartOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Top 10 Suppliers</DialogTitle>
          </DialogHeader>
          <div className="h-[400px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topTenSuppliers} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-30} textAnchor="end" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <DialogFooter><Button onClick={() => setChartOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
