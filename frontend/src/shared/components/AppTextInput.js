// ============================================================
// AppTextInput - Mobile-First Input Component
// Auto icon ✓/✗, password toggle, focus ring
// ============================================================

import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AppIcon from '../icons/AppIcon';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';

const AppTextInput = ({
  label,
  error,
  isValid,
  touched,
  leftIconName,
  isPassword = false,
  containerStyle,
  inputStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const showValid = touched && isValid && !error;
  const showError = touched && !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={[
        styles.inputRow,
        isFocused && styles.focused,
        showError && styles.errorBorder,
        showValid && styles.validBorder,
      ]}>
        {leftIconName ? (
          <View style={styles.leftIcon}>
            <AppIcon
              name={leftIconName}
              size={20}
              color={showError ? COLORS.error : isFocused ? COLORS.primary : COLORS.textTertiary}
            />
          </View>
        ) : null}

        <TextInput
          style={[styles.input, leftIconName && styles.inputWithLeft, inputStyle]}
          placeholderTextColor={COLORS.textTertiary}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCorrect={false}
          {...props}
        />

        {/* Right icon: status OR password toggle */}
        {isPassword ? (
          <View style={[styles.rightIcon, { flexDirection: 'row', alignItems: 'center' }]}>
            {showValid ? (
              <AppIcon name="check-circle" size={20} color={COLORS.success} style={{ marginRight: 8 }} />
            ) : null}
            <TouchableOpacity
              onPress={() => setShowPassword(v => !v)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <AppIcon
                name={showPassword ? 'eye-off' : 'eye-on'}
                size={20}
                color={COLORS.textTertiary}
              />
            </TouchableOpacity>
          </View>
        ) : touched ? (
          <View style={styles.rightIcon}>
            {showValid ? (
              <AppIcon name="check-circle" size={20} color={COLORS.success} />
            ) : showError ? (
              <AppIcon name="x-circle" size={20} color={COLORS.error} />
            ) : null}
          </View>
        ) : null}
      </View>

      {showError ? (
        <View style={styles.errorRow}>
          <AppIcon name="error-outline" size={13} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.base,
  },
  label: {
    fontSize: TYPOGRAPHY.sm,
    fontFamily: TYPOGRAPHY.fontMedium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    minHeight: 56,
  },
  focused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  errorBorder: {
    borderColor: COLORS.error,
  },
  validBorder: {
    borderColor: COLORS.success,
  },
  leftIcon: {
    paddingLeft: SPACING.base,
    paddingRight: SPACING.sm,
  },
  rightIcon: {
    paddingRight: SPACING.base,
    paddingLeft: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    fontFamily: TYPOGRAPHY.fontRegular,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
  },
  inputWithLeft: {
    paddingLeft: 0,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs + 2,
    gap: 4,
  },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.xs,
    fontFamily: TYPOGRAPHY.fontRegular,
  },
});

export default AppTextInput;
