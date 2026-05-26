"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { GoodsReceipt } from "@/lib/types/receiving";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: { marginBottom: 20, textAlign: "center" },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#666" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  infoLabel: { fontWeight: "bold", width: 100 },
  table: { marginTop: 16 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  colNo: { width: "8%" },
  colSku: { width: "18%" },
  colName: { width: "34%" },
  colQty: { width: "12%", textAlign: "right" },
  colUnit: { width: "12%" },
  colNotes: { width: "16%" },
  footer: { marginTop: 30, fontSize: 8, color: "#999", textAlign: "center" },
});

interface GRPdfSlipProps {
  data: GoodsReceipt;
}

export function GRPdfSlip({ data }: GRPdfSlipProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Slip Penerimaan Barang</Text>
          <Text style={styles.subtitle}>Stock Management System</Text>
        </View>

        <View style={styles.infoRow}>
          <Text><Text style={styles.infoLabel}>Nomor GR:</Text> {data.gr_number}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text><Text style={styles.infoLabel}>Tanggal:</Text> {data.date}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text><Text style={styles.infoLabel}>Supplier:</Text> {data.supplier_name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text><Text style={styles.infoLabel}>Status:</Text> {data.status === "COMPLETED" ? "Selesai" : "Draft"}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colNo}>No</Text>
            <Text style={styles.colSku}>SKU</Text>
            <Text style={styles.colName}>Nama Produk</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colUnit}>Satuan</Text>
            <Text style={styles.colNotes}>Catatan</Text>
          </View>
          {data.items.map((item, idx) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.colNo}>{idx + 1}</Text>
              <Text style={styles.colSku}>{item.sku}</Text>
              <Text style={styles.colName}>{item.product_name}</Text>
              <Text style={styles.colQty}>{item.qty}</Text>
              <Text style={styles.colUnit}>{item.unit_name}</Text>
              <Text style={styles.colNotes}>{item.notes ?? "-"}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Dicetak pada {new Date().toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" })} — Dokumen ini digenerate otomatis</Text>
        </View>
      </Page>
    </Document>
  );
}
