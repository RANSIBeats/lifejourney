import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  onRemove?: () => void;
}

export const Chip: React.FC<ChipProps> = ({ label, selected, onPress, onRemove }) => {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.selectedChip]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, selected && styles.selectedChipText]}>{label}</Text>
      {selected && onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <Text style={styles.removeText}>×</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedChip: {
    backgroundColor: '#EDE7FF',
    borderColor: '#6B4EFF',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedChipText: {
    color: '#6B4EFF',
  },
  removeButton: {
    marginLeft: 8,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    fontSize: 20,
    color: '#6B4EFF',
    fontWeight: 'bold',
  },
});
