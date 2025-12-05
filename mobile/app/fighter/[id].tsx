import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/auth';
import { LoadingSpinner, EmptyState } from '../../components/ui';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { FighterFightHistoryDTO } from '../../types';

export default function FighterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const { data: fighter, isLoading, error } = useQuery({
    queryKey: ['fighter', id],
    queryFn: () => api.getFighterById(id!),
    enabled: !!id,
  });

  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.getFavorites(),
    enabled: isAuthenticated,
  });

  const isFavorite = favorites?.fighters.some((f) => f.id === id) ?? false;

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        await api.removeFavoriteFighter(id!);
      } else {
        await api.addFavoriteFighter(id!);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  if (isLoading) {
    return <LoadingSpinner message="Chargement du combattant..." />;
  }

  if (error || !fighter) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Erreur"
        message="Impossible de charger ce combattant"
      />
    );
  }

  const StatBox = ({ label, value }: { label: string; value: string | number }) => (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const FightHistoryItem = ({ fight, isWin }: { fight: FighterFightHistoryDTO; isWin: boolean | null }) => (
    <TouchableOpacity
      style={styles.fightHistoryItem}
      onPress={() => router.push(`/event/${fight.eventId}`)}
    >
      <View style={[
        styles.resultIndicator,
        { backgroundColor: isWin === null ? colors.textMuted : isWin ? colors.win : colors.loss }
      ]} />
      <View style={styles.fightHistoryInfo}>
        <Text style={styles.opponentName}>
          vs {fight.opponent.fullName}
        </Text>
        <Text style={styles.fightEventName}>{fight.eventName}</Text>
        <Text style={styles.fightDate}>
          {new Date(fight.eventDate).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
      </View>
      {fight.method && (
        <View style={styles.methodContainer}>
          <Text style={styles.methodText}>{fight.method}</Text>
          {fight.round && <Text style={styles.roundText}>R{fight.round}</Text>}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ title: fighter.fullName }} />
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color={colors.textMuted} />
            </View>
            {isAuthenticated && (
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => toggleFavoriteMutation.mutate()}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFavorite ? colors.primary : colors.text}
                />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.name}>{fighter.fullName}</Text>
          {fighter.nickname && (
            <Text style={styles.nickname}>"{fighter.nickname}"</Text>
          )}

          <View style={styles.badgesRow}>
            <View style={styles.badge}>
              <Ionicons name="flag-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.badgeText}>{fighter.country}</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="fitness-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.badgeText}>{fighter.weightClass}</Text>
            </View>
            {fighter.team && (
              <View style={styles.badge}>
                <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.badgeText}>{fighter.team}</Text>
              </View>
            )}
          </View>

          {/* Record */}
          <View style={styles.recordContainer}>
            <Text style={styles.recordLabel}>Record Pro</Text>
            <Text style={styles.record}>
              <Text style={{ color: colors.win }}>{fighter.proWins}</Text>
              {' - '}
              <Text style={{ color: colors.loss }}>{fighter.proLosses}</Text>
              {fighter.proDraws > 0 && (
                <>
                  {' - '}
                  <Text style={{ color: colors.draw }}>{fighter.proDraws}</Text>
                </>
              )}
              {fighter.proNoContests > 0 && (
                <Text style={{ color: colors.textMuted }}> ({fighter.proNoContests} NC)</Text>
              )}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <View style={styles.statsGrid}>
            <StatBox label="KO/TKO" value={fighter.proWinsByKO} />
            <StatBox label="Soumissions" value={fighter.proWinsBySubmission} />
            <StatBox label="Décisions" value={fighter.proWinsByDecision} />
          </View>
        </View>

        {/* Physical Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoGrid}>
            {fighter.age && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Âge</Text>
                <Text style={styles.infoValue}>{fighter.age} ans</Text>
              </View>
            )}
            {fighter.heightCm && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Taille</Text>
                <Text style={styles.infoValue}>{fighter.heightCm} cm</Text>
              </View>
            )}
            {fighter.reachCm && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Allonge</Text>
                <Text style={styles.infoValue}>{fighter.reachCm} cm</Text>
              </View>
            )}
            {fighter.stance && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Stance</Text>
                <Text style={styles.infoValue}>{fighter.stance}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Upcoming Fights */}
        {fighter.upcomingFights && fighter.upcomingFights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prochains combats</Text>
            {fighter.upcomingFights.map((fight) => (
              <FightHistoryItem key={fight.fightId} fight={fight} isWin={null} />
            ))}
          </View>
        )}

        {/* Recent Fights */}
        {fighter.recentFights && fighter.recentFights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historique</Text>
            {fighter.recentFights.map((fight) => (
              <FightHistoryItem key={fight.fightId} fight={fight} isWin={fight.isWinner} />
            ))}
          </View>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  favoriteButton: {
    position: 'absolute',
    right: -8,
    bottom: 0,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.full,
    padding: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  nickname: {
    fontSize: fontSize.lg,
    fontStyle: 'italic',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  badgeText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  recordContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  recordLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  record: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.text,
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  infoItem: {
    width: '48%',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xs,
  },
  fightHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultIndicator: {
    width: 4,
    height: '100%',
    minHeight: 48,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  fightHistoryInfo: {
    flex: 1,
  },
  opponentName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  fightEventName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  fightDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  methodContainer: {
    alignItems: 'flex-end',
  },
  methodText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  roundText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});

