import { simulateElapsedTime } from "./simulateElapsedTime";

it("simulates elapsed time", function () {
  jest.useFakeTimers({
    now: 1689454861000,
  });

  const { onBreak, currentParticipant, timeRemaining } = simulateElapsedTime({
    participants: ["A", "B", "C"],
    currentParticipant: "B",
    timerRunning: true,
    onBreak: false,
    workingTime: 20,
    breakTime: 5,
    timeRemaining: 10,
    currentTime: 1689454800000, // 61 seconds earlier than now
  });

  /*
   * we wait 10 seconds of working time
   * 51 seconds left to elapse
   * we wait 5 seconds of break time
   * 46 seconds left to elapse
   * currentParticipant is now 'C'
   * we wait 20 seconds of working time
   * 26 seconds left to elapse
   * we wait 5 seconds of break time
   * 21 seconds left to elapse
   * currentParticipant is now 'A'
   * we wait 20 seconds of working time
   * 1 seconds left to elapse
   * we wait 1 second of break time
   * 4 seconds of break time remaining
   */

  expect(timeRemaining).toEqual(4);
  expect(currentParticipant).toEqual("A");
  expect(onBreak).toEqual(true);

  jest.useRealTimers();
});

it("simulates elapsed time correctly when time remaining is greater than elapsed time", function () {
  jest.useFakeTimers({
    now: 1689454861000,
  });

  const { onBreak, currentParticipant, timeRemaining } = simulateElapsedTime({
    participants: ["A", "B", "C"],
    currentParticipant: "B",
    timerRunning: true,
    onBreak: false,
    workingTime: 20,
    breakTime: 5,
    timeRemaining: 10,
    currentTime: 1689454860000, // 1 second earlier than now
  });

  expect(timeRemaining).toEqual(9);
  expect(currentParticipant).toEqual("B");
  expect(onBreak).toEqual(false);

  jest.useRealTimers();
});
