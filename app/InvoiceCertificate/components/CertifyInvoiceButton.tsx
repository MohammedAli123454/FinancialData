'use client';

import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import PaymentCertificatePDF from './PaymentCertificatePDF';
import { saveAs } from 'file-saver';

export default function CertifyInvoiceButton() {
  const handleDownload = async () => {
    const blob = await pdf(<PaymentCertificatePDF />).toBlob();
    saveAs(blob, 'PaymentCertificate.pdf');
  };

  return (
    <button
      onClick={handleDownload}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Certify Invoice
    </button>
  );
}
