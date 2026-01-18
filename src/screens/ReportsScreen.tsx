import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Card,
  Text,
  Button,
  SegmentedButtons,
  ActivityIndicator,
} from 'react-native-paper';
import DatePicker from '../components/DatePicker';
import { useAppContext } from '../context/AppContext';
import { exportData, ExportDataType, ExportFormat } from '../services/exportService';

const ReportsScreen: React.FC = () => {
  const { user } = useAppContext();
  const [dataType, setDataType] = useState<ExportDataType>('all');
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to export data');
      return;
    }

    setExporting(true);
    try {
      await exportData({
        userId: user.uid,
        dataType,
        format,
        startDate,
        endDate,
      });
      Alert.alert('Success', 'Data exported successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Export Data</Text>
          <Text style={styles.sectionDescription}>
            Export your tracking data for analysis or sharing with healthcare
            providers.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>Data Type</Text>
          <SegmentedButtons
            value={dataType}
            onValueChange={(value) => setDataType(value as ExportDataType)}
            buttons={[
              { value: 'all', label: 'All' },
              { value: 'symptoms', label: 'Symptoms' },
              { value: 'nutrition', label: 'Nutrition' },
              { value: 'growth', label: 'Growth' },
            ]}
            style={styles.segmentedButtons}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>Export Format</Text>
          <SegmentedButtons
            value={format}
            onValueChange={(value) => setFormat(value as ExportFormat)}
            buttons={[
              { value: 'csv', label: 'CSV' },
              { value: 'pdf', label: 'PDF' },
              { value: 'both', label: 'Both' },
            ]}
            style={styles.segmentedButtons}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>Date Range (Optional)</Text>
          <Text style={styles.hint}>
            Leave empty to export all data
          </Text>
          <DatePicker
            label="Start Date"
            value={startDate || new Date()}
            onChange={(date) => setStartDate(date)}
            mode="date"
            maximumDate={endDate || new Date()}
          />
          <DatePicker
            label="End Date"
            value={endDate || new Date()}
            onChange={(date) => setEndDate(date)}
            mode="date"
            minimumDate={startDate}
            maximumDate={new Date()}
          />
          {startDate && endDate && (
            <Button
              mode="text"
              onPress={() => {
                setStartDate(undefined);
                setEndDate(undefined);
              }}
              style={styles.clearButton}>
              Clear Date Range
            </Button>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={handleExport}
            loading={exporting}
            disabled={exporting}
            style={styles.exportButton}
            icon="download">
            {exporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.infoTitle}>Export Information</Text>
          <Text style={styles.infoText}>
            • CSV files can be opened in Excel, Google Sheets, or any spreadsheet
            application
          </Text>
          <Text style={styles.infoText}>
            • PDF reports include formatted summaries and charts
          </Text>
          <Text style={styles.infoText}>
            • Exported files can be shared via email, messaging apps, or saved
            to your device
          </Text>
          <Text style={styles.infoText}>
            • All data is exported securely and remains private
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  segmentedButtons: {
    marginTop: 8,
  },
  clearButton: {
    marginTop: 8,
  },
  exportButton: {
    marginTop: 8,
  },
  infoCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: '#E3F2FD',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default ReportsScreen;

