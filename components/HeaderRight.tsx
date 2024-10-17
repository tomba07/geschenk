import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useEditMode } from '@/utils/context/EditModeContext';

export function HeaderRight() {
  const { isEditMode, setIsEditMode } = useEditMode();

  return (
    <TouchableOpacity onPress={() => setIsEditMode(!isEditMode)}>
      <Text style={{ color: '#fff', marginRight: 15 }}>
        {isEditMode ? "Done" : "Edit"}
      </Text>
    </TouchableOpacity>
  );
}