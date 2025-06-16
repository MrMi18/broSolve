
"use client"
import { useAuth } from "@/context/AuthContext"
import { useContext, useEffect } from "react"
import { useRouter } from "next/navigation";
export default function Profile(){
    const {user,loading} = useAuth();
    const router = useRouter()
    
      
    if(loading) return <div>loading.....</div>
    
    return (
        <div className="flex justify-center items-center my-auto">

              <h2>Hello this is profile section</h2>
        </div>
        
    )
}