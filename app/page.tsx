import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-24">
      <Label htmlFor="name" className="mb-3">
        Add a participant
      </Label>
      <Input id="name" />
    </main>
  );
}
