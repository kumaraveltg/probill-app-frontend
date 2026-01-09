import React from "react";
import { Page, Text, View, Document, StyleSheet, Font, Image } from "@react-pdf/renderer";

// Register Roboto font
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v29/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf" },
  ],
});

// Styles
const styles = StyleSheet.create({
  page: { fontFamily: "Roboto", fontSize: 10, paddingTop: 15, paddingBottom: 40, paddingHorizontal: 30, lineHeight: 1.3 },
  companySection: { marginTop: 1, marginBottom: 1, textAlign: "center" },
  companyName: { fontSize: 18, fontWeight: "bold", textTransform: "uppercase", marginBottom: 3 },
  companyAddress: { fontSize: 10, textAlign: "center", marginBottom: 2 },
  companyGstin: { fontSize: 10, textAlign: "center", marginBottom: 5 },
  table: { display: "table", width: "auto", border: "1px solid #000" },
  tableRow: { flexDirection: "row" },
  tableHeader: { fontWeight: "bold", backgroundColor: "#f0f0f0" },
  tableCol: { borderRight: "1px solid #000", padding: 4, flex: 1 },
  terms: { marginTop: 15, fontSize: 9, borderTop: "1px solid #000", paddingTop: 5 },
});

const InvoicePDF = ({ data, qrImage }) => {
  const { company, invoice, items, fsub } = data;

  const MAX_ROWS = 15;

  // Fill empty rows if less than MAX_ROWS
  const filledItems = [
    ...items,
    ...Array.from({ length: MAX_ROWS - items.length }, () => ({
      idx: "",
      desc: "",
      uom: "",
      qty: "",
      rate: "",
      amount: "",
      taxname: "",
      taxamt: "",
      netamt: "",
    })),
  ];

  // Totals
  const subtotal = items.reduce(
    (acc, item) => {
      acc.qty += item.qty;
      acc.amount += item.amount;
      acc.taxamt += item.taxamt;
      acc.netamt += item.netamt;
      return acc;
    },
    { qty: 0, amount: 0, taxamt: 0, netamt: 0 }
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* COMPANY INFO */}
        <View style={styles.companySection}>
          <Text style={styles.companyName}>{company.name}</Text>
          <Text style={styles.companyAddress}>{company.address.replace(/\n/g, ", ")}</Text>
          <Text style={styles.companyGstin}>GSTIN: {company.gstin}</Text>
          <View style={{ borderBottom: "1px solid #000", marginVertical: 6 }} />
          <Text style={{ fontSize: 14, fontWeight: "bold", textAlign: "center" }}>SALES INVOICE</Text>
        </View>

        {/* BILL, SHIP, INVOICE INFO */}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 18,
            borderTop: "1px solid #000",
            borderBottom: "1px solid #000",
            paddingTop: 0,
            paddingBottom: 0,
          }}
        >
          {/* Billing Address */}
          <View style={{ width: "33%", paddingLeft: 6, paddingRight: 6, borderRight: "1px solid #000", borderLeft: "1px solid #000", minHeight: "120px" }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 6 }}>Bill To</Text>
            <Text>{invoice.customername}</Text>
            <Text>{invoice.add1}</Text>
            <Text>{invoice.add2}</Text>
            <Text>{invoice.city}</Text>
            <Text>{invoice.state}</Text>
            <Text>{invoice.pincode}</Text>
          </View>

          {/* Shipping Address */}
          <View style={{ width: "33%", paddingLeft: 6, paddingRight: 6, borderRight: "1px solid #000" }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 6 }}>Ship To</Text>
            <Text>{invoice.customername}</Text>
            <Text>{invoice.sadd1}</Text>
            <Text>{invoice.sadd2}</Text>
            <Text>{invoice.scity}</Text>
            <Text>{invoice.sstate}</Text>
            <Text>{invoice.spincode}</Text>
          </View>

          {/* Invoice Details + QR */}
          <View style={{ width: "33%", paddingLeft: 6, borderRight: "1px solid #000" }}>
            <Text>Invoice No: {invoice.no}</Text>
            <Text>Date: {invoice.date}</Text>
            <Text>Place of Supply: {invoice.place}</Text>
            <Text>Payment Terms: {invoice.terms}</Text>
            <Text>Due Date: {invoice.dueDate}</Text>

            {/* QR */}
            <View style={{ marginTop: 6, flexDirection: "column", alignItems: "flex-start" }}>
              {qrImage ? (
                <Image src={qrImage} style={{ width: 80, height: 80, objectFit: "contain" }} />
              ) : (
                <Text style={{ fontSize: 8, color: "gray" }}>QR not available</Text>
              )}
              <Text style={{ fontSize: 8, marginTop: 2 }}>Scan to view invoice</Text>
            </View>
          </View>
        </View>

        {/* ITEM TABLE */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCol, { flex: 0.25 }]}>#</Text>
            <Text style={[styles.tableCol, { flex: 2 }]}>Description</Text>
            <Text style={[styles.tableCol, { flex: 1 }]}>Unit</Text>
            <Text style={[styles.tableCol, { flex: 1 }]}>Qty</Text>
            <Text style={[styles.tableCol, { flex: 1 }]}>Rate</Text>
            <Text style={[styles.tableCol, { flex: 1 }]}>Amount</Text>
            <Text style={[styles.tableCol, { flex: 1 }]}>Tax</Text>
            <Text style={[styles.tableCol, { flex: 1 }]}>Tax Amount</Text>
            <Text style={[styles.tableCol, { flex: 1 }]}>Net Amount</Text>
          </View>

          {filledItems.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.tableCol, { flex: 0.25 }]}>{idx < items.length ? idx + 1 : ""}</Text>
              <Text style={[styles.tableCol, { flex: 2 }]}>{item.desc}</Text>
              <Text style={[styles.tableCol, { flex: 1 }]}>{item.uom}</Text>
              <Text style={[styles.tableCol, { flex: 1, textAlign: "right" }]}>{item.qty ? item.qty.toFixed(3) : ""}</Text>
              <Text style={[styles.tableCol, { flex: 1, textAlign: "right" }]}>{item.rate ? item.rate.toFixed(2) : ""}</Text>
              <Text style={[styles.tableCol, { flex: 1, textAlign: "right" }]}>{item.amount ? item.amount.toFixed(2) : ""}</Text>
              <Text style={[styles.tableCol, { flex: 1 }]}>{item.taxname || ""}</Text>
              <Text style={[styles.tableCol, { flex: 1, textAlign: "right" }]}>{item.taxamt ? item.taxamt.toFixed(2) : ""}</Text>
              <Text style={[styles.tableCol, { flex: 1, textAlign: "right" }]}>{item.netamt ? item.netamt.toFixed(2) : ""}</Text>
            </View>
          ))}
        </View>

        {/* SUBTOTAL */}
        <View style={{ flexDirection: "row", borderTopWidth: 1, borderColor: "#000", paddingTop: 4 }}>
          <Text style={{ flex: 1, fontSize: 10, fontWeight: "bold" }}>Total</Text>
          <Text style={{ flex: 3, fontSize: 10, textAlign: "right" }}>{subtotal.qty.toFixed(3)}</Text>
          <Text style={{ flex: 2, fontSize: 10, textAlign: "right" }}>{subtotal.amount.toFixed(2)}</Text>
          <Text style={{ flex: 2, fontSize: 10, textAlign: "right" }}>{subtotal.taxamt.toFixed(2)}</Text>
          <Text style={{ flex: 1, fontSize: 10, textAlign: "right" }}>{subtotal.netamt.toFixed(2)}</Text>
        </View>

        {/* FOOTER ITEMS */}
        {fsub && fsub.length > 0 && (
          <View style={{ marginTop: 8 }}>
            {fsub.map((f, index) => (
              <View key={index} style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <Text style={{ fontSize: 10, fontWeight: "bold", marginRight: 4 }}>{f.fcaption}:</Text>
                <Text style={{ fontSize: 10, textAlign: "right", width: 80 }}>{f.famt.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* TERMS */}
        <View style={styles.terms}>
          <Text>Terms & Conditions:</Text>
          <Text>1. Goods once sold will not be taken back.</Text>
          <Text>2. Payment due within 15 days.</Text>
          <Text>3. Subject to Chennai jurisdiction.</Text>
        </View>

        {/* FOOTER SIGNATURE */}
        <View style={{ position: "absolute", bottom: 40, right: 35, alignItems: "center" }}>
          <Text style={{ fontSize: 10, marginBottom: 20 }}>For {company.name}</Text>
          <Text style={{ fontSize: 10, marginBottom: 4 }}></Text>
          <Text style={{ fontSize: 10, marginBottom: 4 }}></Text>
          <Text style={{ fontSize: 10, marginBottom: 4 }}></Text>
          <Text style={{ fontSize: 10, marginBottom: 4 }}></Text>
          <Text style={{ fontSize: 10, marginTop: 2, fontWeight: "bold" }}>Authorized Signature & Seal</Text>
        </View>

        {/* FOOTER MESSAGE */}
        <View style={{ position: "absolute", bottom: 10, left: 30, right: 30, textAlign: "center" }} fixed>
          <Text style={{ color: "gray", fontSize: 9 }}>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
