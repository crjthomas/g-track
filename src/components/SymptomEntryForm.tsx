import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import {
  TextInput,
  Button,
  Checkbox,
  Text,
  Chip,
  Portal,
  Dialog,
  Paragraph,
} from 'react-native-paper';
import DatePicker from './DatePicker';
import SeveritySlider from './SeveritySlider';
import { SymptomEntryFormData } from '../models/SymptomEntry';
import { validateSymptomEntry } from '../models/SymptomEntry';

interface SymptomEntryFormProps {
  initialData?: SymptomEntryFormData;
  onSubmit: (data: SymptomEntryFormData) => Promise<void>;
  onCancel?: () => void;
}

const VOMIT_COLORS = [
  { label: 'Clear', value: 'clear' as const },
  { label: 'White', value: 'white' as const },
  { label: 'Yellow', value: 'yellow' as const },
  { label: 'Green', value: 'green' as const },
  { label: 'Brown', value: 'brown' as const },
  { label: 'Red', value: 'red' as const },
  { label: 'None', value: 'none' as const },
];

const VOMITING_FREQUENCIES = [
  { label: 'None', value: 'none' as const },
  { label: 'Hourly', value: 'hourly' as const },
  { label: 'Daily', value: 'daily' as const },
  { label: 'Weekly', value: 'weekly' as const },
];

const SymptomEntryForm: React.FC<SymptomEntryFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<SymptomEntryFormData>({
    date: initialData?.date || new Date(),
    heartburnSeverity: initialData?.heartburnSeverity || 0,
    nausea: initialData?.nausea || false,
    nauseaSeverity: initialData?.nauseaSeverity || 0,
    vomitingEpisodes: initialData?.vomitingEpisodes || 0,
    vomitingFrequency: initialData?.vomitingFrequency || 'none',
    vomitColor: initialData?.vomitColor || 'none',
    triggers: initialData?.triggers || {
      foods: [],
      stress: false,
      coldFlu: false,
    },
    notes: initialData?.notes || '',
  });

  const [foodInput, setFoodInput] = useState('');
  const [showFoodDialog, setShowFoodDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const errors = validateSymptomEntry(formData);
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save symptom entry');
    } finally {
      setLoading(false);
    }
  };

  const addFoodTrigger = () => {
    if (foodInput.trim()) {
      setFormData({
        ...formData,
        triggers: {
          ...formData.triggers,
          foods: [...formData.triggers.foods, foodInput.trim()],
        },
      });
      setFoodInput('');
      setShowFoodDialog(false);
    }
  };

  const removeFoodTrigger = (index: number) => {
    const newFoods = [...formData.triggers.foods];
    newFoods.splice(index, 1);
    setFormData({
      ...formData,
      triggers: {
        ...formData.triggers,
        foods: newFoods,
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <DatePicker
        label="Date & Time"
        value={formData.date}
        onChange={(date) => setFormData({ ...formData, date })}
        mode="datetime"
      />

      <SeveritySlider
        label="Heartburn/Reflux Severity"
        value={formData.heartburnSeverity}
        onValueChange={(value) =>
          setFormData({ ...formData, heartburnSeverity: value })
        }
      />

      <View style={styles.checkboxContainer}>
        <Checkbox
          status={formData.nausea ? 'checked' : 'unchecked'}
          onPress={() =>
            setFormData({ ...formData, nausea: !formData.nausea })
          }
        />
        <Text style={styles.checkboxLabel}>Nausea</Text>
      </View>

      {formData.nausea && (
        <SeveritySlider
          label="Nausea Severity"
          value={formData.nauseaSeverity}
          onValueChange={(value) =>
            setFormData({ ...formData, nauseaSeverity: value })
          }
        />
      )}

      <TextInput
        label="Vomiting Episodes"
        value={formData.vomitingEpisodes.toString()}
        onChangeText={(text) =>
          setFormData({
            ...formData,
            vomitingEpisodes: parseInt(text) || 0,
          })
        }
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
      />

      <Text style={styles.sectionLabel}>Vomiting Frequency</Text>
      <View style={styles.chipContainer}>
        {VOMITING_FREQUENCIES.map((freq) => (
          <Chip
            key={freq.value}
            selected={formData.vomitingFrequency === freq.value}
            onPress={() =>
              setFormData({ ...formData, vomitingFrequency: freq.value })
            }
            style={styles.chip}>
            {freq.label}
          </Chip>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Vomit Color</Text>
      <View style={styles.chipContainer}>
        {VOMIT_COLORS.map((color) => (
          <Chip
            key={color.value}
            selected={formData.vomitColor === color.value}
            onPress={() =>
              setFormData({ ...formData, vomitColor: color.value })
            }
            style={styles.chip}>
            {color.label}
          </Chip>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Triggers</Text>

      <View style={styles.checkboxContainer}>
        <Checkbox
          status={formData.triggers.stress ? 'checked' : 'unchecked'}
          onPress={() =>
            setFormData({
              ...formData,
              triggers: {
                ...formData.triggers,
                stress: !formData.triggers.stress,
              },
            })
          }
        />
        <Text style={styles.checkboxLabel}>Stress</Text>
      </View>

      <View style={styles.checkboxContainer}>
        <Checkbox
          status={formData.triggers.coldFlu ? 'checked' : 'unchecked'}
          onPress={() =>
            setFormData({
              ...formData,
              triggers: {
                ...formData.triggers,
                coldFlu: !formData.triggers.coldFlu,
              },
            })
          }
        />
        <Text style={styles.checkboxLabel}>Cold/Flu</Text>
      </View>

      <View style={styles.foodTriggersContainer}>
        <Text style={styles.sectionLabel}>Food Triggers</Text>
        <Button
          mode="outlined"
          onPress={() => setShowFoodDialog(true)}
          style={styles.addButton}>
          Add Food
        </Button>
        <View style={styles.foodChipsContainer}>
          {formData.triggers.foods.map((food, index) => (
            <Chip
              key={index}
              onClose={() => removeFoodTrigger(index)}
              style={styles.foodChip}>
              {food}
            </Chip>
          ))}
        </View>
      </View>

      <TextInput
        label="Notes (Optional)"
        value={formData.notes}
        onChangeText={(text) => setFormData({ ...formData, notes: text })}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.input}
      />

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

      <Portal>
        <Dialog visible={showFoodDialog} onDismiss={() => setShowFoodDialog(false)}>
          <Dialog.Title>Add Food Trigger</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Food Name"
              value={foodInput}
              onChangeText={setFoodInput}
              mode="outlined"
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowFoodDialog(false)}>Cancel</Button>
            <Button onPress={addFoodTrigger}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  chip: {
    margin: 4,
  },
  foodTriggersContainer: {
    marginVertical: 8,
  },
  addButton: {
    marginVertical: 8,
  },
  foodChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  foodChip: {
    margin: 4,
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

export default SymptomEntryForm;

