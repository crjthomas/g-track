import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  SegmentedButtons,
  Card,
} from 'react-native-paper';
import DatePicker from './DatePicker';
import { GrowthEntryFormData } from '../models/GrowthEntry';
import { validateGrowthEntry, calculateBMI } from '../models/GrowthEntry';

interface GrowthEntryFormProps {
  initialData?: GrowthEntryFormData;
  onSubmit: (data: GrowthEntryFormData) => Promise<void>;
  onCancel?: () => void;
}

const GrowthEntryForm: React.FC<GrowthEntryFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<GrowthEntryFormData>({
    date: initialData?.date || new Date(),
    weight: initialData?.weight || 0,
    weightUnit: initialData?.weightUnit || 'kg',
    height: initialData?.height || 0,
    heightUnit: initialData?.heightUnit || 'cm',
  });

  const [bmi, setBmi] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formData.weight > 0 && formData.height > 0) {
      const calculatedBMI = calculateBMI(
        formData.weight,
        formData.weightUnit,
        formData.height,
        formData.heightUnit
      );
      setBmi(calculatedBMI);
    } else {
      setBmi(0);
    }
  }, [formData.weight, formData.weightUnit, formData.height, formData.heightUnit]);

  const handleSubmit = async () => {
    const errors = validateGrowthEntry(formData);
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save growth entry');
    } finally {
      setLoading(false);
    }
  };

  const getBMICategory = (bmiValue: number): { label: string; color: string } => {
    if (bmiValue === 0) return { label: 'N/A', color: '#999' };
    if (bmiValue < 18.5) return { label: 'Underweight', color: '#FF9800' };
    if (bmiValue < 25) return { label: 'Normal', color: '#4CAF50' };
    if (bmiValue < 30) return { label: 'Overweight', color: '#FF9800' };
    return { label: 'Obese', color: '#F44336' };
  };

  const bmiCategory = getBMICategory(bmi);

  return (
    <ScrollView style={styles.container}>
      <DatePicker
        label="Date"
        value={formData.date}
        onChange={(date) => setFormData({ ...formData, date })}
        mode="date"
        maximumDate={new Date()}
      />

      <Text style={styles.sectionLabel}>Weight</Text>
      <View style={styles.unitSelector}>
        <SegmentedButtons
          value={formData.weightUnit}
          onValueChange={(value) =>
            setFormData({ ...formData, weightUnit: value as 'kg' | 'lbs' })
          }
          buttons={[
            { value: 'kg', label: 'kg' },
            { value: 'lbs', label: 'lbs' },
          ]}
        />
      </View>
      <TextInput
        label={`Weight (${formData.weightUnit})`}
        value={formData.weight > 0 ? formData.weight.toString() : ''}
        onChangeText={(text) =>
          setFormData({
            ...formData,
            weight: parseFloat(text) || 0,
          })
        }
        keyboardType="decimal-pad"
        mode="outlined"
        style={styles.input}
      />

      <Text style={styles.sectionLabel}>Height</Text>
      <View style={styles.unitSelector}>
        <SegmentedButtons
          value={formData.heightUnit}
          onValueChange={(value) =>
            setFormData({ ...formData, heightUnit: value as 'cm' | 'inches' })
          }
          buttons={[
            { value: 'cm', label: 'cm' },
            { value: 'inches', label: 'inches' },
          ]}
        />
      </View>
      <TextInput
        label={`Height (${formData.heightUnit})`}
        value={formData.height > 0 ? formData.height.toString() : ''}
        onChangeText={(text) =>
          setFormData({
            ...formData,
            height: parseFloat(text) || 0,
          })
        }
        keyboardType="decimal-pad"
        mode="outlined"
        style={styles.input}
      />

      {bmi > 0 && (
        <Card style={styles.bmiCard}>
          <Card.Content>
            <Text style={styles.bmiLabel}>BMI</Text>
            <Text style={[styles.bmiValue, { color: bmiCategory.color }]}>
              {bmi.toFixed(1)}
            </Text>
            <Text style={[styles.bmiCategory, { color: bmiCategory.color }]}>
              {bmiCategory.label}
            </Text>
          </Card.Content>
        </Card>
      )}

      <View style={styles.buttonContainer}>
        {onCancel && (
          <Button
            mode="outlined"
            onPress={onCancel}
            style={[styles.button, styles.cancelButton]}>
            Cancel
          </Button>
        )}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}>
          Save
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginVertical: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  unitSelector: {
    marginBottom: 8,
  },
  bmiCard: {
    marginVertical: 16,
    backgroundColor: '#f5f5f5',
  },
  bmiLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  bmiValue: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  bmiCategory: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    marginRight: 8,
  },
});

export default GrowthEntryForm;

