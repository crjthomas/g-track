import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  FAB,
  Chip,
  ActivityIndicator,
  SegmentedButtons,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppContext } from '../context/AppContext';
import {
  getNutritionEntries,
  getNutritionEntriesByDate,
  deleteNutritionEntry,
} from '../services/nutritionService';
import { NutritionEntry, calculateDailyCalories } from '../models/NutritionEntry';
import { formatDate, isToday } from '../utils/dateUtils';
import { RootStackParamList } from '../navigation/AppNavigator';

type NutritionTrackerNavigationProp = StackNavigationProp<RootStackParamList>;

const NutritionTracker: React.FC = () => {
  const navigation = useNavigation<NutritionTrackerNavigationProp>();
  const { user } = useAppContext();
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'today' | 'high-calorie'>('all');

  const loadEntries = useCallback(async () => {
    if (!user) return;

    try {
      let data: NutritionEntry[];
      if (filter === 'today') {
        data = await getNutritionEntriesByDate(user.uid, new Date());
      } else {
        data = await getNutritionEntries(user.uid);
        if (filter === 'high-calorie') {
          data = data.filter((entry) => entry.isHighCalorie);
        }
      }
      setEntries(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load nutrition entries');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, filter]);

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
      'Are you sure you want to delete this nutrition entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            try {
              await deleteNutritionEntry(user.uid, entryId);
              await loadEntries();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  const dailyCalories = calculateDailyCalories(
    filter === 'today' ? entries : entries.filter((e) => isToday(e.date))
  );

  const renderEntry = ({ item }: { item: NutritionEntry }) => {
    const mealTypeColors: { [key: string]: string } = {
      breakfast: '#FFB74D',
      lunch: '#81C784',
      dinner: '#64B5F6',
      snack: '#BA68C8',
    };

    return (
      <Card
        style={styles.card}
        onPress={() =>
          navigation.navigate('NutritionEntryForm', { entryId: item.id })
        }>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Chip
              style={[
                styles.mealChip,
                { backgroundColor: mealTypeColors[item.mealType] || '#E0E0E0' },
              ]}
              textStyle={styles.mealChipText}>
              {item.mealType.charAt(0).toUpperCase() + item.mealType.slice(1)}
            </Chip>
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          </View>

          <Text style={styles.foodName}>{item.foodName}</Text>

          <View style={styles.detailsContainer}>
            <Text style={styles.detailsText}>
              {item.quantity} {item.unit}
            </Text>
            <Text style={styles.caloriesText}>{item.calories} kcal</Text>
          </View>

          {item.isHighCalorie && (
            <Chip icon="fire" style={styles.highCalorieChip} compact>
              High-Calorie
            </Chip>
          )}

          {item.notes && (
            <Text style={styles.notes} numberOfLines={2}>
              {item.notes}
            </Text>
          )}

          <View style={styles.cardActions}>
            <Button
              mode="text"
              onPress={() => handleDelete(item.id!)}
              textColor="#f44336">
              Delete
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryLabel}>Daily Calories</Text>
        <Text style={styles.summaryValue}>{dailyCalories} kcal</Text>
      </View>

      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filter}
          onValueChange={(value) => setFilter(value as any)}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'today', label: 'Today' },
            { value: 'high-calorie', label: 'High-Cal' },
          ]}
        />
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No nutrition entries yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to log your first meal
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('NutritionEntryForm')}
      />
    </View>
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
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  filterContainer: {
    padding: 16,
    paddingTop: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealChip: {
    height: 28,
  },
  mealChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 14,
    color: '#666',
  },
  caloriesText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  highCalorieChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: '#FF9800',
  },
  notes: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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

export default NutritionTracker;

