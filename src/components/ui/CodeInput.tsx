
import { BorderRadius, Colors, Spacing, Typography } from '@/components/constants';
import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
  ViewStyle,
} from 'react-native';

interface OTPInputProps {
  length?: number;
  onComplete?: (code: string) => void;
  onCodeChange?: (code: string) => void;
  style?: ViewStyle;
  autoFocus?: boolean;
  disabled?: boolean;
}

export const CodeInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  onCodeChange,
  style,
  autoFocus = true,
  disabled = false,
}) => {
  const [code, setCode] = useState<string[]>(new Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number>(autoFocus ? 0 : -1);
  const inputRefs = useRef<(TextInput | null)[]>(new Array(length).fill(null));

  // Focus first input on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  // Handle code completion
  useEffect(() => {
    const currentCode = code.join('');
    onCodeChange?.(currentCode);
    
    if (currentCode.length === length && !currentCode.includes('')) {
      onComplete?.(currentCode);
      Keyboard.dismiss();
    }
  }, [code, length, onComplete, onCodeChange]);

  const handleChangeText = (text: string, index: number) => {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length <= 1) {
      const newCode = [...code];
      newCode[index] = numericText;
      setCode(newCode);

      // Auto-focus next input
      if (numericText && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
        setFocusedIndex(index + 1);
      }
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // If current input is empty and backspace is pressed, focus previous input
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
        
        // Clear the previous input
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
      } else if (code[index]) {
        // If current input has value, clear it
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(-1);
  };

  const clearCode = () => {
    setCode(new Array(length).fill(''));
    inputRefs.current[0]?.focus();
    setFocusedIndex(0);
  };

  return (
    <View style={[styles.container, style]}>
      {code.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => { inputRefs.current[index] = ref; }}
          style={[
            styles.input,
            focusedIndex === index && styles.inputFocused,
            digit && styles.inputFilled,
            disabled && styles.inputDisabled,
          ]}
          value={digit}
          onChangeText={(text) => handleChangeText(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          keyboardType="numeric"
          maxLength={1}
          selectTextOnFocus
          editable={!disabled}
          textContentType="oneTimeCode" // iOS autofill
          autoComplete="sms-otp" // Android autofill
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  input: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background.primary,
    textAlign: 'center',
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[800],
    // Ensure consistent sizing
    minWidth: 48,
    maxWidth: 56,
  },
  inputFocused: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.main + '08', // 8% opacity
  },
  inputFilled: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.main + '04', // 4% opacity
  },
  inputDisabled: {
    backgroundColor: Colors.neutral[100],
    borderColor: Colors.border.light,
    color: Colors.neutral[400],
  },
});