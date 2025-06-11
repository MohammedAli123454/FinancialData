'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 11, fontFamily: 'Helvetica' },
  header: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  twoColRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  col: { width: '48%' },
  label: { fontWeight: 'bold', fontSize: 12 },
  section: { marginBottom: 10 },
  row: { flexDirection: 'row', marginBottom: 3 },
  bold: { fontWeight: 'bold' },
  mt10: { marginTop: 10 },
  statusHeading: {
    fontWeight: 'bold',
    textDecoration: 'underline',
    fontSize: 12,
    marginBottom: 4,
  },

  table: { marginTop: 8, borderWidth: 1, borderColor: '#000' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#eee', borderBottomWidth: 1, borderColor: '#000' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0, borderColor: '#000' },
  tableRowWithTop: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#000' },
  tableCell: { flex: 1, padding: 4, borderRightWidth: 1, borderColor: '#000', fontSize: 10 },
  tableCellLast: { flex: 1, padding: 4, fontSize: 10 },
  tableCellBold: { flex: 1, padding: 4, borderRightWidth: 1, borderColor: '#000', fontSize: 10, fontWeight: 'bold' },
  tableCellLastBold: { flex: 1, padding: 4, fontSize: 10, fontWeight: 'bold' },

  signatureTable: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
    marginTop: 20,
  },
  signatureTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
    alignItems: 'stretch',
  },
  signatureTableCell: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: '#000',
    padding: 6,
    fontSize: 10,
    minHeight: 36,
    justifyContent: 'flex-start',
  },
  signatureTableCellLast: {
    flex: 1,
    padding: 6,
    fontSize: 10,
    minHeight: 36,
    justifyContent: 'flex-start',
  },
  signatureLabel: { fontWeight: 'bold' },
  signatureLine: {
    marginTop: 8,
    borderBottomWidth: 1,
    borderColor: '#000',
    width: '100%',
    height: 1,
  },
});

export default function PaymentCertificatePDF() {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.header}>YASREF-GCS</Text>
        
        {/* Two-column Info Row */}
        <View style={styles.twoColRow}>
          <View style={styles.col}>
            <Text>
              <Text style={styles.label}>Subcontract No.:</Text> DLC/2024/YASREF-GCS/4083
            </Text>
            <Text>
              <Text style={styles.label}>Subcontract Description:</Text> PO for Valves
            </Text>
            <Text>
              <Text style={styles.label}>Date Received:</Text> 4-Dec-24
            </Text>
            <Text>
              <Text style={styles.label}>Payment Due Date:</Text> Advance Settlement
            </Text>
          </View>
          <View style={styles.col}>
            <Text>
              <Text style={styles.label}>Invoice #:</Text> 4341840
            </Text>
            <Text>
              <Text style={styles.label}>Subcontractor:</Text> M/S. AIV Middle East
            </Text>
            <Text>
              <Text style={styles.label}>Date Correct Invoice:</Text> 4-Nov-24
            </Text>
          </View>
        </View>

        {/* Status Section */}
        <Text style={styles.statusHeading}>Current Subcontract Status</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={{ width: '65%' }}>Original Subcontract Value:</Text>
            <Text style={styles.bold}>USD 13,708.00</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ width: '65%' }}>Change Order Value:</Text>
            <Text style={styles.bold}>USD 5,708.00</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ width: '65%' }}>Current Subcontract Value:</Text>
            <Text style={styles.bold}>USD 13,708.00</Text>
          </View>
        </View>

        {/* Interim Payment Calculation */}
        <Text style={[styles.bold, { fontSize: 13, marginBottom: 6, textDecoration: 'underline' }]}>Interim Payment Calculation</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Description</Text>
            <Text style={styles.tableCell}>This Period</Text>
            <Text style={styles.tableCellLast}>Cumulative</Text>
          </View>
          {/* Table Rows */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Original Scope of Work</Text>
            <Text style={styles.tableCell}>USD 13,708.00</Text>
            <Text style={styles.tableCellLast}>USD 13,708.00</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Advance Payment (100%)</Text>
            <Text style={styles.tableCell}>USD 13,708.00</Text>
            <Text style={styles.tableCellLast}>USD 13,708.00</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>VAT @ 15%</Text>
            <Text style={styles.tableCell}>-</Text>
            <Text style={styles.tableCellLast}>-</Text>
          </View>
          {/* Subtotal - with horizontal line before */}
          <View style={styles.tableRowWithTop}>
            <Text style={styles.tableCellBold}>Subtotal</Text>
            <Text style={styles.tableCellBold}>USD 13,708.00</Text>
            <Text style={styles.tableCellLastBold}>USD 13,708.00</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Deductions</Text>
            <Text style={styles.tableCell}>-</Text>
            <Text style={styles.tableCellLast}>-</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Advance Payment Recovery</Text>
            <Text style={styles.tableCell}>-</Text>
            <Text style={styles.tableCellLast}>-</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Retention</Text>
            <Text style={styles.tableCell}>-</Text>
            <Text style={styles.tableCellLast}>-</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Debit Notes</Text>
            <Text style={styles.tableCell}>-</Text>
            <Text style={styles.tableCellLast}>-</Text>
          </View>
          {/* Net Invoice - with horizontal line before */}
          <View style={styles.tableRowWithTop}>
            <Text style={styles.tableCellBold}>Net Invoice</Text>
            <Text style={styles.tableCellBold}>USD 13,708.00</Text>
            <Text style={styles.tableCellLastBold}>USD 13,708.00</Text>
          </View>
        </View>
        <Text style={{ marginTop: 8 }}>
          Amount in Words: USD Thirteen Thousand Seven Hundred Eight Only.
        </Text>

        <View style={styles.signatureTable}>
  {/* First row: Titles */}
  <View style={styles.signatureTableRow}>
    <Text style={styles.signatureTableCell}><Text style={styles.signatureLabel}>Prepared By</Text></Text>
    <Text style={styles.signatureTableCell}><Text style={styles.signatureLabel}>Certified By</Text></Text>
    <Text style={styles.signatureTableCell}><Text style={styles.signatureLabel}>Approved By</Text></Text>
    <Text style={styles.signatureTableCell}><Text style={styles.signatureLabel}>CFO</Text></Text>
    <Text style={styles.signatureTableCellLast}><Text style={styles.signatureLabel}>CEO</Text></Text>
  </View>
  {/* Second row: Names (example; leave blank if needed) */}
  <View style={styles.signatureTableRow}>
    <Text style={styles.signatureTableCell}>Safaraj Sadik</Text>
    <Text style={styles.signatureTableCell}>Narayanan Sugumaran</Text>
    <Text style={styles.signatureTableCell}>Raj Ahmed</Text>
    <Text style={styles.signatureTableCell}></Text>
    <Text style={styles.signatureTableCellLast}></Text>
  </View>
  {/* Third row: Signature lines */}
  <View style={styles.signatureTableRow}>
    <Text style={styles.signatureTableCell}>Signature:{'\n'}<Text style={styles.signatureLine}></Text></Text>
    <Text style={styles.signatureTableCell}>Signature:{'\n'}<Text style={styles.signatureLine}></Text></Text>
    <Text style={styles.signatureTableCell}>Signature:{'\n'}<Text style={styles.signatureLine}></Text></Text>
    <Text style={styles.signatureTableCell}>Signature:{'\n'}<Text style={styles.signatureLine}></Text></Text>
    <Text style={styles.signatureTableCellLast}>Signature:{'\n'}<Text style={styles.signatureLine}></Text></Text>
  </View>
  {/* Fourth row: Titles/roles */}
  <View style={styles.signatureTableRow}>
    <Text style={styles.signatureTableCell}>Planning</Text>
    <Text style={styles.signatureTableCell}>Procurement</Text>
    <Text style={styles.signatureTableCell}>Project Director</Text>
    <Text style={styles.signatureTableCell}>Chief Financial Officer</Text>
    <Text style={styles.signatureTableCellLast}>Chief Executive Officer</Text>
  </View>
</View>


        {/* Table: Scope of Work */}
        <Text style={[styles.bold, styles.mt10]}>Scope of Work</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Scope</Text>
            <Text style={styles.tableCell}>Subcontract Amount</Text>
            <Text style={styles.tableCell}>Previous Cumulative</Text>
            <Text style={styles.tableCell}>Period Amount</Text>
            <Text style={styles.tableCellLast}>Cumulative</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>PO for Valves</Text>
            <Text style={styles.tableCell}>USD 13,708.00</Text>
            <Text style={styles.tableCell}>-</Text>
            <Text style={styles.tableCell}>USD 13,708.00</Text>
            <Text style={styles.tableCellLast}>USD 13,708.00</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
