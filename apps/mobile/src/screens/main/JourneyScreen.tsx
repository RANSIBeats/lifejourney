import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import theme from '@themes/index';
import apiClient from '@services/api';

interface Journey {
  id: string;
  title: string;
  description: string;
  category: string;
  participants: number;
}

const mockJourneys: Journey[] = [
  {
    id: '1',
    title: 'Mountain Hiking Adventure',
    description: 'Explore beautiful mountain trails',
    category: 'Adventure',
    participants: 12,
  },
  {
    id: '2',
    title: 'City Food Tour',
    description: 'Discover local cuisine and hidden gems',
    category: 'Food',
    participants: 8,
  },
  {
    id: '3',
    title: 'Photography Workshop',
    description: 'Learn professional photography techniques',
    category: 'Learning',
    participants: 5,
  },
];

const fetchJourneys = async () => {
  try {
    // In a real app, this would call your API
    // const response = await apiClient.get('/journeys');
    // return response.data;
    return new Promise<Journey[]>((resolve) => {
      setTimeout(() => resolve(mockJourneys), 500);
    });
  } catch (error) {
    console.error('Failed to fetch journeys:', error);
    throw error;
  }
};

const JourneyScreen: React.FC = () => {
  const { data: journeys = [], isLoading, refetch } = useQuery({
    queryKey: ['journeys'],
    queryFn: fetchJourneys,
  });

  const renderJourneyItem = ({ item }: { item: Journey }) => (
    <TouchableOpacity style={styles.journeyCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.journeyTitle}>{item.title}</Text>
        <Text style={styles.categoryBadge}>{item.category}</Text>
      </View>
      <Text style={styles.journeyDescription}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.participants}>👥 {item.participants} participants</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {isLoading && !journeys.length ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={journeys}
          renderItem={renderJourneyItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => refetch()}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No journeys available</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  journeyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  journeyTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
  },
  journeyDescription: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: theme.typography.bodySmall.lineHeight,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participants: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textTertiary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
});

export default JourneyScreen;
