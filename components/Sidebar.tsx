'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { LuPanelLeftClose, LuPanelRightClose } from 'react-icons/lu';

import { Button } from '@/components/ui/button';
import { useTransition } from 'react';
import SignOutButton from './SignOutButton';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  // ─── Hooks must be called directly inside the component ───
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({});

  // Utility to highlight active link
  const isActive = (path: string) => (pathname.startsWith(path) ? 'bg-gray-200' : '');

  // Your sections definition
  const sections = [
    {
      title: 'Invoices Status',
      links: [
        { name: 'Invoices Status', path: '/InvoicesStatus' },
        { name: 'Partial Invoices Entry', path: '/PartialInvoicesEntry' },
        { name: 'Invoices Submission Analysis', path: '/InvoicesSubmissionPercentage' },
      ],
    },
    {
      title: 'Master Data',
      links: [
        { name: 'Create New MOC', path: '/CreateNewMoc' },
        { name: 'Register Page', path: '/RegisterPage' },
        { name: 'Employee', path: '/Employee' },
      ],
    },


    {
      title: 'Bill Payables Section',
      links: [
        { name: 'Create New Supplier', path: '/supplier-curd' },
        { name: 'Create New PO', path: '/Pos-curd' },
        { name: 'Purchase Orders Summary', path: '/SupplierSummaryPage' },
        { name: 'Certified Invoice Statement', path: '/SupplierStatementPage' },
        { name: 'Upload Certified Invoices', path: '/UploadInvoices' },
      ],
    },




  ];

  // ─── Define your handler inside the component so it sees router & startTransition ───
  const handleSignOut = () => {
    startTransition(async () => {
      const res = await fetch('/api/signout', { method: 'POST' });
      if (res.redirected) {
        router.push(res.url);
      } else {
        // fallback
        router.push('/');
      }
    });
  };
  

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-0 left-4 z-50 p-2 hover:text-gray-700 transition-all"
      >
        {isOpen ? <LuPanelLeftClose size={25} /> : <LuPanelRightClose size={25} />}
      </button>

      {/* Sidebar Container */}
      <div
        className={`
          bg-gray-100 fixed top-0 left-0 h-screen shadow-md transition-all duration-300
          flex flex-col
          ${isOpen ? 'w-64' : 'w-0 overflow-hidden'}
        `}
      >
        {/* Scrollable Sections */}
        <div className="mt-12 flex-1 overflow-y-auto p-1">
          {sections.map((section) => (
            <div key={section.title} className="mb-4">
              <button
                onClick={() =>
                  setOpenSections((prev) => ({
                    ...prev,
                    [section.title]: !prev[section.title],
                  }))
                }
                className="w-full text-left font-semibold py-2 px-3 flex justify-between items-center hover:bg-gray-200 rounded"
              >
                {section.title}
                {openSections[section.title] ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
              </button>
              {openSections[section.title] && (
                <ul className="pl-4">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.path}
                        className={`block py-1 px-2 rounded hover:bg-gray-200 ${isActive(link.path)}`}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Sign Out Button at the Bottom */}
        <div className="p-4">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
