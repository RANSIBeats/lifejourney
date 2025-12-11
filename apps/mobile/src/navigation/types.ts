import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabsParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type OnboardingStackParamList = {
  OnboardingStart: undefined;
  OnboardingStep: { step: number };
  OnboardingComplete: undefined;
};

export type MainTabsParamList = {
  JourneyTab: NavigatorScreenParams<JourneyStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type JourneyStackParamList = {
  Journey: undefined;
  JourneyDetail: { id: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  ProfileEdit: undefined;
  Settings: undefined;
};
