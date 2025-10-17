import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font
} from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v29/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf" }
  ]
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 11,
    paddingTop: 90,     // header space
    paddingBottom: 60,  // footer space
    paddingHorizontal: 35,
    lineHeight: 1.4
  },
  // HEADER
  header: {
    position: "absolute",
    top: 20,
    left: 35,
    right: 35,
    borderBottom: "1px solid #000",
    paddingBottom: 8
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  logo: { width: 80, height: 50, objectFit: "contain" },
  title: { fontSize: 16, fontWeight: "bold", textAlign: "right" },

  // TABLE
  table: {
    display: "table",
    width: "auto",
    border: "1px solid #000"
  },
  tableRow: { flexDirection: "row" },
  tableHeader: { fontWeight: "bold", backgroundColor: "#f0f0f0" },
  tableCol: {
    borderRight: "1px solid #000",
    padding: 4,
    flex: 1
  },

  // TOTALS + TERMS
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8
  },
  terms: {
    marginTop: 15,
    fontSize: 9,
    borderTop: "1px solid #000",
    paddingTop: 5
  },

  // FOOTER
  footer: {
    position: "absolute",
    bottom: 20,
    left: 35,
    right: 35,
    fontSize: 9,
    textAlign: "center",
    color: "gray"
  }
});

const InvoicePDF = ({ data }) => {
  const { company, invoice, items } = data;
  const subtotal = data.items && data.items.length > 0
  ? data.items.reduce((sum, i) => sum + i.qty * i.rate, 0)
  : 0
  const gst = subtotal * (invoice.gstRate / 100);
  const total = subtotal + gst;

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* ===== PAGE HEADER (repeats on all pages) ===== */}
        <View style={styles.header} fixed>
          <View style={styles.headerRow}>
            {/* <Image style={styles.logo} src={company.logo} /> */}
            <Text style={styles.title}>TAX INVOICE</Text>
          </View>
          <Text>{company.name}</Text>
          <Text>{company.address}</Text>
          <Text>GSTIN: {company.gstin}</Text>
        </View>

        {/* ===== INVOICE INFO ===== */}
        <View style={{ marginBottom: 8 }}>
          <Text>Invoice No: {invoice.no}</Text>
          <Text>Date: {invoice.date}</Text>
          <Text>Bill To: {invoice.customer}</Text>
          <Text>Place of Supply: {invoice.place}</Text>
        </View>

        {/* ===== ITEM TABLE ===== */}
        <View style={styles.table}>
          {/* Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCol, { flex: 0.5 }]}>#</Text>
            <Text style={[styles.tableCol, { flex: 2 }]}>Description</Text>
            <Text style={[styles.tableCol, { flex: 1 }]}>Qty</Text>
            <Text style={[styles.tableCol, { flex: 1 }]}>Rate</Text>
            <Text style={[styles.tableCol, { flex: 1 }]}>Amount</Text>
          </View>

          {/* Items (will wrap across pages automatically) */}
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCol, { flex: 0.5 }]}>{index + 1}</Text>
              <Text style={[styles.tableCol, { flex: 2 }]}>{item.desc}</Text>
              <Text style={[styles.tableCol, { flex: 1 }]}>{item.qty}</Text>
              <Text style={[styles.tableCol, { flex: 1 }]}>{item.rate.toFixed(2)}</Text>
              <Text style={[styles.tableCol, { flex: 1 }]}>{(item.qty * item.rate).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* ===== TOTALS ===== */}
        <View style={styles.totalRow}>
          <View>
            <Text>Subtotal: ₹{subtotal.toFixed(2)}</Text>
            <Text>GST ({invoice.gstRate}%): ₹{gst.toFixed(2)}</Text>
            <Text style={{ fontWeight: "bold" }}>Total: ₹{total.toFixed(2)}</Text>
          </View>
        </View>

        {/* ===== TERMS ===== */}
        <View style={styles.terms}>
          <Text>Terms & Conditions:</Text>
          <Text>1. Goods once sold will not be taken back.</Text>
          <Text>2. Payment due within 15 days.</Text>
          <Text>3. Subject to Chennai jurisdiction.</Text>
        </View>

        {/* ===== PAGE FOOTER (repeats) ===== */}
        <View style={styles.footer} fixed>
          <Text>Thank you for your business!</Text>
          {/* Dynamic Page Number */}
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
