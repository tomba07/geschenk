import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useEditMode } from '@/utils/context/EditModeContext';

export function HeaderRight({ assignmentsExist }: { assignmentsExist: boolean }) {
  const { isEditMode, setIsEditMode } = useEditMode();
  
  if (assignmentsExist) {
    return null;
  }

  return (
    <TouchableOpacity onPress={() => setIsEditMode(!isEditMode)}>
      <Text style={{ color: '#fff', marginRight: 15 }}>
        {isEditMode ? "Done" : "Edit"}
      </Text>
    </TouchableOpacity>
  );
}