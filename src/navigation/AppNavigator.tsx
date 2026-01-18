import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from '../screens/HomeScreen';
import SymptomTrackerScreen from '../screens/SymptomTracker';
import NutritionTrackerScreen from '../screens/NutritionTracker';
import GrowthTrackerScreen from '../screens/GrowthTracker';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MealPlanScreen from '../screens/MealPlanScreen';
import SymptomEntryFormScreen from '../screens/SymptomEntryForm';
import NutritionEntryFormScreen from '../screens/NutritionEntryForm';
import GrowthEntryFormScreen from '../screens/GrowthEntryForm';

export type RootStackParamList = {
  MainTabs: undefined;
  SymptomEntryForm: { entryId?: string };
  NutritionEntryForm: { 
    entryId?: string;
    prefill?: {
      mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      foodName?: string;
      quantity?: number;
      unit?: string;
      calories?: number;
      isHighCalorie?: boolean;
    };
  };
  GrowthEntryForm: { entryId?: string };
};

export type TabParamList = {
  Home: undefined;
  Symptoms: undefined;
  Nutrition: undefined;
  Growth: undefined;
  MealPlan: undefined;
  Reports: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Symptoms"
        component={SymptomTrackerScreen}
        options={{
          tabBarLabel: 'Symptoms',
          tabBarIcon: ({ color, size }) => (
            <Icon name="heart-pulse" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Nutrition"
        component={NutritionTrackerScreen}
        options={{
          tabBarLabel: 'Nutrition',
          tabBarIcon: ({ color, size }) => (
            <Icon name="food-apple" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Growth"
        component={GrowthTrackerScreen}
        options={{
          tabBarLabel: 'Growth',
          tabBarIcon: ({ color, size }) => (
            <Icon name="chart-line" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MealPlan"
        component={MealPlanScreen}
        options={{
          tabBarLabel: 'Meal Plan',
          tabBarIcon: ({ color, size }) => (
            <Icon name="food-variant" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <Icon name="file-document" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Icon name="cog" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SymptomEntryForm"
          component={SymptomEntryFormScreen}
          options={{ title: 'Log Symptom' }}
        />
        <Stack.Screen
          name="NutritionEntryForm"
          component={NutritionEntryFormScreen}
          options={{ title: 'Log Nutrition' }}
        />
        <Stack.Screen
          name="GrowthEntryForm"
          component={GrowthEntryFormScreen}
          options={{ title: 'Log Growth' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

