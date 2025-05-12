"use client"

import React, { useEffect, useState } from 'react';
import { BarLoader } from 'react-spinners';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface PO {
  poNumber: string;
  currency: string;
  poValue: number;
  poValueWithVAT: number;
  poValueInSAR: number;
  poValueWithVATInSAR: number;
}

interface SupplierSummary {
  supplier: string;
  currency: string;
  totalValueInSAR: number;
  totalWithVATInSAR: number;
  details: PO[];
}

const formatNumber = (value: number | undefined | null): string =>
  typeof value === 'number' && !isNaN(value) ? value.toFixed(2) : '0.00';

export default function SupplierSummaryPage() {
  const [summary, setSummary] = useState<SupplierSummary[]>([]);
  const [filteredSummary, setFilteredSummary] = useState<SupplierSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<PO[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [showInSAR, setShowInSAR] = useState(true);

  useEffect(() => {
    fetch('/api/supplier-summary')
      .then((res) => res.json())
      .then((data) => {
        setSummary(data);
        setFilteredSummary(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = [...summary];

    if (searchTerm) {
      result = result.filter((item) =>
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSupplier) {
      result = result.filter((item) => item.supplier === selectedSupplier);
    }

    setFilteredSummary(result);
  }, [searchTerm, selectedSupplier, summary]);

  const handleRowClick = (details: PO[]) => {
    setSelectedDetails(details);
    setOpen(true);
  };

  const uniqueSuppliers = [...new Set(summary.map((s) => s.supplier))];
  const currenciesUsed = [...new Set(filteredSummary.map(s => s.currency))].join(', ');

  const grandTotalValue = filteredSummary.reduce((acc, cur) =>
    acc + (showInSAR
      ? cur.totalValueInSAR
      : cur.details.reduce((a, d) => a + d.poValue, 0)
    ), 0);

  const grandTotalWithVAT = filteredSummary.reduce((acc, cur) =>
    acc + (showInSAR
      ? cur.totalWithVATInSAR
      : cur.details.reduce((a, d) => a + d.poValueWithVAT, 0)
    ), 0);

    const topTenSuppliers = [...summary]
    .sort((a, b) => Number(b.totalValueInSAR) - Number(a.totalValueInSAR))
    .slice(0, 10)
    .map((s) => ({
      name: s.supplier.length > 15 ? s.supplier.slice(0, 12) + '…' : s.supplier,
      fullName: s.supplier,
      value: Number(s.totalValueInSAR), // ✅ ensure it's a number before formatting
    }));
  

  return (
    <div className="p-6">
      {/* Title and Top 10 Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Purchase Order List By Supplier</h2>
        <Button
          variant="outline"
          onClick={() => setChartOpen(true)}
          className="text-sm font-semibold px-4 py-2"
        >
          TOP TEN Suppliers
        </Button>
      </div>

      {/* Filters */}
      <div className="flex w-full gap-4 mb-4">
        <div className="w-3/4">
          <Input
            placeholder="Search Supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="w-1/4">
          <Select
            value={selectedSupplier || '__all__'}
            onValueChange={(val) => setSelectedSupplier(val === '__all__' ? '' : val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All</SelectItem>
              {uniqueSuppliers.map((supplier) => (
                <SelectItem key={supplier} value={supplier}>
                  {supplier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Currency Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <Switch id="currency-toggle" checked={showInSAR} onCheckedChange={setShowInSAR} />
        <Label htmlFor="currency-toggle">Show values in Saudi Riyals(SR)</Label>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center mt-10">
          <BarLoader color="#3b82f6" height={6} width={200} />
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
              {filteredSummary.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-50 cursor-pointer even:bg-gray-50"
                  onClick={() => handleRowClick(item.details)}
                >
                  <td className="border px-4 py-2">{item.supplier}</td>
                  <td className="border px-4 py-2 text-right">
                    {formatNumber(
                      showInSAR
                        ? item.totalValueInSAR
                        : item.details.reduce((a, d) => a + d.poValue, 0)
                    )} {showInSAR ? 'SAR' : item.details[0]?.currency || ''}
                  </td>
                  <td className="border px-4 py-2 text-right">
                    {formatNumber(
                      showInSAR
                        ? item.totalWithVATInSAR
                        : item.details.reduce((a, d) => a + d.poValueWithVAT, 0)
                    )} {showInSAR ? 'SAR' : item.details[0]?.currency || ''}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="sticky bottom-0 bg-gray-200 font-semibold">
              <tr>
                <td className="border px-4 py-2">Grand Total</td>
                <td className="border px-4 py-2 text-right">
                  {formatNumber(grandTotalValue)} {showInSAR ? 'SAR' : currenciesUsed}
                </td>
                <td className="border px-4 py-2 text-right">
                  {formatNumber(grandTotalWithVAT)} {showInSAR ? 'SAR' : currenciesUsed}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* PO Detail Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>PO Details</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[400px] mt-4 rounded-md border border-gray-300">
            <table className="min-w-[800px] w-full text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="border px-4 py-2 text-left w-[30%]">PO Number</th>
                  <th className="border px-4 py-2 text-left w-[20%]">Currency</th>
                  <th className="border px-4 py-2 text-right w-[25%]">PO Value</th>
                  <th className="border px-4 py-2 text-right w-[25%]">PO with VAT</th>
                </tr>
              </thead>
              <tbody>
                {selectedDetails.map((row, idx) => (
                  <tr key={idx} className="even:bg-gray-50">
                    <td className="border px-4 py-2">{row.poNumber}</td>
                    <td className="border px-4 py-2">{row.currency}</td>
                    <td className="border px-4 py-2 text-right">
                      {formatNumber(showInSAR ? row.poValueInSAR : row.poValue)} {showInSAR ? 'SAR' : row.currency}
                    </td>
                    <td className="border px-4 py-2 text-right">
                      {formatNumber(showInSAR ? row.poValueWithVATInSAR : row.poValueWithVAT)} {showInSAR ? 'SAR' : row.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-200 font-semibold sticky bottom-0">
                <tr>
                  <td className="border px-4 py-2" colSpan={2}>Grand Total</td>
                  <td className="border px-4 py-2 text-right">
                    {formatNumber(
                      selectedDetails.reduce((acc, r) =>
                        acc + (showInSAR ? r.poValueInSAR : r.poValue), 0
                      )
                    )} {showInSAR ? 'SAR' : selectedDetails[0]?.currency || ''}
                  </td>
                  <td className="border px-4 py-2 text-right">
                    {formatNumber(
                      selectedDetails.reduce((acc, r) =>
                        acc + (showInSAR ? r.poValueWithVATInSAR : r.poValueWithVAT), 0
                      )
                    )} {showInSAR ? 'SAR' : selectedDetails[0]?.currency || ''}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Top 10 Chart Dialog */}
      <Dialog open={chartOpen} onOpenChange={setChartOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Top 10 Suppliers by PO Value (SAR)</DialogTitle>
          </DialogHeader>
          <div className="h-[400px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topTenSuppliers} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={() => setChartOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
