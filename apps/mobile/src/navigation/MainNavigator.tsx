import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabsParamList, JourneyStackParamList, ProfileStackParamList } from './types';
import JourneyScreen from '@screens/main/JourneyScreen';
import ProfileScreen from '@screens/main/ProfileScreen';
import theme from '@themes/index';

const Tab = createBottomTabNavigator<MainTabsParamList>();
const JourneyStack = createNativeStackNavigator<JourneyStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const JourneyNavigator: React.FC = () => {
  return (
    <JourneyStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <JourneyStack.Screen
        name="Journey"
        component={JourneyScreen}
        options={{
          title: 'Journey',
        }}
      />
    </JourneyStack.Navigator>
  );
};

const ProfileNavigator: React.FC = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </ProfileStack.Navigator>
  );
};

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.surfaceLight,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'JourneyTab') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="JourneyTab"
        component={JourneyNavigator}
        options={{
          title: 'Journey',
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};
