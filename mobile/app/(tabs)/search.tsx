import React, { useState } from 'react';
import { View, TextInput, FlatList, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { FighterCard, LoadingSpinner, EmptyState } from '../../components/ui';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data: fightersData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['fighters', 'search', debouncedQuery],
    queryFn: () => api.searchFighters({ q: debouncedQuery, pageSize: 30 }),
    enabled: debouncedQuery.length >= 2,
  });

  const fighters = fightersData?.data ?? [];

  const handleFighterPress = (fighterId: string) => {
    router.push(`/fighter/${fighterId}`);
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un combattant..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.textMuted}
              onPress={() => setSearchQuery('')}
            />
          )}
        </View>
      </View>

      {/* Results */}
      {debouncedQuery.length < 2 ? (
        <View style={styles.placeholderContainer}>
          <Ionicons name="search-outline" size={64} color={colors.textMuted} />
          <Text style={styles.placeholderText}>
            Entrez au moins 2 caractères pour rechercher
          </Text>
        </View>
      ) : isLoading || isFetching ? (
        <LoadingSpinner message="Recherche en cours..." />
      ) : fighters.length === 0 ? (
        <EmptyState
          icon="person-outline"
          title="Aucun résultat"
          message={`Aucun combattant trouvé pour "${debouncedQuery}"`}
        />
      ) : (
        <FlatList
          data={fighters}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FighterCard
              fighter={item}
              onPress={() => handleFighterPress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: spacing.md,
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: fontSize.md,
    color: colors.text,
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  placeholderText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

