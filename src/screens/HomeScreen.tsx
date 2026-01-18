import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LineChart } from 'react-native-chart-kit';
import { useAppContext } from '../context/AppContext';
import {
  getSymptomEntries,
  getSymptomEntriesByDateRange,
} from '../services/symptomService';
import {
  getNutritionEntries,
  getNutritionEntriesByDate,
  calculateDailyCalories,
} from '../services/nutritionService';
import {
  getGrowthEntries,
  getLatestGrowthEntry,
} from '../services/growthService';
import { SymptomEntry } from '../models/SymptomEntry';
import { NutritionEntry } from '../models/NutritionEntry';
import { GrowthEntry } from '../models/GrowthEntry';
import { getStartOfDay, getEndOfDay, formatDate } from '../utils/dateUtils';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const screenWidth = Dimensions.get('window').width;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [todaySymptoms, setTodaySymptoms] = useState<SymptomEntry[]>([]);
  const [todayNutrition, setTodayNutrition] = useState<NutritionEntry[]>([]);
  const [recentSymptoms, setRecentSymptoms] = useState<SymptomEntry[]>([]);
  const [recentNutrition, setRecentNutrition] = useState<NutritionEntry[]>([]);
  const [growthEntries, setGrowthEntries] = useState<GrowthEntry[]>([]);
  const [latestGrowth, setLatestGrowth] = useState<GrowthEntry | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      const todayStart = getStartOfDay();
      const todayEnd = getEndOfDay();

      // Load today's symptoms
      const symptoms = await getSymptomEntriesByDateRange(
        user.uid,
        todayStart,
        todayEnd
      );
      setTodaySymptoms(symptoms);

      // Load today's nutrition
      const nutrition = await getNutritionEntriesByDate(user.uid, new Date());
      setTodayNutrition(nutrition);

      // Load recent entries
      const recentSymptomEntries = await getSymptomEntries(user.uid, 5);
      setRecentSymptoms(recentSymptomEntries);

      const recentNutritionEntries = await getNutritionEntries(user.uid, 5);
      setRecentNutrition(recentNutritionEntries);

      // Load growth data
      const growthData = await getGrowthEntries(user.uid, 7);
      setGrowthEntries(growthData);

      const latest = await getLatestGrowthEntry(user.uid);
      setLatestGrowth(latest);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const dailyCalories = calculateDailyCalories(todayNutrition);
  const avgSeverity =
    todaySymptoms.length > 0
      ? todaySymptoms.reduce((sum, s) => sum + s.heartburnSeverity, 0) /
        todaySymptoms.length
      : 0;

  const prepareGrowthChartData = () => {
    if (growthEntries.length === 0) return null;

    const sorted = [...growthEntries].sort(
      (a, b) =>
        (a.date instanceof Date ? a.date.getTime() : a.date.toMillis()) -
        (b.date instanceof Date ? b.date.getTime() : b.date.toMillis())
    );

    const labels = sorted.map((entry) => formatDate(entry.date, 'MMM dd'));
    const weights = sorted.map((entry) =>
      entry.weightUnit === 'kg' ? entry.weight : entry.weight * 0.453592
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
  };

  const growthChartData = prepareGrowthChartData();

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
      <View style={styles.summaryCards}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryLabel}>Today's Calories</Text>
            <Text style={styles.summaryValue}>{dailyCalories}</Text>
            <Text style={styles.summaryUnit}>kcal</Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryLabel}>Symptoms Today</Text>
            <Text style={styles.summaryValue}>{todaySymptoms.length}</Text>
            <Text style={styles.summaryUnit}>entries</Text>
          </Card.Content>
        </Card>
      </View>

      {avgSeverity > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Average Severity Today</Text>
            <View style={styles.severityContainer}>
              <Text style={styles.severityValue}>
                {avgSeverity.toFixed(1)}/10
              </Text>
              <Chip
                style={[
                  styles.severityChip,
                  {
                    backgroundColor:
                      avgSeverity >= 7
                        ? '#f44336'
                        : avgSeverity >= 4
                        ? '#ff9800'
                        : '#4caf50',
                  },
                ]}
                textStyle={styles.severityChipText}>
                {avgSeverity >= 7
                  ? 'High'
                  : avgSeverity >= 4
                  ? 'Moderate'
                  : 'Low'}
              </Chip>
            </View>
          </Card.Content>
        </Card>
      )}

      {latestGrowth && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Latest Growth</Text>
            <View style={styles.growthInfo}>
              <View style={styles.growthItem}>
                <Text style={styles.growthLabel}>Weight</Text>
                <Text style={styles.growthValue}>
                  {latestGrowth.weight} {latestGrowth.weightUnit}
                </Text>
              </View>
              <View style={styles.growthItem}>
                <Text style={styles.growthLabel}>Height</Text>
                <Text style={styles.growthValue}>
                  {latestGrowth.height} {latestGrowth.heightUnit}
                </Text>
              </View>
              {latestGrowth.bmi && (
                <View style={styles.growthItem}>
                  <Text style={styles.growthLabel}>BMI</Text>
                  <Text style={styles.growthValue}>
                    {latestGrowth.bmi.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      )}

      {growthChartData && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Weight Trend (Last 7 Entries)</Text>
            <LineChart
              data={growthChartData}
              width={screenWidth - 64}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.quickActionsHeader}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
          </View>
          <View style={styles.quickActions}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('SymptomEntryForm')}
              style={styles.quickActionButton}
              icon="heart-pulse">
              Log Symptom
            </Button>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('NutritionEntryForm')}
              style={styles.quickActionButton}
              icon="food-apple">
              Log Meal
            </Button>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('GrowthEntryForm')}
              style={styles.quickActionButton}
              icon="chart-line">
              Log Growth
            </Button>
          </View>
        </Card.Content>
      </Card>

      {(recentSymptoms.length > 0 || recentNutrition.length > 0) && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Recent Entries</Text>
            {recentSymptoms.length > 0 && (
              <View style={styles.recentSection}>
                <Text style={styles.recentSectionTitle}>Symptoms</Text>
                {recentSymptoms.slice(0, 3).map((entry) => (
                  <View key={entry.id} style={styles.recentItem}>
                    <Text style={styles.recentItemText}>
                      {formatDate(entry.date)} - Severity: {entry.heartburnSeverity}/10
                    </Text>
                  </View>
                ))}
              </View>
            )}
            {recentNutrition.length > 0 && (
              <View style={styles.recentSection}>
                <Text style={styles.recentSectionTitle}>Nutrition</Text>
                {recentNutrition.slice(0, 3).map((entry) => (
                  <View key={entry.id} style={styles.recentItem}>
                    <Text style={styles.recentItemText}>
                      {formatDate(entry.date)} - {entry.foodName} ({entry.calories} kcal)
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      )}
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
  summaryCards: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  summaryUnit: {
    fontSize: 12,
    color: '#999',
  },
  card: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  severityValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  severityChip: {
    height: 32,
  },
  severityChipText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  growthInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  growthItem: {
    alignItems: 'center',
  },
  growthLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  growthValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  quickActionsHeader: {
    marginBottom: 16,
  },
  quickActions: {
    gap: 12,
  },
  quickActionButton: {
    marginVertical: 4,
  },
  recentSection: {
    marginTop: 16,
  },
  recentSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  recentItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  recentItemText: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;

