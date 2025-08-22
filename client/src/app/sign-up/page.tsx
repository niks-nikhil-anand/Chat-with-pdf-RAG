import { SignUp } from "@clerk/nextjs";


export default function Page() {
  return (
   <div className='min-h-[93vh] w-full flex justify-center items-center'>
    <SignUp  />
   </div>
  )
}