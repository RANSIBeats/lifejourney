import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  ScrollView 
} from 'react-native';
import { JourneyPhase, PhaseStatus } from '../types/onboarding';

const { width: screenWidth } = Dimensions.get('window');

interface JourneyTimelineProps {
  phases: JourneyPhase[];
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({ phases }) => {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const isSmallScreen = screenWidth < 768;

  const getStatusColors = (status: PhaseStatus) => {
    switch (status) {
      case 'current':
        return {
          borderColor: '#6B4EFF',
          backgroundColor: 'rgba(107, 78, 255, 0.1)',
          dotColor: '#6B4EFF',
          glowColor: 'rgba(107, 78, 255, 0.6)',
          textColor: '#FFFFFF',
          subtitleColor: '#A1A1A8',
        };
      case 'completed':
        return {
          borderColor: '#22C55E',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          dotColor: '#22C55E',
          glowColor: 'rgba(34, 197, 94, 0.6)',
          textColor: '#FFFFFF',
          subtitleColor: '#6B7280',
        };
      case 'locked':
      default:
        return {
          borderColor: '#374151',
          backgroundColor: 'rgba(55, 65, 81, 0.3)',
          dotColor: '#6B7280',
          glowColor: 'transparent',
          textColor: '#9CA3AF',
          subtitleColor: '#6B7280',
        };
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const end = new Date(endDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    return `${start} - ${end}`;
  };

  const toggleExpanded = (phaseId: string) => {
    setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
  };

  const renderPhase = (phase: JourneyPhase, index: number, isLast: boolean) => {
    const colors = getStatusColors(phase.status);
    const isExpanded = expandedPhase === phase.id;
    const isHorizontal = !isSmallScreen && index < 2;

    if (isHorizontal) {
      return (
        <View key={phase.id} style={styles.horizontalPhase}>
          <View style={styles.horizontalContent}>
            <TouchableOpacity
              style={[
                styles.phaseCard,
                {
                  borderColor: colors.borderColor,
                  backgroundColor: colors.backgroundColor,
                  shadowColor: colors.glowColor,
                  shadowOpacity: colors.glowColor === 'transparent' ? 0 : 0.5,
                  shadowRadius: colors.glowColor === 'transparent' ? 0 : 8,
                },
              ]}
              onPress={() => toggleExpanded(phase.id)}
              activeOpacity={0.8}
            >
              <View style={styles.phaseHeader}>
                <Text style={[styles.phaseTitle, { color: colors.textColor }]}>
                  {phase.name}
                </Text>
                <View style={[styles.dot, { backgroundColor: colors.dotColor }]} />
              </View>
              
              <Text style={[styles.phaseSummary, { color: colors.subtitleColor }]}>
                {phase.summary}
              </Text>
              
              <Text style={[styles.phaseDateRange, { color: colors.subtitleColor }]}>
                {formatDateRange(phase.startDate, phase.endDate)}
              </Text>
              
              <Text style={[styles.phaseCount, { color: colors.subtitleColor }]}>
                {phase.habitCount} habits
              </Text>

              {isExpanded && (
                <View style={styles.expandedContent}>
                  <Text style={styles.habitsTitle}>Assigned Habits:</Text>
                  {phase.habits.map((habit) => (
                    <View key={habit.id} style={styles.habitItem}>
                      <Text style={styles.habitName}>{habit.title}</Text>
                      <Text style={styles.habitDescription}>{habit.description}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          {!isLast && <View style={styles.horizontalConnector} />}
        </View>
      );
    }

    return (
      <View key={phase.id} style={styles.verticalPhase}>
        <View style={styles.verticalConnector}>
          <View style={[styles.verticalDot, { backgroundColor: colors.dotColor }]} />
          <View style={[styles.verticalLine, { backgroundColor: index === 0 ? colors.dotColor : '#374151' }]} />
        </View>
        
        <TouchableOpacity
          style={[
            styles.phaseCard,
            {
              borderColor: colors.borderColor,
              backgroundColor: colors.backgroundColor,
              shadowColor: colors.glowColor,
              shadowOpacity: colors.glowColor === 'transparent' ? 0 : 0.5,
              shadowRadius: colors.glowColor === 'transparent' ? 0 : 8,
            },
          ]}
          onPress={() => toggleExpanded(phase.id)}
          activeOpacity={0.8}
        >
          <View style={styles.phaseHeader}>
            <Text style={[styles.phaseTitle, { color: colors.textColor }]}>
              {phase.name}
            </Text>
          </View>
          
          <Text style={[styles.phaseSummary, { color: colors.subtitleColor }]}>
            {phase.summary}
          </Text>
          
          <Text style={[styles.phaseDateRange, { color: colors.subtitleColor }]}>
            {formatDateRange(phase.startDate, phase.endDate)}
          </Text>
          
          <Text style={[styles.phaseCount, { color: colors.subtitleColor }]}>
            {phase.habitCount} habits
          </Text>

          {isExpanded && (
            <View style={styles.expandedContent}>
              <Text style={styles.habitsTitle}>Assigned Habits:</Text>
              {phase.habits.map((habit) => (
                <View key={habit.id} style={styles.habitItem}>
                  <Text style={styles.habitName}>{habit.title}</Text>
                  <Text style={styles.habitDescription}>{habit.description}</Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView 
      horizontal={!isSmallScreen} 
      style={styles.timelineContainer}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={!isSmallScreen ? styles.timelineContent : styles.timelineContentVertical}
    >
      <View style={isSmallScreen ? styles.timelineContent : styles.timelineRow}>
        {phases.map((phase, index) => 
          renderPhase(phase, index, index === phases.length - 1)
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  timelineContainer: {
    flex: 1,
  },
  timelineContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  timelineContentVertical: {
    paddingVertical: 32,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 24,
  },
  horizontalPhase: {
    alignItems: 'center',
    flex: 1,
    minWidth: 280,
  },
  verticalPhase: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  horizontalContent: {
    flex: 1,
  },
  horizontalConnector: {
    position: 'absolute',
    top: '50%',
    right: -24,
    width: 24,
    height: 2,
    backgroundColor: '#374151',
    zIndex: -1,
  },
  phaseCard: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  phaseSummary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  phaseDateRange: {
    fontSize: 12,
    marginBottom: 8,
  },
  phaseCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  verticalConnector: {
    alignItems: 'center',
    marginRight: 16,
    paddingTop: 20,
  },
  verticalDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    minHeight: 60,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  habitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  habitItem: {
    marginBottom: 12,
  },
  habitName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 12,
    color: '#A1A1A8',
    lineHeight: 16,
  },
});