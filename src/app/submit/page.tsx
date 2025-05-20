import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"


export default function Home() {
  return (
    <div className="flex justify-center items-center flex-col ">
        <h1>Submit a doubt</h1>
        <form  className="w-1/3 h-full">
            <Input/>
            <Textarea/>


        </form>
    </div>
  )
}