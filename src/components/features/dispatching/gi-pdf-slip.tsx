"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { GoodsIssue } from "@/lib/types/dispatching";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: { marginBottom: 20, textAlign: "center" },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#666" },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    marginVertical: 12,
  },
  infoSection: { marginBottom: 16 },
  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: { fontWeight: "bold", width: 110 },
  infoValue: { flex: 1 },
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
  colSku: { width: "16%" },
  colName: { width: "32%" },
  colQty: { width: "12%", textAlign: "right" },
  colUnit: { width: "12%" },
  colNotes: { width: "20%" },
  totalRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: "#f9fafb",
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
  },
  totalLabel: {
    width: "56%",
    fontWeight: "bold",
    textAlign: "right",
    paddingRight: 8,
  },
  totalValue: { width: "12%", fontWeight: "bold", textAlign: "right" },
  footer: { marginTop: 40, fontSize: 8, color: "#999", textAlign: "center" },
});

interface GIPdfSlipProps {
  data: GoodsIssue;
}

export function GIPdfSlip({ data }: GIPdfSlipProps) {
  const totalQty = data.items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Slip Pengeluaran Barang</Text>
          <Text style={styles.subtitle}>Stock Management System</Text>
        </View>

        <View style={styles.divider} />

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nomor GI:</Text>
            <Text style={styles.infoValue}>{data.gi_number}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tanggal:</Text>
            <Text style={styles.infoValue}>{data.date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tujuan:</Text>
            <Text style={styles.infoValue}>{data.destination || "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={styles.infoValue}>
              {data.status === "COMPLETED" ? "Selesai" : "Draft"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dibuat oleh:</Text>
            <Text style={styles.infoValue}>{data.created_by}</Text>
          </View>
        </View>

        {/* Items Table */}
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
          {/* Total row */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{totalQty}</Text>
            <Text style={{ width: "32%" }} />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Dicetak oleh sistem pada{" "}
            {new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "Asia/Jakarta",
            })}{" "}
            — Dokumen ini digenerate otomatis oleh Stock Management System
          </Text>
        </View>
      </Page>
    </Document>
  );
}
