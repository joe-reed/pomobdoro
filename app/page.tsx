"use client";

import React from "react";

import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [name, setName] = React.useState("");
  const [participants, setParticipants] = React.useState<string[]>([]);

  function addParticipant(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name) return;

    setParticipants((participants) => [...participants, name]);
    setName("");
  }

  return (
    <main className="flex min-h-screen flex-col p-24">
      <h1 className="text-4xl font-bold mb-8">Pomobdoro</h1>
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

      <ul className="flex flex-col space-y-1">
        {participants.map((participant) => (
          <li key={participant}>{participant}</li>
        ))}
      </ul>
    </main>
  );
}
