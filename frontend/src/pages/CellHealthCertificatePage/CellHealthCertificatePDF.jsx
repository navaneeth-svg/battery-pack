import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import CircuitParameterConstant from '../../components/CellInfo/CircuitParameterConstant';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fff',
    padding: 40,
    fontSize: 12,
    color: '#222',
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottom: '2 solid #e8442d',
    paddingBottom: 12,
    paddingTop: 12,
    marginBottom: 32,
    justifyContent: 'space-between',
    borderRadius: 12,
    boxShadow: '0 2px 8px #e8442d22',
    paddingHorizontal: 24,
  },
  titleBlock: {
    flex: 1,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    color: '#e8442d',
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 6,
    letterSpacing: 1,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#e8442d',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 18,
    marginTop: 20,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    borderLeft: '4 solid #e8442d',
    paddingLeft: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    color: '#e8442d',
    fontWeight: 'bold',
    width: '40%',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  value: {
    color: '#222',
    fontWeight: 500,
    width: '60%',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    marginBottom: 32,
    gap: 24,
  },
  statCard: {
    backgroundColor: '#fff',
    border: '1.5 solid #e8442d',
    borderRadius: 16,
    padding: 22,
    minWidth: 130,
    alignItems: 'center',
    marginHorizontal: 8,
    boxShadow: '0 2px 8px #e8442d22',
  },
  statLabel: {
    color: '#e8442d',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 22,
    letterSpacing: 1,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 32,
    gap: 32,
  },
  cellImage: {
    width: 120,
    height: 120,
    objectFit: 'cover',
    border: '1.5 solid #e8442d',
    borderRadius: 12,
    marginRight: 16,
    boxShadow: '0 2px 8px #e8442d22',
  },
  barcode: {
    width: 150,
    height: 150,
    objectFit: 'contain',
    borderRadius: 12,
    padding: 4,
    boxShadow: '0 2px 8px #e8442d22',
  },
  table: {
    display: 'table',
    width: 'auto',
    marginBottom: 18,
    border: '1.5 solid #e8442d',
    borderRadius: 8,
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px #e8442d22',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e8442d',
    backgroundColor: '#f7f8fa',
  },
  tableHeader: {
    backgroundColor: '#e8442d',
    color: '#fff',
    padding: 8,
    fontSize: 13,
    flex: 1,
    textAlign: 'center',
    borderRight: '1 solid #e8442d',
    letterSpacing: 1,
  },
  tableCell: {
    padding: 8,
    fontSize: 12,
    flex: 1,
    textAlign: 'center',
    borderRight: '1 solid #e8442d',
    color: '#222',
  },
  plotImage: {
    width: 370,
    height: 200,
    objectFit: 'contain',
    marginVertical: 16,
    alignSelf: 'center',
    border: '1.5 solid #e8442d',
    borderRadius: 12,
    boxShadow: '0 2px 8px #e8442d22',
  },
  placeholder: {
    color: '#aaa',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 12,
    paddingBottom: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  signatureBlock: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  signature: {
    marginTop: 10,
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 0,
  },
  date: {
    fontSize: 11,
    color: '#888',
    fontWeight: 500,
  },
  logo: {
    width: 54,
    height: 54,
    objectFit: 'contain',
    padding: 4,
    borderRadius: 12,
    boxShadow: '0 2px 8px #e8442d22',
  },
  cellImagesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    padding: 12,
  },
  cellDemoImage: {
    width: 150,
    height: 200,
    objectFit: 'cover',
    borderRadius: 12,
    backgroundColor: '#fff',
    border: '1.5 solid #e8442d',
    marginHorizontal: 8,
    boxShadow: '0 2px 8px #e8442d22',
  },
  circuitImage: {
    width: 500,
    height: 200,
    objectFit: 'contain',
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    border: '1.5 solid #e8442d',
    boxShadow: '0 2px 8px #e8442d22',
  },
});

const CellHealthCertificatePDF = ({
  cellData = {},
  circuitParameters = {},
  soh = '90',
  rul = '575',
  date = new Date().toLocaleDateString(),
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image src={'https://scope.thinkclock.com/assets/Tab_Icon.png'} style={styles.logo} />
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Cell Health Certificate</Text>
          <Text style={styles.subtitle}>Comprehensive Analysis Report</Text>
        </View>
      </View>

      <View style={styles.cellImagesRow}>
        <Image src={'https://scope.thinkclock.com/assets/cert/cellCertimg1.jpeg'} style={styles.cellDemoImage} />
        <Image src={'https://scope.thinkclock.com/assets/cert/cellCertimg2.jpeg'} style={styles.cellDemoImage} />
        <Image src={'https://scope.thinkclock.com/assets/cert/cellCertimg3.jpeg'} style={styles.cellDemoImage} />
      </View>

      <Text style={styles.sectionTitle}>Cell Information</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Make/Model:</Text>
            <Text style={styles.value}>LG 21700</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nominal Capacity:</Text>
            <Text style={styles.value}>5000 mAh</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Chemistry:</Text>
            <Text style={styles.value}>NMC</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nominal Voltage:</Text>
            <Text style={styles.value}>3.6 V</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Key Metrics</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>SOH</Text>
          <Text style={styles.statValue}>{soh}%</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>RUL</Text>
          <Text style={styles.statValue}>{rul} Cycles</Text>
        </View>
      </View>
      
      <View break />

      <Text style={styles.sectionTitle}>Capacity vs Cycle</Text>
      <Image src={'https://scope.thinkclock.com/assets/cert/plots/capvscycle.png'} style={{ width: '100%', height: 220, objectFit: 'contain', marginVertical: 12, alignSelf: 'center' }} />

      <Text style={styles.sectionTitle}>Internal Resistance vs Cycle</Text>
      <Image src={'https://scope.thinkclock.com/assets/cert/plots/irvscycle.png'} style={{ width: '100%', height: 220, objectFit: 'contain', marginVertical: 12, alignSelf: 'center' }} />

      <View style={styles.footer}>
        <Text style={styles.date}>Date: {date}</Text>
        <View style={styles.signatureBlock}>
          <Text>Authorized by</Text>
          <Text style={styles.signature}>ThinkClock Battery Analytics Team</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default CellHealthCertificatePDF;
