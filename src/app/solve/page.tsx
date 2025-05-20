import { Button } from "@/components/ui/button"



export default function Home() {
  return (
    <div className="flex justify-center items-center flex-col ">
        <h1>Bugs List</h1>
        <div>
            <h2>Title</h2>
            <textarea name="" id="">This is a short discription</textarea>
            <span>posted by {"imran"} : { Date()}</span>
            <div> tag1,tag2,tag3</div>
            <Button className="bg-amber-600" >View</Button>

        </div>  
        
    </div>
  )
}