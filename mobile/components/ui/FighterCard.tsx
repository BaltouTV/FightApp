import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { FighterBasicDTO } from '../../types';

interface FighterCardProps {
  fighter: FighterBasicDTO;
  onPress: () => void;
}

export function FighterCard({ fighter, onPress }: FighterCardProps) {
  const record = `${fighter.proWins}-${fighter.proLosses}${fighter.proDraws > 0 ? `-${fighter.proDraws}` : ''}`;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatarContainer}>
        {fighter.imageUrl ? (
          <Image source={{ uri: fighter.imageUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={24} color={colors.textMuted} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {fighter.fullName}
        </Text>
        {fighter.nickname && (
          <Text style={styles.nickname} numberOfLines={1}>
            "{fighter.nickname}"
          </Text>
        )}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.country}>{fighter.country}</Text>
          </View>
          <View style={styles.weightBadge}>
            <Text style={styles.weightText}>{fighter.weightClass}</Text>
          </View>
        </View>
      </View>

      <View style={styles.recordContainer}>
        <Text style={styles.recordLabel}>Record</Text>
        <Text style={styles.record}>{record}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  nickname: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  country: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  weightBadge: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  weightText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  recordContainer: {
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  recordLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: 2,
  },
  record: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.success,
  },
});

