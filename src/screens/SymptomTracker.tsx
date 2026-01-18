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
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppContext } from '../context/AppContext';
import { getSymptomEntries, deleteSymptomEntry } from '../services/symptomService';
import { SymptomEntry } from '../models/SymptomEntry';
import { formatDateTime, getRelativeTime } from '../utils/dateUtils';
import { RootStackParamList } from '../navigation/AppNavigator';

type SymptomTrackerNavigationProp = StackNavigationProp<RootStackParamList>;

const SymptomTracker: React.FC = () => {
  const navigation = useNavigation<SymptomTrackerNavigationProp>();
  const { user } = useAppContext();
  const [entries, setEntries] = useState<SymptomEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEntries = useCallback(async () => {
    if (!user) return;

    try {
      const data = await getSymptomEntries(user.uid);
      setEntries(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load symptoms');
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
      'Are you sure you want to delete this symptom entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            try {
              await deleteSymptomEntry(user.uid, entryId);
              await loadEntries();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  const renderEntry = ({ item }: { item: SymptomEntry }) => {
    const severityColor =
      item.heartburnSeverity >= 7
        ? '#f44336'
        : item.heartburnSeverity >= 4
        ? '#ff9800'
        : '#4caf50';

    return (
      <Card style={styles.card} onPress={() => navigation.navigate('SymptomEntryForm', { entryId: item.id })}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.dateText}>{formatDateTime(item.date)}</Text>
            <Chip
              style={[styles.severityChip, { backgroundColor: severityColor }]}
              textStyle={styles.severityChipText}>
              Severity: {item.heartburnSeverity}/10
            </Chip>
          </View>

          <View style={styles.symptomsContainer}>
            {item.nausea && (
              <Chip icon="alert" style={styles.symptomChip}>
                Nausea ({item.nauseaSeverity}/10)
              </Chip>
            )}
            {item.vomitingEpisodes > 0 && (
              <Chip icon="alert-circle" style={styles.symptomChip}>
                Vomiting: {item.vomitingEpisodes}x ({item.vomitingFrequency})
              </Chip>
            )}
          </View>

          {item.triggers.foods.length > 0 && (
            <View style={styles.triggersContainer}>
              <Text style={styles.triggersLabel}>Food Triggers:</Text>
              <View style={styles.foodChips}>
                {item.triggers.foods.map((food, index) => (
                  <Chip key={index} style={styles.foodChip} compact>
                    {food}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {(item.triggers.stress || item.triggers.coldFlu) && (
            <View style={styles.otherTriggers}>
              {item.triggers.stress && (
                <Chip icon="emoticon-sad" style={styles.triggerChip}>
                  Stress
                </Chip>
              )}
              {item.triggers.coldFlu && (
                <Chip icon="virus" style={styles.triggerChip}>
                  Cold/Flu
                </Chip>
              )}
            </View>
          )}

          {item.notes && (
            <Text style={styles.notes} numberOfLines={2}>
              {item.notes}
            </Text>
          )}

          <View style={styles.cardActions}>
            <Text style={styles.timeAgo}>{getRelativeTime(item.date)}</Text>
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
      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No symptom entries yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to log your first symptom
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
        onPress={() => navigation.navigate('SymptomEntryForm')}
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
  listContent: {
    padding: 16,
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
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  severityChip: {
    height: 28,
  },
  severityChipText: {
    color: 'white',
    fontSize: 12,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  symptomChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  triggersContainer: {
    marginVertical: 8,
  },
  triggersLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  foodChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  foodChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  otherTriggers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  triggerChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  timeAgo: {
    fontSize: 12,
    color: '#999',
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

export default SymptomTracker;

