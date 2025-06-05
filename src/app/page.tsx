import { Button } from "@/components/ui/button"
import Navbar from "@/components/ui/navbar"
import BugCard from "@/components/ui/bugcard"
import CarouselCard from "@/components/ui/carouselCard"
export default function Home() {
  return (
    <main  >
      <Navbar/>
      
      <div className="flex items-center justify-center min-h-screen ">
      <div className="flex items-center   flex-col gap-7">
        <h1 className="text-2xl font-bold">👋 Welcome to BroSolve!</h1>
        <h3>Facing a weird bug? Post it. Let AI + devs solve it.</h3>
        {/* <div className="flex w-[100%] justify-between">
              <input type="text" className="border border-gray-400 py-1 px-6" />
        <Button className="bg-gray-500 text-gray-400">Search</Button>
        </div> */}
        
        <div className="flex justify-between w-[100%]">
          <Button className="bg-white text-gray-400 p-4 text-[1rem]">Submit New Bug</Button>
           <Button className="bg-white text-gray-400 p-4 text-[1rem]">Explore Bug Feed</Button>
        </div>
        
        <h3>🔥 Recently Solved Bugs</h3>
        
        <CarouselCard/>
      
      </div>
      </div>
    </main>
  )

}
