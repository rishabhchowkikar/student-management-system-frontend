import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Font 
} from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  companyInfo: {
    textAlign: 'right',
    fontSize: 10,
    color: '#666666',
    lineHeight: 1.4,
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  billedTo: {
    flex: 1,
    marginRight: 20,
  },
  invoiceInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 8,
  },
  text: {
    fontSize: 10,
    color: '#333333',
    marginBottom: 3,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: '#333333',
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666666',
    textTransform: 'uppercase',
  },
  tableCellRight: {
    flex: 1,
    fontSize: 10,
    color: '#333333',
    textAlign: 'right',
  },
  tableCellHeaderRight: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666666',
    textTransform: 'uppercase',
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 10,
    color: '#666666',
  },
  totalValue: {
    fontSize: 10,
    color: '#333333',
    fontWeight: 'bold',
  },
  finalTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#333333',
  },
  finalTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
  },
  finalTotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
  },
  depositSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#4f46e5',
  },
  depositRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginBottom: 5,
  },
  depositLabel: {
    fontSize: 10,
    color: '#4f46e5',
    fontWeight: 'bold',
  },
  depositValue: {
    fontSize: 10,
    color: '#4f46e5',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
  },
  footerSection: {
    marginBottom: 15,
  },
  footerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: 5,
  },
  footerText: {
    fontSize: 10,
    color: '#666666',
    lineHeight: 1.4,
  },
});

interface InvoiceData {
  paymentId: string;
  academicYear: string;
  studentName: string;
  rollNumber: string;
  email: string;
  course: string;
  department: string;
  hostelName: string;
  roomNumber: string;
  paymentAmount: number;
  paymentDate: string;
  hostelFee: number;
  maintenanceFee: number;
  securityDeposit: number;
  discount?: number;
  tax?: number;
}

interface InvoiceTemplateProps {
  data: InvoiceData;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ data }) => {
  const subtotal = data.hostelFee + data.maintenanceFee + data.securityDeposit;
  const discountAmount = data.discount || 0;
  const taxAmount = data.tax || 0;
  const total = subtotal - discountAmount + taxAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Invoice</Text>
          <View style={styles.companyInfo}>
            <Text>YOUR UNIVERSITY</Text>
            <Text>1234 University Street</Text>
            <Text>City, State</Text>
            <Text>Postal Code</Text>
            <Text>Country</Text>
            <Text>1-888-123-4567</Text>
          </View>
        </View>

        {/* Invoice Details */}
        <View style={styles.invoiceDetails}>
          <View style={styles.billedTo}>
            <Text style={styles.sectionTitle}>Billed To</Text>
            <Text style={styles.text}>{data.studentName}</Text>
            <Text style={styles.text}>Roll No: {data.rollNumber}</Text>
            <Text style={styles.text}>{data.email}</Text>
            <Text style={styles.text}>{data.course}</Text>
            <Text style={styles.text}>{data.department}</Text>
            <Text style={styles.text}>Room: {data.roomNumber}</Text>
            <Text style={styles.text}>Hostel: {data.hostelName}</Text>
          </View>
          
          <View style={styles.invoiceInfo}>
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.sectionTitle}>Date Issued</Text>
              <Text style={styles.text}>{new Date(data.paymentDate).toLocaleDateString()}</Text>
            </View>
            
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.sectionTitle}>Invoice Number</Text>
              <Text style={styles.text}>INV-{data.paymentId.slice(-8).toUpperCase()}</Text>
            </View>
            
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.sectionTitle}>Academic Year</Text>
              <Text style={styles.text}>{data.academicYear}</Text>
            </View>
            
            <View>
              <Text style={styles.sectionTitle}>Amount Due</Text>
              <Text style={[styles.text, { fontWeight: 'bold', fontSize: 12 }]}>
                ₹{total.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellHeader}>Description</Text>
            <Text style={styles.tableCellHeaderRight}>Rate</Text>
            <Text style={styles.tableCellHeaderRight}>Qty</Text>
            <Text style={styles.tableCellHeaderRight}>Amount</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>
              Hostel Accommodation Fee{'\n'}
              <Text style={{ fontSize: 8, color: '#666' }}>
                Academic year {data.academicYear} accommodation charges
              </Text>
            </Text>
            <Text style={styles.tableCellRight}>₹{data.hostelFee.toLocaleString()}</Text>
            <Text style={styles.tableCellRight}>1</Text>
            <Text style={styles.tableCellRight}>₹{data.hostelFee.toLocaleString()}</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>
              Maintenance & Utilities{'\n'}
              <Text style={{ fontSize: 8, color: '#666' }}>
                Monthly maintenance and utility charges
              </Text>
            </Text>
            <Text style={styles.tableCellRight}>₹{data.maintenanceFee.toLocaleString()}</Text>
            <Text style={styles.tableCellRight}>1</Text>
            <Text style={styles.tableCellRight}>₹{data.maintenanceFee.toLocaleString()}</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>
              Security Deposit{'\n'}
              <Text style={{ fontSize: 8, color: '#666' }}>
                Refundable security deposit
              </Text>
            </Text>
            <Text style={styles.tableCellRight}>₹{data.securityDeposit.toLocaleString()}</Text>
            <Text style={styles.tableCellRight}>1</Text>
            <Text style={styles.tableCellRight}>₹{data.securityDeposit.toLocaleString()}</Text>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>₹{subtotal.toLocaleString()}</Text>
          </View>
          
          {discountAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={styles.totalValue}>-₹{discountAmount.toLocaleString()}</Text>
            </View>
          )}
          
          {taxAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>
              <Text style={styles.totalValue}>+₹{taxAmount.toLocaleString()}</Text>
            </View>
          )}
          
          <View style={styles.finalTotal}>
            <Text style={styles.finalTotalLabel}>Total</Text>
            <Text style={styles.finalTotalValue}>₹{total.toLocaleString()}</Text>
          </View>
          
          <View style={styles.depositSection}>
            <View style={styles.depositRow}>
              <Text style={styles.depositLabel}>Amount Paid</Text>
              <Text style={styles.depositValue}>₹{data.paymentAmount.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>Notes</Text>
            <Text style={styles.footerText}>
              Thank you for your payment! This invoice serves as your official receipt for hostel fee payment.
            </Text>
          </View>
          
          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>Terms</Text>
            <Text style={styles.footerText}>
              Payment ID: {data.paymentId}{'\n'}
              For any queries regarding this invoice, please contact the hostel administration.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoiceTemplate;
