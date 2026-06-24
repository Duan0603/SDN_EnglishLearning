// ============================================================
// AppButton - Mobile-First Button Component
// Variants: primary, secondary, outline, ghost, danger
// ============================================================

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import AppIcon from '../icons/AppIcon';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';

const AppButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  leftIconName,
  rightIconName,
  style,
  textStyle,
  fullWidth = true,
}) => {
  const isDisabled = disabled || loading;

  const containerStyles = [
    styles.base,
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    styles[`variant_${variant}`],
    isDisabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${size}`],
    styles[`text_${variant}`],
    isDisabled && styles.textDisabled,
    textStyle,
  ];

  const iconColor = (variant === 'primary' || variant === 'secondary' || variant === 'danger')
    ? COLORS.textInverse
    : variant === 'outline' || variant === 'ghost'
      ? COLORS.primary
      : COLORS.textPrimary;

  const iconSize = size === 'sm' ? 16 : size === 'md' ? 18 : 20;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={containerStyles}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'secondary' || variant === 'danger' ? COLORS.textInverse : COLORS.primary}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {leftIconName && (
            <AppIcon name={leftIconName} size={iconSize} color={iconColor} style={{ marginRight: 8 }} />
          )}
          <Text style={textStyles}>{title}</Text>
          {rightIconName && (
            <AppIcon name={rightIconName} size={iconSize} color={iconColor} style={{ marginLeft: 8 }} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Sizes ──────────────────────────────────────────────
  size_sm: { height: 38, paddingHorizontal: SPACING.base },
  size_md: { height: 48, paddingHorizontal: SPACING.xl },
  size_lg: { height: 56, paddingHorizontal: SPACING.xl },

  text_sm: { fontSize: TYPOGRAPHY.sm },
  text_md: { fontSize: TYPOGRAPHY.base },
  text_lg: { fontSize: TYPOGRAPHY.base + 1 },

  // ── Variants ───────────────────────────────────────────
  variant_primary: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.primary,
  },
  variant_secondary: {
    backgroundColor: COLORS.accent,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  variant_ghost: {
    backgroundColor: COLORS.primaryLight,
  },
  variant_danger: {
    backgroundColor: COLORS.error,
  },

  // ── Text by variant ────────────────────────────────────
  text: {
    fontFamily: TYPOGRAPHY.fontBold,
  },
  text_primary: { color: COLORS.textInverse },
  text_secondary: { color: COLORS.textInverse },
  text_outline: { color: COLORS.textPrimary, fontFamily: TYPOGRAPHY.fontSemiBold },
  text_ghost: { color: COLORS.accent },
  text_danger: { color: COLORS.textInverse },

  // ── Disabled ───────────────────────────────────────────
  disabled: { opacity: 0.5 },
  textDisabled: {},
});

export default AppButton;
