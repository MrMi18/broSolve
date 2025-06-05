import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import BugCard from "./bugcard"
const carouselCard = () => {
  return (
 <Carousel className="w-[100%] ">
  
  <CarouselContent>
    <CarouselItem><BugCard/></CarouselItem>
    <CarouselItem><BugCard/> </CarouselItem>
    <CarouselItem><BugCard/></CarouselItem>
  </CarouselContent>
  <CarouselPrevious className="text-white bg-black" />
  <CarouselNext className="text-white bg-black" />
</Carousel>
  )
}

export default carouselCard