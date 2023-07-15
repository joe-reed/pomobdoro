export function simulateElapsedTime(state: {
  currentTime: number;
  currentParticipant: string | null;
  timeRemaining: number;
  onBreak: boolean;
  breakTime: number;
  workingTime: number;
  participants: string[];
  timerRunning: boolean;
}): {
  onBreak: boolean;
  currentParticipant: string | null;
  timeRemaining: number;
} {
  if (!state.timerRunning) {
    return state;
  }

  let timeLeftToSimulate = Math.ceil((Date.now() - state.currentTime) / 1000);
  let { onBreak, currentParticipant, timeRemaining } = state;

  if (timeRemaining > timeLeftToSimulate) {
    timeRemaining = timeRemaining - timeLeftToSimulate;
    timeLeftToSimulate = 0;
  } else {
    timeLeftToSimulate -= timeRemaining;
    onBreak = !state.onBreak;
  }

  while (timeLeftToSimulate > 0) {
    if (onBreak) {
      if (state.breakTime > timeLeftToSimulate) {
        timeRemaining = state.breakTime - timeLeftToSimulate;
        break;
      }

      timeLeftToSimulate -= state.breakTime;
      onBreak = false;

      if (currentParticipant) {
        currentParticipant =
          state.participants[(state.participants.indexOf(currentParticipant) + 1) % state.participants.length];
      }

      continue;
    }

    if (state.workingTime > timeLeftToSimulate) {
      timeRemaining = state.workingTime - timeLeftToSimulate;
      break;
    }

    timeLeftToSimulate -= state.workingTime;
    onBreak = true;
  }

  return { onBreak, currentParticipant, timeRemaining };
}
