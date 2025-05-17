'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';

interface SupplierSummary {
  supplierId: number;
  supplier: string;
  location: string;
  currency: string;
  poValue: number;
  poValueWithVAT: number;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedSupplierName, setSelectedSupplierName] = useState('');
  const [selectedDetails, setSelectedDetails] = useState<PO[]>([]);
  const [showInSAR, setShowInSAR] = useState(true);
  const [open, setOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const thBase = "border-b border-gray-200 px-4 py-2 text-gray-700 whitespace-nowrap";

  const { data: summary = [], isLoading } = useQuery<SupplierSummary[]>({
    queryKey: ['supplierSummary'],
    queryFn: () => fetch('/api/supplier-summary').then(res => res.json()),
  });

  const formatNumber = (val: any) => (isNaN(val) ? '0.00' : Number(val).toFixed(2));

  const filteredSummary = summary.filter((s) =>
    s.supplier.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!selectedSupplier || s.supplier === selectedSupplier)
  );

  const grandTotalValue = filteredSummary.reduce(
    (acc, cur) => acc + Number(showInSAR ? cur.totalValueInSAR : cur.poValue || 0),
    0
  );

  const grandTotalWithVAT = filteredSummary.reduce(
    (acc, cur) => acc + Number(showInSAR ? cur.totalWithVATInSAR : cur.poValueWithVAT || 0),
    0
  );

  const topTenSuppliers = [...summary]
    .sort((a, b) => b.totalValueInSAR - a.totalValueInSAR)
    .slice(0, 10)
    .map((s) => ({
      name: s.supplier.length > 10 ? s.supplier.slice(0, 10) + '…' : s.supplier,
      value: s.totalValueInSAR,
    }));

  const uniqueSuppliers = [...new Set(summary.map(s => s.supplier))];

  const handleViewDetails = async (supplierId: number, supplierName: string) => {
    setOpen(true);
    setSelectedSupplierName(supplierName);
    setIsFetchingDetails(true);
    try {
      const res = await fetch(`/api/supplier-summary/${supplierId}`);
      if (!res.ok) throw new Error('Failed to fetch PO details');
      const data: PO[] = await res.json();
      setSelectedDetails(data);
    } catch (err) {
      alert('Failed to load PO details.');
      setSelectedDetails([]);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  return (
    <div className="p-2 min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="gradient-title text-2xl">Issued Purchase Orders</h2>
        <Button onClick={() => setChartOpen(true)} className="bg-teal-600 text-white hover:bg-teal-700">TOP TEN Suppliers</Button>

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
            {uniqueSuppliers.map((supplier, index) => (
              <SelectItem key={`${supplier}-${index}`} value={supplier}>{supplier}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch checked={showInSAR} onCheckedChange={setShowInSAR} />
          <Label>Show in SAR</Label>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center mt-10">
          <BarLoader color="#3b82f6" />
        </div>
      ) : (
        <div className="flex-grow overflow-auto rounded-md border border-gray-300 max-h-[calc(100vh-150px)]">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className={`${thBase} w-16 text-left`}>S.No</th>
                <th className={`${thBase} w-44 text-left`}>PO Number</th>
                <th className={`${thBase} w-32 text-left`}>Currency</th>
                <th className={`${thBase} w-52 text-right`}>PO Value</th>
                <th className={`${thBase} w-52 text-right`}>PO W/ VAT</th>
                <th className={`${thBase} w-40 text-center`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSummary.map((item, index) => (
                <tr key={`${item.supplierId}-${index}`} className="even:bg-white/20 hover:bg-white/30 transition">
                  <td className="border px-4 py-1 text-left w-16">{index + 1}</td>
                  <td className="truncate border px-4 py-1 w-72">{item.supplier}</td>
                  <td className="truncate border px-4 py-1 w-72">{showInSAR ? 'SAR' : item.currency}</td>
                  <td className="truncate border px-4 py-1 w-52 text-right">
                    {formatNumber(showInSAR ? item.totalValueInSAR : item.poValue)}
                  </td>
                  <td className="truncate border px-4 py-1 w-52 text-right">
                    {formatNumber(showInSAR ? item.totalWithVATInSAR : item.poValueWithVAT)}
                  </td>
                  <td className="border px-4 py-1 w-36 text-center">
                    <Button
                      size="sm"
                      onClick={() => handleViewDetails(item.supplierId, item.supplier)}
                      className="bg-blue-500 text-white hover:bg-blue-700 hover:text-white rounded"
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot className="sticky bottom-0 bg-gray-200 font-semibold z-10">
              <tr>
                <td className="border px-4 py-1 text-left" colSpan={3}>Grand Total</td>
                <td className="border px-4 py-1 text-right" colSpan={1}>{formatNumber(grandTotalValue)}</td>
                <td className="border px-4 py-1 text-right">{formatNumber(grandTotalWithVAT)}</td>
                <td className="border px-4 py-1 text-center">—</td>
              </tr>
            </tfoot>
          </table>

        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>PO Details - {selectedSupplierName}</DialogTitle>
          </DialogHeader>
          {isFetchingDetails ? (
            <div className="flex justify-center items-center h-48">
              <PulseLoader color="#3b82f6" />
            </div>
          ) : selectedDetails.length === 0 ? (
            <div className="p-4 text-muted-foreground text-center">No PO details available</div>
          ) : (
            <div className="overflow-auto max-h-[400px] mt-4 border rounded-md">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className={`${thBase} w-16 text-left`}>S.No</th>
                    <th className={`${thBase} w-44 text-left`}>PO Number</th>
                    <th className={`${thBase} w-32 text-left`}>Currency</th>
                    <th className={`${thBase} w-52 text-right`}>PO Value</th>
                    <th className={`${thBase} w-52 text-right`}>PO W/ VAT</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDetails.map((po, index) => (
                    <tr key={`${po.poNumber}-${index}`} className="even:bg-gray-50">
                      <td className="px-4 py-1 text-left w-16">{index + 1}</td>
                      <td className="px-4 py-1 truncate w-44">{po.poNumber}</td>
                      <td className="px-4 py-1 w-32">{po.currency}</td>
                      <td className="px-4 py-1 text-right w-52">
                        {formatNumber(showInSAR ? po.poValueInSAR : po.poValue)} {showInSAR ? 'SAR' : po.currency}
                      </td>
                      <td className="px-4 py-1 text-right w-52">
                        {formatNumber(showInSAR ? po.poValueWithVATInSAR : po.poValueWithVAT)} {showInSAR ? 'SAR' : po.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-200 font-semibold">
                  <tr>
                    <td className="px-4 py-1 text-left" colSpan={3}>Grand Total</td>
                    <td className="px-4 py-1 text-right" colSpan={1}>
                      {formatNumber(
                        selectedDetails.reduce((acc, r) => acc + Number(showInSAR ? r.poValueInSAR : r.poValue), 0)
                      )}
                    </td>
                    <td className="px-4 py-1 text-right">
                      {formatNumber(
                        selectedDetails.reduce((acc, r) => acc + Number(showInSAR ? r.poValueWithVATInSAR : r.poValueWithVAT), 0)
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>

            </div>
          )}
          <DialogFooter><Button onClick={() => setOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Top 10 Chart Dialog */}
      <Dialog open={chartOpen} onOpenChange={setChartOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Top 10 Suppliers</DialogTitle>
          </DialogHeader>
          <div className="relative overflow-visible h-[400px] mt-4">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart
      data={topTenSuppliers}
      margin={{ top: 60, right: 30, left: 0, bottom: 40 }}
    >
      <XAxis dataKey="name" angle={-30} textAnchor="end" height={70} />
      <YAxis
        domain={[0, 'dataMax + 5000000']}
        tickFormatter={(value) => `${(value / 1_000_000)}M`}
      />
      <Tooltip
        formatter={(value: number) => `${(value / 1_000_000).toFixed(2)}M`}
      />
      <Bar dataKey="value">
        <LabelList
          dataKey="value"
           position="insideBottom"
          formatter={(value: number) => `${(value / 1_000_000).toFixed(2)} M`}
          fill="#fff"
          style={{ fontSize: '12px', fontWeight: 'bold' }}
        />
        {topTenSuppliers.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={`hsl(${(index * 35) % 360}, 70%, 50%)`}
          />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</div>

          <DialogFooter><Button onClick={() => setChartOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}