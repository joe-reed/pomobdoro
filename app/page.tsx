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

          <div>
            <Label htmlFor="working-time">Working time</Label>
            <Input
              type="number"
              id="working-time"
              value={workingTime}
              onChange={(e) => updateWorkingTime(parseInt(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="break-time">Break time</Label>
            <Input
              type="number"
              id="break-time"
              value={breakTime}
              onChange={(e) => updateBreakTime(parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="min-w-[300px]">
          <div className="mb-8 flex justify-between items-center">
            <p className="text-4xl font-bold">{`${Math.floor(
              (timeRemaining % 3600) / 60,
            )
              .toString()
              .padStart(2, "0")}:${Math.floor(timeRemaining % 60)
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
      </div>
    </main>
  );
}

export default dynamic(() => Promise.resolve(Home), {
  ssr: false,
});
