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
  Chip,
  ActivityIndicator,
  TextInput,
  Divider,
  List,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppContext } from '../context/AppContext';
import { getDailyMealPlanSuggestions } from '../services/aiMealPlanService';
import { HighCalorieFoodSuggestion } from '../models/MealPlan';
import { getNutritionEntriesByDate, calculateDailyCalories } from '../services/nutritionService';
import { formatDate, getStartOfDay, getEndOfDay } from '../utils/dateUtils';
import DatePicker from '../components/DatePicker';
import { RootStackParamList } from '../navigation/AppNavigator';

type MealPlanScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const screenWidth = Dimensions.get('window').width;

const MealPlanScreen: React.FC = () => {
  const navigation = useNavigation<MealPlanScreenNavigationProp>();
  const { user } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [targetCalories, setTargetCalories] = useState<string>('2000');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    breakfast: HighCalorieFoodSuggestion[];
    lunch: HighCalorieFoodSuggestion[];
    dinner: HighCalorieFoodSuggestion[];
    snacks: HighCalorieFoodSuggestion[];
  } | null>(null);
  const [currentCalories, setCurrentCalories] = useState<number>(0);

  const loadMealPlan = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get current day's nutrition
      const todayEntries = await getNutritionEntriesByDate(user.uid, selectedDate);
      const todayCalories = calculateDailyCalories(todayEntries);
      setCurrentCalories(todayCalories);

      // Get AI suggestions
      const target = parseInt(targetCalories) || 2000;
      const mealSuggestions = await getDailyMealPlanSuggestions(
        user.uid,
        target,
        selectedDate
      );
      setSuggestions(mealSuggestions);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load meal plan');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, selectedDate, targetCalories]);

  useEffect(() => {
    loadMealPlan();
  }, [loadMealPlan]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadMealPlan();
  };

  const handleAddFood = (suggestion: HighCalorieFoodSuggestion, mealType: string) => {
    navigation.navigate('NutritionEntryForm', {
      prefill: {
        mealType: mealType as any,
        foodName: suggestion.foodName,
        quantity: suggestion.recommendedQuantity,
        unit: suggestion.unit,
        calories: Math.round((suggestion.caloriesPer100g / 100) * suggestion.recommendedQuantity),
        isHighCalorie: true,
      },
    } as any);
  };

  const renderMealSuggestions = (
    title: string,
    mealSuggestions: HighCalorieFoodSuggestion[],
    mealType: string
  ) => {
    if (!mealSuggestions || mealSuggestions.length === 0) return null;

    return (
      <Card style={styles.mealCard}>
        <Card.Content>
          <View style={styles.mealHeader}>
            <Text style={styles.mealTitle}>{title}</Text>
            <Chip icon="lightbulb" style={styles.aiChip} compact>
              AI Suggested
            </Chip>
          </View>
          
          {mealSuggestions.map((suggestion, index) => (
            <Card
              key={index}
              style={styles.suggestionCard}
              onPress={() => handleAddFood(suggestion, mealType)}>
              <Card.Content>
                <View style={styles.suggestionHeader}>
                  <Text style={styles.foodName}>{suggestion.foodName}</Text>
                  <Text style={styles.calories}>
                    {Math.round(
                      (suggestion.caloriesPer100g / 100) *
                        suggestion.recommendedQuantity
                    )}{' '}
                    kcal
                  </Text>
                </View>
                
                <Text style={styles.recommendedQuantity}>
                  {suggestion.recommendedQuantity} {suggestion.unit}
                </Text>
                
                <Text style={styles.reason}>{suggestion.reason}</Text>
                
                {suggestion.benefits && suggestion.benefits.length > 0 && (
                  <View style={styles.benefitsContainer}>
                    {suggestion.benefits.slice(0, 3).map((benefit, idx) => (
                      <Chip
                        key={idx}
                        style={styles.benefitChip}
                        textStyle={styles.benefitChipText}
                        compact>
                        {benefit}
                      </Chip>
                    ))}
                  </View>
                )}
                
                <Button
                  mode="contained"
                  onPress={() => handleAddFood(suggestion, mealType)}
                  style={styles.addButton}
                  icon="plus">
                  Add to Meal
                </Button>
              </Card.Content>
            </Card>
          ))}
        </Card.Content>
      </Card>
    );
  };

  const caloriesRemaining = (parseInt(targetCalories) || 2000) - currentCalories;
  const progressPercentage = Math.min(
    (currentCalories / (parseInt(targetCalories) || 2000)) * 100,
    100
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.summaryTitle}>Daily High-Calorie Meal Plan</Text>
          <Text style={styles.summarySubtitle}>
            Boost your child's growth with AI-suggested high-calorie foods
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.controlsCard}>
        <Card.Content>
          <DatePicker
            label="Plan Date"
            value={selectedDate}
            onChange={setSelectedDate}
            mode="date"
          />
          
          <TextInput
            label="Target Calories (kcal)"
            value={targetCalories}
            onChangeText={setTargetCalories}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />
          
          <Button
            mode="contained"
            onPress={loadMealPlan}
            loading={loading}
            disabled={loading}
            style={styles.generateButton}
            icon="refresh">
            Generate Meal Plan
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.progressCard}>
        <Card.Content>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Calories Today</Text>
            <Text style={styles.progressValue}>
              {currentCalories} / {targetCalories} kcal
            </Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${progressPercentage}%` },
                progressPercentage >= 100 && styles.progressBarComplete,
              ]}
            />
          </View>
          
          <Text style={styles.remainingText}>
            {caloriesRemaining > 0
              ? `${caloriesRemaining} kcal remaining`
              : 'Target reached! 🎉'}
          </Text>
        </Card.Content>
      </Card>

      {loading && !suggestions ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Generating meal plan...</Text>
        </View>
      ) : suggestions ? (
        <>
          {renderMealSuggestions('Breakfast', suggestions.breakfast, 'breakfast')}
          {renderMealSuggestions('Lunch', suggestions.lunch, 'lunch')}
          {renderMealSuggestions('Dinner', suggestions.dinner, 'dinner')}
          {renderMealSuggestions('Snacks', suggestions.snacks, 'snack')}
        </>
      ) : (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>
              Click "Generate Meal Plan" to get AI-suggested high-calorie meals
            </Text>
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
    padding: 32,
    alignItems: 'center',
  },
  summaryCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
    backgroundColor: '#E3F2FD',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  controlsCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  input: {
    marginVertical: 8,
  },
  generateButton: {
    marginTop: 8,
  },
  progressCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  progressBarContainer: {
    height: 24,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
  },
  progressBarComplete: {
    backgroundColor: '#FF9800',
  },
  remainingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  mealCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  aiChip: {
    backgroundColor: '#FF9800',
  },
  suggestionCard: {
    marginBottom: 12,
    elevation: 1,
    backgroundColor: '#FAFAFA',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  calories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  recommendedQuantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  reason: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  benefitChip: {
    marginRight: 4,
    marginBottom: 4,
    backgroundColor: '#E8F5E9',
  },
  benefitChipText: {
    fontSize: 11,
    color: '#2E7D32',
  },
  addButton: {
    marginTop: 4,
  },
  emptyCard: {
    margin: 16,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
});

export default MealPlanScreen;

