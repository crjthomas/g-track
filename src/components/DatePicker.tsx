import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Button, Text, Portal, Modal } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  mode = 'date',
  minimumDate,
  maximumDate,
}) => {
  const [show, setShow] = useState(false);

  const formatDate = (date: Date): string => {
    if (mode === 'time') {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (mode === 'datetime') {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
      if (Platform.OS === 'ios') {
        // Keep modal open on iOS for datetime picker
        if (mode === 'datetime') {
          // You might want to keep it open or add a done button
        } else {
          setShow(false);
        }
      }
    }
  };

  if (Platform.OS === 'android') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <Button
          mode="outlined"
          onPress={() => setShow(true)}
          style={styles.button}
          contentStyle={styles.buttonContent}>
          {formatDate(value)}
        </Button>
        {show && (
          <DateTimePicker
            value={value}
            mode={mode}
            display="default"
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )}
      </View>
    );
  }

  // iOS
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Button
        mode="outlined"
        onPress={() => setShow(true)}
        style={styles.button}
        contentStyle={styles.buttonContent}>
        {formatDate(value)}
      </Button>
      <Portal>
        <Modal
          visible={show}
          onDismiss={() => setShow(false)}
          contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Button onPress={() => setShow(false)}>Cancel</Button>
              <Text style={styles.modalTitle}>{label}</Text>
              <Button onPress={() => setShow(false)}>Done</Button>
            </View>
            <DateTimePicker
              value={value}
              mode={mode}
              display="spinner"
              onChange={handleChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              style={styles.picker}
            />
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  button: {
    width: '100%',
  },
  buttonContent: {
    paddingVertical: 4,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalContent: {
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  picker: {
    width: '100%',
    height: 200,
  },
});

export default DatePicker;

