import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { FightDTO } from '../../types';

interface FightCardProps {
  fight: FightDTO;
  onFighterPress?: (fighterId: string) => void;
}

export function FightCard({ fight, onFighterPress }: FightCardProps) {
  const isCompleted = fight.resultStatus === 'COMPLETED';
  const isDraw = fight.resultStatus === 'DRAW';
  const isNoContest = fight.resultStatus === 'NO_CONTEST';

  const getResultColor = (fighterId: string) => {
    if (!isCompleted && !isDraw && !isNoContest) return colors.text;
    if (isDraw) return colors.draw;
    if (isNoContest) return colors.noContest;
    return fight.winnerId === fighterId ? colors.win : colors.loss;
  };

  const getResultIndicator = (fighterId: string) => {
    if (!isCompleted && !isDraw && !isNoContest) return null;
    if (isDraw) return 'D';
    if (isNoContest) return 'NC';
    return fight.winnerId === fighterId ? 'W' : 'L';
  };

  const FighterInfo = ({
    fighter,
    isLeft,
  }: {
    fighter: typeof fight.fighterA;
    isLeft: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.fighterContainer, isLeft ? styles.fighterLeft : styles.fighterRight]}
      onPress={() => onFighterPress?.(fighter.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.avatarPlaceholder, { borderColor: getResultColor(fighter.id) }]}>
        <Ionicons name="person" size={20} color={colors.textMuted} />
      </View>
      <View style={[styles.fighterInfo, !isLeft && styles.fighterInfoRight]}>
        <Text
          style={[styles.fighterName, { color: getResultColor(fighter.id) }]}
          numberOfLines={1}
        >
          {fighter.lastName.toUpperCase()}
        </Text>
        <Text style={styles.fighterRecord}>
          {fighter.proWins}-{fighter.proLosses}
          {fighter.proDraws > 0 && `-${fighter.proDraws}`}
        </Text>
      </View>
      {getResultIndicator(fighter.id) && (
        <View
          style={[styles.resultBadge, { backgroundColor: getResultColor(fighter.id) + '30' }]}
        >
          <Text style={[styles.resultText, { color: getResultColor(fighter.id) }]}>
            {getResultIndicator(fighter.id)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header badges */}
      <View style={styles.header}>
        {fight.isMainEvent && (
          <View style={styles.mainEventBadge}>
            <Text style={styles.badgeText}>MAIN EVENT</Text>
          </View>
        )}
        {fight.isCoMainEvent && (
          <View style={styles.coMainBadge}>
            <Text style={[styles.badgeText, { color: colors.info }]}>CO-MAIN</Text>
          </View>
        )}
        {fight.isTitleFight && (
          <View style={styles.titleBadge}>
            <Ionicons name="trophy" size={10} color={colors.major} />
            <Text style={[styles.badgeText, { color: colors.major }]}>TITLE</Text>
          </View>
        )}
        <Text style={styles.weightClass}>{fight.weightClass}</Text>
      </View>

      {/* Fighters */}
      <View style={styles.fightContainer}>
        <FighterInfo fighter={fight.fighterA} isLeft={true} />
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        <FighterInfo fighter={fight.fighterB} isLeft={false} />
      </View>

      {/* Result */}
      {isCompleted && fight.method && (
        <View style={styles.resultContainer}>
          <Text style={styles.methodText}>
            {fight.method}
            {fight.methodDetail && ` (${fight.methodDetail})`}
          </Text>
          {fight.round && fight.time && (
            <Text style={styles.roundText}>
              R{fight.round} {fight.time}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  mainEventBadge: {
    backgroundColor: colors.primary + '30',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  coMainBadge: {
    backgroundColor: colors.info + '30',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  titleBadge: {
    backgroundColor: colors.major + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  weightClass: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginLeft: 'auto',
  },
  fightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fighterContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  fighterLeft: {
    justifyContent: 'flex-start',
  },
  fighterRight: {
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  fighterInfo: {
    flex: 1,
  },
  fighterInfoRight: {
    alignItems: 'flex-end',
  },
  fighterName: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  fighterRecord: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  resultBadge: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  vsContainer: {
    paddingHorizontal: spacing.md,
  },
  vsText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
  },
  resultContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  methodText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  roundText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});

