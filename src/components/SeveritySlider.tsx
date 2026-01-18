import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slider } from 'react-native-paper';

interface SeveritySliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  minimum?: number;
  maximum?: number;
  step?: number;
}

const SeveritySlider: React.FC<SeveritySliderProps> = ({
  label,
  value,
  onValueChange,
  minimum = 0,
  maximum = 10,
  step = 1,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      <Slider
        value={value}
        onValueChange={onValueChange}
        minimum={minimum}
        maximum={maximum}
        step={step}
        style={styles.slider}
      />
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>{minimum}</Text>
        <Text style={styles.rangeLabel}>{maximum}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    minWidth: 30,
    textAlign: 'right',
  },
  slider: {
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -5,
  },
  rangeLabel: {
    fontSize: 12,
    color: '#757575',
  },
});

export default SeveritySlider;

