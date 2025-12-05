import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/auth';
import { EventCard, FighterCard, LoadingSpinner, EmptyState } from '../../components/ui';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';

type TabType = 'fighters' | 'events' | 'organizations';

export default function FavoritesScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('fighters');

  const {
    data: favorites,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.getFavorites(),
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Ionicons name="heart-outline" size={80} color={colors.textMuted} />
        <Text style={styles.authTitle}>Connectez-vous</Text>
        <Text style={styles.authMessage}>
          Connectez-vous pour gérer vos combattants, événements et organisations favoris
        </Text>
        <Link href="/auth/login" asChild>
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/auth/register" asChild>
          <TouchableOpacity style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Créer un compte</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Chargement des favoris..." />;
  }

  const tabs: { key: TabType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'fighters', label: 'Combattants', icon: 'people' },
    { key: 'events', label: 'Événements', icon: 'calendar' },
    { key: 'organizations', label: 'Orgas', icon: 'business' },
  ];

  const renderContent = () => {
    if (!favorites) return null;

    switch (activeTab) {
      case 'fighters':
        if (favorites.fighters.length === 0) {
          return (
            <EmptyState
              icon="person-outline"
              title="Aucun combattant favori"
              message="Ajoutez des combattants à vos favoris depuis leur profil"
            />
          );
        }
        return (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={colors.primary}
              />
            }
          >
            {favorites.fighters.map((fighter) => (
              <FighterCard
                key={fighter.id}
                fighter={fighter}
                onPress={() => router.push(`/fighter/${fighter.id}`)}
              />
            ))}
          </ScrollView>
        );

      case 'events':
        if (favorites.events.length === 0) {
          return (
            <EmptyState
              icon="calendar-outline"
              title="Aucun événement favori"
              message="Ajoutez des événements à vos favoris depuis leur page"
            />
          );
        }
        return (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={colors.primary}
              />
            }
          >
            {favorites.events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => router.push(`/event/${event.id}`)}
              />
            ))}
          </ScrollView>
        );

      case 'organizations':
        if (favorites.organizations.length === 0) {
          return (
            <EmptyState
              icon="business-outline"
              title="Aucune organisation favorite"
              message="Ajoutez des organisations à vos favoris"
            />
          );
        }
        return (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={colors.primary}
              />
            }
          >
            {favorites.organizations.map((org) => (
              <View key={org.id} style={styles.orgCard}>
                <Text style={styles.orgName}>{org.name}</Text>
                {org.shortName && (
                  <Text style={styles.orgShortName}>{org.shortName}</Text>
                )}
                <Text style={styles.orgLocation}>
                  {[org.city, org.country].filter(Boolean).join(', ')}
                </Text>
              </View>
            ))}
          </ScrollView>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={20}
              color={activeTab === tab.key ? colors.primary : colors.textMuted}
            />
            <Text
              style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  authContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  authTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
  },
  authMessage: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  loginButtonText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  registerButtonText: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.md,
  },
  orgCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orgName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  orgShortName: {
    fontSize: fontSize.md,
    color: colors.primary,
    marginTop: 2,
  },
  orgLocation: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

