import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="flex items-center   flex-col">
        <h3>Facing a weird bug? Post it. Let AI + devs solve it.</h3>
        <Button>Submit a Bug</Button>
        <Button>Browse Solutions</Button>
        <p>Fast, AI-assisted, Community-driven</p>
      </div>
    </main>
  )
}
