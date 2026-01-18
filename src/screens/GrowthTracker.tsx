import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  FAB,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LineChart } from 'react-native-chart-kit';
import { useAppContext } from '../context/AppContext';
import {
  getGrowthEntries,
  deleteGrowthEntry,
} from '../services/growthService';
import { GrowthEntry, convertWeightToKg, convertHeightToCm } from '../models/GrowthEntry';
import { formatDate } from '../utils/dateUtils';
import { RootStackParamList } from '../navigation/AppNavigator';

type GrowthTrackerNavigationProp = StackNavigationProp<RootStackParamList>;

const screenWidth = Dimensions.get('window').width;

const GrowthTracker: React.FC = () => {
  const navigation = useNavigation<GrowthTrackerNavigationProp>();
  const { user } = useAppContext();
  const [entries, setEntries] = useState<GrowthEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEntries = useCallback(async () => {
    if (!user) return;

    try {
      const data = await getGrowthEntries(user.uid);
      // Sort by date ascending for charts
      const sortedData = [...data].sort(
        (a, b) =>
          (a.date instanceof Date ? a.date.getTime() : a.date.toMillis()) -
          (b.date instanceof Date ? b.date.getTime() : b.date.toMillis())
      );
      setEntries(sortedData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load growth entries');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadEntries();
  };

  const handleDelete = (entryId: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this growth entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            try {
              await deleteGrowthEntry(user.uid, entryId);
              await loadEntries();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  const prepareWeightChartData = () => {
    if (entries.length === 0) return null;

    const labels = entries.map((entry) => formatDate(entry.date, 'MMM dd'));
    const weights = entries.map((entry) =>
      convertWeightToKg(entry.weight, entry.weightUnit)
    );

    return {
      labels: labels.length > 7 ? labels.slice(-7) : labels,
      datasets: [
        {
          data: weights.length > 7 ? weights.slice(-7) : weights,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const prepareHeightChartData = () => {
    if (entries.length === 0) return null;

    const labels = entries.map((entry) => formatDate(entry.date, 'MMM dd'));
    const heights = entries.map((entry) =>
      convertHeightToCm(entry.height, entry.heightUnit)
    );

    return {
      labels: labels.length > 7 ? labels.slice(-7) : labels,
      datasets: [
        {
          data: heights.length > 7 ? heights.slice(-7) : heights,
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const prepareBMIChartData = () => {
    if (entries.length === 0) return null;

    const labels = entries.map((entry) => formatDate(entry.date, 'MMM dd'));
    const bmis = entries.map((entry) => entry.bmi || 0).filter((bmi) => bmi > 0);

    if (bmis.length === 0) return null;

    return {
      labels: labels.length > 7 ? labels.slice(-7) : labels,
      datasets: [
        {
          data: bmis.length > 7 ? bmis.slice(-7) : bmis,
          color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#2196F3',
    },
  };

  const weightData = prepareWeightChartData();
  const heightData = prepareHeightChartData();
  const bmiData = prepareBMIChartData();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No growth entries yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to log your first growth measurement
          </Text>
        </View>
      ) : (
        <>
          {weightData && (
            <Card style={styles.chartCard}>
              <Card.Content>
                <Text style={styles.chartTitle}>Weight Trend (kg)</Text>
                <LineChart
                  data={weightData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </Card.Content>
            </Card>
          )}

          {heightData && (
            <Card style={styles.chartCard}>
              <Card.Content>
                <Text style={styles.chartTitle}>Height Trend (cm)</Text>
                <LineChart
                  data={heightData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </Card.Content>
            </Card>
          )}

          {bmiData && (
            <Card style={styles.chartCard}>
              <Card.Content>
                <Text style={styles.chartTitle}>BMI Trend</Text>
                <LineChart
                  data={bmiData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </Card.Content>
            </Card>
          )}

          <View style={styles.entriesContainer}>
            <Text style={styles.entriesTitle}>Recent Entries</Text>
            {entries.slice(-5).reverse().map((entry) => (
              <Card
                key={entry.id}
                style={styles.entryCard}
                onPress={() =>
                  navigation.navigate('GrowthEntryForm', { entryId: entry.id })
                }>
                <Card.Content>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryDate}>
                      {formatDate(entry.date)}
                    </Text>
                    {entry.bmi && (
                      <Text style={styles.entryBMI}>BMI: {entry.bmi.toFixed(1)}</Text>
                    )}
                  </View>
                  <View style={styles.entryDetails}>
                    <Text style={styles.entryDetail}>
                      Weight: {entry.weight} {entry.weightUnit}
                    </Text>
                    <Text style={styles.entryDetail}>
                      Height: {entry.height} {entry.heightUnit}
                    </Text>
                  </View>
                  <Button
                    mode="text"
                    onPress={() => handleDelete(entry.id!)}
                    textColor="#f44336"
                    style={styles.deleteButton}>
                    Delete
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </View>
        </>
      )}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('GrowthEntryForm')}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  entriesContainer: {
    padding: 16,
  },
  entriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  entryCard: {
    marginBottom: 12,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  entryBMI: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  entryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  entryDetail: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 400,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default GrowthTracker;

