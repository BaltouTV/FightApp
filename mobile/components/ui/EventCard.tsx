import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { EventBasicDTO } from '../../types';

interface EventCardProps {
  event: EventBasicDTO;
  onPress: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const eventDate = new Date(event.dateTimeUtc);
  const formattedDate = eventDate.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const formattedTime = eventDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

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
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: getLevelColor() + '20' }]}>
          <Text style={[styles.badgeText, { color: getLevelColor() }]}>
            {event.organization.shortName || event.organization.name}
          </Text>
        </View>
        {event.isAmateurEvent && (
          <View style={styles.amateurBadge}>
            <Text style={styles.amateurText}>AMATEUR</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {event.name}
      </Text>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.detailText}>{formattedDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.detailText}>{formattedTime}</Text>
        </View>
      </View>

      {(event.city || event.country) && (
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={styles.locationText}>
            {[event.city, event.country].filter(Boolean).join(', ')}
          </Text>
        </View>
      )}
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
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  amateurBadge: {
    backgroundColor: colors.amateur + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  amateurText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.amateur,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  details: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});

