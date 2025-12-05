import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { FightDTO } from '../../types';

interface FightCardProps {
  fight: FightDTO;
  onFighterPress?: (fighterId: string) => void;
}

// Country to flag emoji mapping
const countryFlags: Record<string, string> = {
  'USA': '🇺🇸',
  'Brazil': '🇧🇷',
  'Russia': '🇷🇺',
  'China': '🇨🇳',
  'Mexico': '🇲🇽',
  'Ireland': '🇮🇪',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'UK': '🇬🇧',
  'Canada': '🇨🇦',
  'Australia': '🇦🇺',
  'Japan': '🇯🇵',
  'South Korea': '🇰🇷',
  'Georgia': '🇬🇪',
  'France': '🇫🇷',
  'Germany': '🇩🇪',
  'Netherlands': '🇳🇱',
  'Poland': '🇵🇱',
  'Sweden': '🇸🇪',
  'Nigeria': '🇳🇬',
  'Cameroon': '🇨🇲',
  'Jamaica': '🇯🇲',
  'New Zealand': '🇳🇿',
  'Italy': '🇮🇹',
  'Spain': '🇪🇸',
  'Argentina': '🇦🇷',
  'Chile': '🇨🇱',
  'Peru': '🇵🇪',
  'Ecuador': '🇪🇨',
  'Kazakhstan': '🇰🇿',
  'Uzbekistan': '🇺🇿',
  'Kyrgyzstan': '🇰🇬',
  'Unknown': '🏳️',
};

const getFlag = (country: string): string => {
  return countryFlags[country] || '🏳️';
};

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

  // Get combat type label
  const getCombatType = () => {
    if (fight.isMainEvent) return 'Combat principal';
    if (fight.isCoMainEvent) return 'Combat co-principal';
    return null;
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
      {/* Avatar with flag */}
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarContainer}>
          {fighter.imageUrl ? (
            <Image 
              source={{ uri: fighter.imageUrl }} 
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color={colors.textMuted} />
            </View>
          )}
        </View>
        {/* Flag badge */}
        <View style={[styles.flagBadge, isLeft ? styles.flagLeft : styles.flagRight]}>
          <Text style={styles.flagText}>{getFlag(fighter.country)}</Text>
        </View>
      </View>

      {/* Fighter info */}
      <View style={[styles.fighterInfo, !isLeft && styles.fighterInfoRight]}>
        <Text
          style={[styles.fighterName, { color: getResultColor(fighter.id) }]}
          numberOfLines={1}
        >
          {fighter.lastName}
        </Text>
        <Text style={styles.fighterRecord}>
          {fighter.proWins} - {fighter.proLosses}
          {fighter.proDraws > 0 ? `, ${fighter.proDraws}NC` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with weight class and combat type */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.weightClass}>{fight.weightClass}</Text>
          {getCombatType() && (
            <Text style={styles.combatType}> : {getCombatType()}</Text>
          )}
        </View>
        
        {/* Title badge */}
        {fight.isTitleFight && (
          <View style={styles.titleBadge}>
            <Ionicons name="trophy" size={12} color="#FFD700" />
          </View>
        )}
      </View>

      {/* Fighters */}
      <View style={styles.fightContainer}>
        <FighterInfo fighter={fight.fighterA} isLeft={true} />
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
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  weightClass: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  combatType: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  titleBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fighterContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fighterLeft: {
    justifyContent: 'flex-start',
  },
  fighterRight: {
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 110,
    height: 70,
    marginTop: 5,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagBadge: {
    position: 'absolute',
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.backgroundCard,
  },
  flagLeft: {
    left: -2,
  },
  flagRight: {
    right: -2,
  },
  flagText: {
    fontSize: 12,
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
    marginTop: 2,
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
