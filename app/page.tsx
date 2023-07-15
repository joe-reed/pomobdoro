"use client";

import React from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { Check, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { simulateElapsedTime } from "../lib/simulateElapsedTime";
import { TimeInput } from "../components/TimeInput";
import { getMinutes, getSeconds } from "../lib/time";

const DEFAULT_WORKING_TIME = 25 * 60;
const DEFAULT_BREAK_TIME = 5 * 60;

type State = {
  participants: string[];
  currentParticipant: string | null;
  timerRunning: boolean;
  onBreak: boolean;
  workingTime: number;
  breakTime: number;
  timeRemaining: number;
};

type SharingState = State & { currentTime: number };

function Home() {
  const [name, setName] = React.useState("");

  const state = useLoadState();

  const [participants, setParticipants] = React.useState<string[]>(state.participants);
  const [currentParticipant, setCurrentParticipant] = React.useState<string | null>(state.currentParticipant);
  const [timerRunning, setTimerRunning] = React.useState<boolean>(state.timerRunning);
  const [onBreak, setOnBreak] = React.useState<boolean>(state.onBreak);
  const [workingTime, setWorkingTime] = React.useState<number>(state.workingTime);
  const [breakTime, setBreakTime] = React.useState<number>(state.breakTime);
  const [timeRemaining, setTimeRemaining] = React.useState<number>(state.timeRemaining);

  function addParticipant(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name) return;

    const newParticipants = [...participants, name];
    setParticipants(newParticipants);
    setName("");

    localStorage.setItem("participants", JSON.stringify(newParticipants));

    if (!currentParticipant) {
      updateCurrentParticipant(name);
    }
  }

  function removeParticipant(participant: string) {
    const participantIndex = participants.indexOf(participant);

    const newParticipants = participants.filter((p) => p !== participant);
    setParticipants(newParticipants);
    localStorage.setItem("participants", JSON.stringify(newParticipants));

    if (currentParticipant === participant) {
      updateCurrentParticipant(newParticipants[participantIndex] || newParticipants[participantIndex - 1] || null);
    }
  }

  function rotateCurrentParticipant() {
    if (!participants.length) return;

    const currentParticipantIndex = currentParticipant ? participants.indexOf(currentParticipant) : 0;
    const nextParticipantIndex = currentParticipantIndex + 1;

    const nextParticipant =
      nextParticipantIndex >= participants.length ? participants[0] : participants[nextParticipantIndex];

    updateCurrentParticipant(nextParticipant);
  }

  function updateCurrentParticipant(participant: string | null) {
    setCurrentParticipant(participant);
    localStorage.setItem("currentParticipant", participant || "");
  }

  function updateWorkingTime(newWorkingTime: number) {
    setWorkingTime(newWorkingTime);
    localStorage.setItem("workingTime", newWorkingTime.toString());
  }

  function updateBreakTime(newBreakTime: number) {
    setBreakTime(newBreakTime);
    localStorage.setItem("breakTime", newBreakTime.toString());
  }

  function updateTimeRemaining(newTimeRemaining: number) {
    setTimeRemaining(newTimeRemaining);
    localStorage.setItem("timeRemaining", newTimeRemaining.toString());
  }

  function toggleTimerRunning() {
    setTimerRunning(!timerRunning);
    localStorage.setItem("timerRunning", JSON.stringify(!timerRunning));
  }

  function startWorking() {
    setOnBreak(false);
    rotateCurrentParticipant();
    updateTimeRemaining(workingTime);
  }

  function startBreak() {
    setOnBreak(true);
    updateTimeRemaining(breakTime);
  }

  function toggleBreakOrWork() {
    if (onBreak) {
      startWorking();
    } else {
      startBreak();
    }
  }

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!timerRunning) return;

      if (timeRemaining > 0) {
        updateTimeRemaining(timeRemaining - 1);
        return;
      }

      toggleBreakOrWork();
    }, 1000);

    return () => clearInterval(interval);
  });

  function reset() {
    setOnBreak(false);
    updateTimeRemaining(workingTime);

    if (timerRunning) {
      toggleTimerRunning();
    }
  }

  function skip() {
    toggleBreakOrWork();
  }

  const [copying, setCopying] = React.useState(false);
  function copyShareLink() {
    setCopying(true);

    const state: SharingState = {
      participants,
      currentParticipant,
      timerRunning,
      onBreak,
      workingTime,
      breakTime,
      timeRemaining,
      currentTime: Date.now(),
    };

    navigator.clipboard.writeText(window.location.href + `?state=${btoa(JSON.stringify(state))}`);

    setTimeout(() => setCopying(false), 3000);
  }

  return (
    <main className="flex min-h-screen flex-col p-24">
      <h1 className="text-4xl font-bold mb-8">Pomobdoro</h1>

      <div className="flex">
        <div className="w-1/2">
          <form onSubmit={addParticipant} className="mb-5">
            <div className="flex space-x-4 items-end">
              <div className="flex flex-col">
                <Label htmlFor="name" className="mb-3">
                  Add a participant
                </Label>
                <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <Button type="submit">Add</Button>
            </div>
          </form>

          <ul className="flex flex-col space-y-1 mb-8">
            {participants.map((participant) => (
              <li key={participant}>
                <div className="flex items-center">
                  <p className="mr-4">{participant}</p>
                  <X className="mt-[1px]" size={16} onClick={() => removeParticipant(participant)} />
                </div>
              </li>
            ))}
          </ul>

          <TimeInput label="Working time" value={workingTime} onChange={updateWorkingTime} className="w-1/2 mb-3" />

          <TimeInput label="Break time" value={breakTime} onChange={updateBreakTime} className="w-1/2 mb-8" />

          <Button onClick={copyShareLink} className="mx-auto">
            Copy share link
            {copying && <Check className="ml-2" size={16} strokeWidth={3} />}
          </Button>
        </div>

        <div className="w-1/2">
          <div className="mb-8 text-center w-1/3">
            <p className="text-6xl font-bold">{`${getMinutes(timeRemaining).toString().padStart(2, "0")}:${getSeconds(
              timeRemaining,
            )
              .toString()
              .padStart(2, "0")}`}</p>
          </div>

          <div className="flex h-1/3 w-1/3 justify-around text-center">
            {onBreak ? (
              <div className="font-semibold text-3xl">Time to take a break</div>
            ) : (
              <div>
                {currentParticipant ? (
                  <>
                    <h3 className="font-bold">Driver</h3>
                    <p className="font-semibold text-4xl">{currentParticipant}</p>
                  </>
                ) : (
                  <p>Add participants to get started with a driver!</p>
                )}
              </div>
            )}
          </div>

          <Button onClick={toggleTimerRunning} className="mb-3 w-1/3">
            {timerRunning ? "Pause" : "Start"}
          </Button>

          <div className="flex w-1/3 justify-around">
            <Button onClick={reset} className="flex" variant="secondary">
              Reset
            </Button>

            <Button onClick={skip} variant="secondary">
              Skip
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

function useLoadState(): State {
  const searchParams = useSearchParams();
  const router = useRouter();

  const encodedState = searchParams.get("state");

  if (encodedState) {
    const state = JSON.parse(atob(encodedState));

    const { onBreak, currentParticipant, timeRemaining } = simulateElapsedTime(state);

    localStorage.setItem("participants", JSON.stringify(state.participants));
    if (currentParticipant) {
      localStorage.setItem("currentParticipant", currentParticipant);
    }
    localStorage.setItem("timerRunning", JSON.stringify(state.timerRunning));
    localStorage.setItem("onBreak", JSON.stringify(onBreak));
    localStorage.setItem("workingTime", state.workingTime);
    localStorage.setItem("breakTime", state.breakTime);
    localStorage.setItem("timeRemaining", timeRemaining.toString());

    router.replace("/");
  }

  return {
    participants: JSON.parse(localStorage.getItem("participants") || "[]"),
    currentParticipant: localStorage.getItem("currentParticipant") || null,
    timerRunning: JSON.parse(localStorage.getItem("timerRunning") || "false"),
    onBreak: JSON.parse(localStorage.getItem("onBreak") || "false"),
    workingTime: parseInt(localStorage.getItem("workingTime") || DEFAULT_WORKING_TIME.toString()),
    breakTime: parseInt(localStorage.getItem("breakTime") || DEFAULT_BREAK_TIME.toString()),
    timeRemaining: parseInt(localStorage.getItem("timeRemaining") || DEFAULT_WORKING_TIME.toString()),
  };
}

export default dynamic(() => Promise.resolve(Home), {
  ssr: false,
});
