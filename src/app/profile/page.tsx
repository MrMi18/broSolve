
"use client"
import { useAuth } from "@/context/AuthContext"
import { useContext } from "react"

export default function Profile(){
    const {user,loading} = useAuth();
    console.log(user)
    if(loading) return <div>loading.....</div>
    
    return (
        <div className="flex justify-center items-center my-auto">

              <h2>Hello this is profile section</h2>
        </div>
        
    )
}