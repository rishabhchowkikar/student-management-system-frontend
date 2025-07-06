import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet 
} from '@react-pdf/renderer';

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

interface CourseFeesInvoiceData {
  paymentId: string;
  academicYear: string;
  studentName: string;
  rollNumber: string;
  email: string;
  course: string;
  department: string;
  school: string;
  paymentAmount: number;
  paymentDate: string;
  tuitionFee: number;
  labFee: number;
  libraryFee: number;
  examFee: number;
  developmentFee: number;
  otherFees: number;
  discount?: number;
  lateFee?: number;
}

interface CourseFeesInvoiceTemplateProps {
  data: CourseFeesInvoiceData;
}

const CourseFeesInvoiceTemplate: React.FC<CourseFeesInvoiceTemplateProps> = ({ data }) => {
  const subtotal = data.tuitionFee + data.labFee + data.libraryFee + data.examFee + data.developmentFee + data.otherFees;
  const discountAmount = data.discount || 0;
  const lateFeeAmount = data.lateFee || 0;
  const total = subtotal - discountAmount + lateFeeAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Payment Receipt</Text>
          <View style={styles.companyInfo}>
            <Text>CENTRAL UNIVERSITY OF HARYANA</Text>
            <Text>NAAC Accredited 'A' Grade University</Text>
            <Text>Mahendergarh, Haryana</Text>
            <Text>Pin Code: 123031</Text>
            <Text>India</Text>
            <Text>Phone: +91-1234-567890</Text>
          </View>
        </View>

        {/* Invoice Details */}
        <View style={styles.invoiceDetails}>
          <View style={styles.billedTo}>
            <Text style={styles.sectionTitle}>Student Details</Text>
            <Text style={styles.text}>{data.studentName}</Text>
            <Text style={styles.text}>Roll No: {data.rollNumber}</Text>
            <Text style={styles.text}>{data.email}</Text>
            <Text style={styles.text}>{data.course}</Text>
            <Text style={styles.text}>{data.department}</Text>
            <Text style={styles.text}>{data.school}</Text>
          </View>
          
          <View style={styles.invoiceInfo}>
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.sectionTitle}>Payment Date</Text>
              <Text style={styles.text}>{new Date(data.paymentDate).toLocaleDateString()}</Text>
            </View>
            
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.sectionTitle}>Receipt Number</Text>
              <Text style={styles.text}>CF-{data.paymentId.slice(-8).toUpperCase()}</Text>
            </View>
            
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.sectionTitle}>Academic Year</Text>
              <Text style={styles.text}>{data.academicYear}</Text>
            </View>
            
            <View>
              <Text style={styles.sectionTitle}>Amount Paid</Text>
              <Text style={[styles.text, { fontWeight: 'bold', fontSize: 12, color: '#4f46e5' }]}>
                ₹{data.paymentAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Fee Breakdown Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellHeader}>Fee Type</Text>
            <Text style={styles.tableCellHeaderRight}>Amount</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Tuition Fee</Text>
            <Text style={styles.tableCellRight}>₹{data.tuitionFee.toLocaleString()}</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Laboratory Fee</Text>
            <Text style={styles.tableCellRight}>₹{data.labFee.toLocaleString()}</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Library Fee</Text>
            <Text style={styles.tableCellRight}>₹{data.libraryFee.toLocaleString()}</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Examination Fee</Text>
            <Text style={styles.tableCellRight}>₹{data.examFee.toLocaleString()}</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Development Fee</Text>
            <Text style={styles.tableCellRight}>₹{data.developmentFee.toLocaleString()}</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Other Fees</Text>
            <Text style={styles.tableCellRight}>₹{data.otherFees.toLocaleString()}</Text>
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
          
          {lateFeeAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Late Fee</Text>
              <Text style={styles.totalValue}>+₹{lateFeeAmount.toLocaleString()}</Text>
            </View>
          )}
          
          <View style={styles.finalTotal}>
            <Text style={styles.finalTotalLabel}>Total Amount</Text>
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
            <Text style={styles.footerTitle}>Payment Confirmation</Text>
            <Text style={styles.footerText}>
              This is a computer-generated receipt for your course fee payment. 
              Thank you for your payment!
            </Text>
          </View>
          
          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>Important Information</Text>
            <Text style={styles.footerText}>
              Payment ID: {data.paymentId}{'\n'}
              This receipt is valid for all official purposes.{'\n'}
              For any queries, please contact the accounts department.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default CourseFeesInvoiceTemplate;