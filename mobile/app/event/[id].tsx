import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { FightCard, LoadingSpinner, EmptyState } from '../../components/ui';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => api.getEventById(id!),
    enabled: !!id,
  });

  const handleFighterPress = (fighterId: string) => {
    router.push(`/fighter/${fighterId}`);
  };

  if (isLoading) {
    return <LoadingSpinner message="Chargement de l'événement..." />;
  }

  if (error || !event) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Erreur"
        message="Impossible de charger cet événement"
      />
    );
  }

  const eventDate = new Date(event.dateTimeUtc);
  const formattedDate = eventDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Separate fights by card type
  const mainCard = event.fights.filter((f) => f.cardType === 'MAIN');
  const prelims = event.fights.filter((f) => f.cardType === 'PRELIM');
  const earlyPrelims = event.fights.filter((f) => f.cardType === 'EARLY_PRELIM');

  const getLevelColor = () => {
    switch (event.organization.level) {
      case 'MAJOR':
        return colors.major;
      case 'REGIONAL':
        return colors.regional;
      case 'AMATEUR':
        return colors.amateur;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: event.organization.shortName || event.organization.name }} />
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.orgBadge, { backgroundColor: getLevelColor() + '20' }]}>
            <Text style={[styles.orgText, { color: getLevelColor() }]}>
              {event.organization.name}
            </Text>
          </View>
          <Text style={styles.title}>{event.name}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{formattedDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{formattedTime}</Text>
          </View>
          {(event.venue || event.city) && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                {[event.venue, event.city, event.country].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{event.status}</Text>
          </View>
        </View>

        {/* Fight Card */}
        <View style={styles.section}>
          {mainCard.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>🏆 Carte Principale</Text>
              {mainCard.map((fight) => (
                <FightCard
                  key={fight.id}
                  fight={fight}
                  onFighterPress={handleFighterPress}
                />
              ))}
            </>
          )}

          {prelims.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>🥊 Préliminaires</Text>
              {prelims.map((fight) => (
                <FightCard
                  key={fight.id}
                  fight={fight}
                  onFighterPress={handleFighterPress}
                />
              ))}
            </>
          )}

          {earlyPrelims.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>⚡ Pré-Préliminaires</Text>
              {earlyPrelims.map((fight) => (
                <FightCard
                  key={fight.id}
                  fight={fight}
                  onFighterPress={handleFighterPress}
                />
              ))}
            </>
          )}

          {event.fights.length === 0 && (
            <View style={styles.noFights}>
              <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
              <Text style={styles.noFightsText}>
                La fight card n'est pas encore disponible
              </Text>
            </View>
          )}
        </View>
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
    padding: spacing.lg,
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orgBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  orgText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.info + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },
  statusText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.info,
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  noFights: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  noFightsText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

