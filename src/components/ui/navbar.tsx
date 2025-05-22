import { Button } from "./button";


const Navbar = () => {
  return (
    <nav className="bg-gray-200 w-full py-4  flex items-center text-gray-400 justify-between ">
      <Button className="bg-gray-500 cursor-pointer text-white ml-4">NavBar</Button>
      <div className="flex gap-6 mr-4" >
        <h2 className="cursor-pointer">Signup</h2>
        <h2 className="cursor-pointer">Support</h2>
        <h2 className="cursor-pointer">About</h2>
        <h2 className="cursor-pointer">Contact</h2>
      </div>
    </nav>
  )
}

export default Navbar;
