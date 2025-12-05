import React from 'react';
import { View, FlatList, StyleSheet, Text, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { EventCard, LoadingSpinner, EmptyState } from '../../components/ui';
import { colors, spacing, fontSize } from '../../constants/theme';
import { EventBasicDTO } from '../../types';

export default function HomeScreen() {
  const router = useRouter();

  const {
    data: eventsData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => api.getUpcomingEvents({ pageSize: 50 }),
  });

  const events = eventsData?.data ?? [];

  // Group events by date
  const groupEventsByDate = (events: EventBasicDTO[]) => {
    const groups: { title: string; data: EventBasicDTO[] }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeekEnd = new Date(today);
    thisWeekEnd.setDate(thisWeekEnd.getDate() + 7);

    const todayEvents: EventBasicDTO[] = [];
    const thisWeekEvents: EventBasicDTO[] = [];
    const laterEvents: EventBasicDTO[] = [];

    events.forEach((event) => {
      const eventDate = new Date(event.dateTimeUtc);
      eventDate.setHours(0, 0, 0, 0);

      if (eventDate.getTime() === today.getTime()) {
        todayEvents.push(event);
      } else if (eventDate < thisWeekEnd) {
        thisWeekEvents.push(event);
      } else {
        laterEvents.push(event);
      }
    });

    if (todayEvents.length > 0) {
      groups.push({ title: "Aujourd'hui", data: todayEvents });
    }
    if (thisWeekEvents.length > 0) {
      groups.push({ title: 'Cette semaine', data: thisWeekEvents });
    }
    if (laterEvents.length > 0) {
      groups.push({ title: 'À venir', data: laterEvents });
    }

    return groups;
  };

  const groupedEvents = groupEventsByDate(events);

  const handleEventPress = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  if (isLoading) {
    return <LoadingSpinner message="Chargement des événements..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Erreur de chargement"
        message="Impossible de charger les événements. Vérifiez que le backend est en cours d'exécution."
      />
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon="calendar-outline"
        title="Aucun événement"
        message="Aucun événement à venir pour le moment"
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={groupedEvents}
        keyExtractor={(item) => item.title}
        renderItem={({ item: group }) => (
          <View>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            {group.data.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => handleEventPress(event.id)}
              />
            ))}
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
});
