import React, { useRef } from 'react';
import { View, Text, Button, TouchableOpacity, TextInput } from 'react-native';
import BottomSheet from "@gorhom/bottom-sheet";
import { globalStyles } from "@/utils/styles";

interface ReusableBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  title: string;
  inputPlaceholder: string;
  inputValue: string;
  onInputChange: (text: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitButtonText: string;
}

export const CustomBottomSheet: React.FC<ReusableBottomSheetProps> = ({
  bottomSheetRef,
  title,
  inputPlaceholder,
  inputValue,
  onInputChange,
  onCancel,
  onSubmit,
  submitButtonText,
}) => {
  const inputRef = useRef<TextInput>(null);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={["10%", "30%"]}
      onChange={(index) => {
        if (index > 0) {
          inputRef.current?.focus();
        }
      }}
    >
      <View style={globalStyles.sheetContent}>
        <View style={globalStyles.cancelButton}>
          <Button
            title="Cancel"
            onPress={onCancel}
          />
        </View>
        <View style={globalStyles.sheetHeader}>
          <Text style={globalStyles.sheetTitle}>{title}</Text>
          <TouchableOpacity onPress={onSubmit} style={globalStyles.createButton}>
            <Text style={globalStyles.createButtonText}>{submitButtonText}</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          ref={inputRef}
          style={globalStyles.input}
          placeholder={inputPlaceholder}
          onChangeText={onInputChange}
          value={inputValue}
        />
      </View>
    </BottomSheet>
  );
};