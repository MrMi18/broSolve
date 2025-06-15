"use client"
import { Button } from "../ui/button";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const Navbar = () => {
  const router = useRouter();
  const{user,loading} = useAuth();

  const logoutHandler = async () => {
    try {
      await signOut(auth);
      router.push("/login");
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  return (
    <nav className="bg-gray-200 w-full py-4  flex items-center text-gray-400 justify-between ">
      <Button className="bg-gray-500 cursor-pointer text-white ml-4">BroSolve</Button>
      <ul className="flex gap-6 mr-4" >
        <li className="cursor-pointer">Signup</li>
        <li className="cursor-pointer">Support</li>
        <li className="cursor-pointer">About</li>
        <li className="cursor-pointer">Contact</li>
        <li>{user && user.email?.split('@')[0]}</li>
        {user && <li className="cursor-pointer" onClick={logoutHandler}>Logout</li>}

      </ul>
    </nav>
  )
}

export default Navbar;
