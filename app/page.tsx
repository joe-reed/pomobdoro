"use client";

import React from "react";

import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { X } from "lucide-react";

const DEFAULT_WORKING_TIME = 25 * 60;
const DEFAULT_BREAK_TIME = 5 * 60;

function Home() {
  const [name, setName] = React.useState("");
  const [participants, setParticipants] = React.useState<string[]>(
    JSON.parse(localStorage.getItem("participants") || "[]"),
  );
  const [currentParticipant, setCurrentParticipant] = React.useState<
    string | null
  >(localStorage.getItem("currentParticipant") || participants[0]);
  const [timerRunning, setTimerRunning] = React.useState<boolean>(
    JSON.parse(localStorage.getItem("timerRunning") || "false"),
  );
  const [onBreak, setOnBreak] = React.useState<boolean>(
    JSON.parse(localStorage.getItem("onBreak") || "false"),
  );
  const [workingTime, setWorkingTime] = React.useState<number>(
    parseInt(
      localStorage.getItem("workingTime") || DEFAULT_WORKING_TIME.toString(),
    ),
  );
  const [breakTime, setBreakTime] = React.useState<number>(
    parseInt(
      localStorage.getItem("breakTime") || DEFAULT_BREAK_TIME.toString(),
    ),
  );
  const [timeRemaining, setTimeRemaining] = React.useState<number>(
    parseInt(localStorage.getItem("timeRemaining") || workingTime.toString()),
  );

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
      updateCurrentParticipant(
        newParticipants[participantIndex] ||
          newParticipants[participantIndex - 1] ||
          null,
      );
    }
  }

  function rotateCurrentParticipant() {
    if (!participants.length) return;

    const currentParticipantIndex = currentParticipant
      ? participants.indexOf(currentParticipant)
      : 0;
    const nextParticipantIndex = currentParticipantIndex + 1;

    const nextParticipant =
      nextParticipantIndex >= participants.length
        ? participants[0]
        : participants[nextParticipantIndex];

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

  function updateWorkingTimeMinutes(minutes: number) {
    updateWorkingTime((minutes ?? 0) * 60 + getSeconds(workingTime));
  }

  function updateWorkingTimeSeconds(seconds: number) {
    updateWorkingTime(getMinutes(workingTime) * 60 + (seconds ?? 0));
  }

  function updateBreakTime(newBreakTime: number) {
    setBreakTime(newBreakTime);
    localStorage.setItem("breakTime", newBreakTime.toString());
  }

  function updateBreakTimeMinutes(minutes: number) {
    updateBreakTime((minutes ?? 0) * 60 + getSeconds(breakTime));
  }

  function updateBreakTimeSeconds(seconds: number) {
    updateBreakTime(getMinutes(breakTime) * 60 + (seconds ?? 0));
  }

  function updateTimeRemaining(newTimeRemaining: number) {
    setTimeRemaining(newTimeRemaining);
    localStorage.setItem("timeRemaining", newTimeRemaining.toString());
  }

  function toggleTimerRunning() {
    setTimerRunning(!timerRunning);
    localStorage.setItem("timerRunning", JSON.stringify(!timerRunning));
  }

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!timerRunning) return;

      let newTimeRemaining = timeRemaining - 1;

      if (timeRemaining <= 0) {
        if (onBreak) {
          setOnBreak(false);
          rotateCurrentParticipant();
          newTimeRemaining = workingTime;
        } else {
          setOnBreak(true);
          newTimeRemaining = breakTime;
        }
      }

      updateTimeRemaining(newTimeRemaining);
    }, 1000);

    return () => clearInterval(interval);
  });

  function getMinutes(time: number) {
    return Math.floor(time / 60);
  }

  function getSeconds(time: number) {
    return time % 60;
  }

  function reset() {
    setOnBreak(false);
    updateTimeRemaining(workingTime);

    if (timerRunning) {
      toggleTimerRunning();
    }
  }

  return (
    <main className="flex min-h-screen flex-col p-24">
      <h1 className="text-4xl font-bold mb-8">Pomobdoro</h1>

      <div className="flex">
        <div className="mr-32">
          <form onSubmit={addParticipant} className="mb-5">
            <div className="flex space-x-4 items-end">
              <div className="flex flex-col">
                <Label htmlFor="name" className="mb-3">
                  Add a participant
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <Button type="submit">Add</Button>
            </div>
          </form>

          <ul className="flex flex-col space-y-1 mb-8">
            {participants.map((participant) => (
              <li key={participant}>
                <div className="flex items-center">
                  <p className="mr-4">{participant}</p>
                  <X
                    className="mt-[1px]"
                    size={16}
                    onClick={() => removeParticipant(participant)}
                  />
                </div>
              </li>
            ))}
          </ul>

          <fieldset className="w-1/2 mb-3">
            <legend className="mb-1">Working time</legend>

            <div className="flex space-x-2">
              <Label>
                <div className="mb-1">Minutes</div>
                <Input
                  type="number"
                  value={getMinutes(workingTime)}
                  min={0}
                  onChange={(e) =>
                    updateWorkingTimeMinutes(parseInt(e.target.value))
                  }
                />
              </Label>
              <Label>
                <div className="mb-1">Seconds</div>
                <Input
                  type="number"
                  min={0}
                  value={getSeconds(workingTime)}
                  onChange={(e) =>
                    updateWorkingTimeSeconds(parseInt(e.target.value))
                  }
                />
              </Label>
            </div>
          </fieldset>

          <fieldset className="w-1/2 mb-3">
            <legend className="mb-1">Break time</legend>

            <div className="flex space-x-2">
              <Label>
                <div className="mb-1">Minutes</div>
                <Input
                  type="number"
                  min={0}
                  value={getMinutes(breakTime)}
                  onChange={(e) =>
                    updateBreakTimeMinutes(parseInt(e.target.value))
                  }
                />
              </Label>
              <Label>
                <div className="mb-1">Seconds</div>
                <Input
                  type="number"
                  min={0}
                  value={getSeconds(breakTime)}
                  onChange={(e) =>
                    updateBreakTimeSeconds(parseInt(e.target.value))
                  }
                />
              </Label>
            </div>
          </fieldset>
        </div>

        <div className="min-w-[300px] mr-3">
          <div className="mb-8 flex justify-between items-center">
            <p className="text-4xl font-bold">{`${getMinutes(timeRemaining)
              .toString()
              .padStart(2, "0")}:${getSeconds(timeRemaining)
              .toString()
              .padStart(2, "0")}`}</p>
            <Button onClick={toggleTimerRunning}>
              {timerRunning ? "Pause" : "Start"}
            </Button>
          </div>
          <p>
            {onBreak ? (
              <div className="font-semibold text-3xl">Time to take a break</div>
            ) : (
              <div>
                <h3 className="font-bold">Driver</h3>
                <p className="font-semibold text-4xl">{currentParticipant}</p>
              </div>
            )}
          </p>
        </div>

        <div>
          <Button onClick={reset}>Reset</Button>
        </div>
      </div>
    </main>
  );
}

export default dynamic(() => Promise.resolve(Home), {
  ssr: false,
});
