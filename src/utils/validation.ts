export const validateNorthStarGoal = (goal: string): string | null => {
  if (!goal.trim()) {
    return 'Please share your goal with us';
  }
  if (goal.trim().length < 3) {
    return 'Your goal should be at least 3 characters';
  }
  if (goal.trim().length > 200) {
    return 'Your goal is too long. Please keep it under 200 characters';
  }
  return null;
};

export const validateBarriers = (
  barriers: string[],
  customBarriers: string[]
): string | null => {
  const totalBarriers = barriers.length + customBarriers.length;
  if (totalBarriers === 0) {
    return 'Please select at least one barrier';
  }
  if (totalBarriers > 10) {
    return 'Please select no more than 10 barriers';
  }
  return null;
};
