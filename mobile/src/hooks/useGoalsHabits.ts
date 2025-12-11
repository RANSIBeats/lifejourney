import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalsAPI, habitsAPI } from '../services/api';
import { Goal, CreateGoalData, Habit, CreateHabitData } from '../types';

export const useGoals = () => {
  const queryClient = useQueryClient();

  const {
    data: goals = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const response = await goalsAPI.getGoals();
      return response.data.goals as Goal[];
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: (goalData: CreateGoalData) => goalsAPI.createGoal(goalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Goal> }) =>
      goalsAPI.updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => goalsAPI.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const getGoalMutation = useMutation({
    mutationFn: (id: string) => goalsAPI.getGoal(id),
  });

  return {
    goals,
    isLoading,
    error,
    refetch,
    
    // Actions
    createGoal: createGoalMutation.mutate,
    updateGoal: updateGoalMutation.mutate,
    deleteGoal: deleteGoalMutation.mutate,
    getGoal: getGoalMutation.mutate,
    
    // Loading states
    isCreating: createGoalMutation.isPending,
    isUpdating: updateGoalMutation.isPending,
    isDeleting: deleteGoalMutation.isPending,
    isGetting: getGoalMutation.isPending,
    
    // Data from getGoal
    selectedGoal: getGoalMutation.data?.data.goal,
    goalHabits: getGoalMutation.data?.data.habits,
    
    // Error states
    createError: createGoalMutation.error,
    updateError: updateGoalMutation.error,
    deleteError: deleteGoalMutation.error,
    getError: getGoalMutation.error,
    
    // Success flags
    isCreateSuccess: createGoalMutation.isSuccess,
    isUpdateSuccess: updateGoalMutation.isSuccess,
    isDeleteSuccess: deleteGoalMutation.isSuccess,
    
    // Reset functions
    resetCreateState: createGoalMutation.reset,
    resetUpdateState: updateGoalMutation.reset,
    resetDeleteState: deleteGoalMutation.reset,
    resetGetState: getGoalMutation.reset,
  };
};

export const useHabits = () => {
  const queryClient = useQueryClient();

  const {
    data: habits = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const response = await habitsAPI.getHabits();
      return response.data.habits as Habit[];
    },
  });

  const {
    data: activeHabits = [],
    isLoading: isLoadingActive,
    error: activeError,
  } = useQuery({
    queryKey: ['habits', 'active'],
    queryFn: async () => {
      const response = await habitsAPI.getActiveHabits();
      return response.data.habits as Habit[];
    },
  });

  const createHabitMutation = useMutation({
    mutationFn: (habitData: CreateHabitData) => habitsAPI.createHabit(habitData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Habit> }) =>
      habitsAPI.updateHabit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: (id: string) => habitsAPI.deleteHabit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const toggleHabitMutation = useMutation({
    mutationFn: (id: string) => habitsAPI.toggleHabit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  return {
    habits,
    activeHabits,
    isLoading,
    isLoadingActive,
    error,
    activeError,
    refetch,
    
    // Actions
    createHabit: createHabitMutation.mutate,
    updateHabit: updateHabitMutation.mutate,
    deleteHabit: deleteHabitMutation.mutate,
    toggleHabit: toggleHabitMutation.mutate,
    
    // Loading states
    isCreating: createHabitMutation.isPending,
    isUpdating: updateHabitMutation.isPending,
    isDeleting: deleteHabitMutation.isPending,
    isToggling: toggleHabitMutation.isPending,
    
    // Error states
    createError: createHabitMutation.error,
    updateError: updateHabitMutation.error,
    deleteError: deleteHabitMutation.error,
    toggleError: toggleHabitMutation.error,
    
    // Success flags
    isCreateSuccess: createHabitMutation.isSuccess,
    isUpdateSuccess: updateHabitMutation.isSuccess,
    isDeleteSuccess: deleteHabitMutation.isSuccess,
    isToggleSuccess: toggleHabitMutation.isSuccess,
    
    // Reset functions
    resetCreateState: createHabitMutation.reset,
    resetUpdateState: updateHabitMutation.reset,
    resetDeleteState: deleteHabitMutation.reset,
    resetToggleState: toggleHabitMutation.reset,
  };
};