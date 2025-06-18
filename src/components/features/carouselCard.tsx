import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"


const carouselCard = () => {
  return (
 <Carousel className="w-[100%] ">
  
  <CarouselContent>
    <CarouselItem></CarouselItem>
    <CarouselItem> </CarouselItem>
    <CarouselItem></CarouselItem>
  </CarouselContent>
  <CarouselPrevious className="text-white bg-black" />
  <CarouselNext className="text-white bg-black" />
</Carousel>
  )
}

export default carouselCard