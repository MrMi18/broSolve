import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const  BugCard = () => {
  return (
    <div  className="w-full">
        

   <Card>
  <CardHeader>
    <CardTitle>Bug Card1</CardTitle>
    <CardDescription>Bug Description</CardDescription>
    <CardAction>Votes</CardAction>
  </CardHeader>
  <CardContent>
    <p>Solution</p>
  </CardContent>
  <CardFooter>
    <p>AUthor</p>
  </CardFooter>
</Card>
    </div>
  )
}
export default BugCard