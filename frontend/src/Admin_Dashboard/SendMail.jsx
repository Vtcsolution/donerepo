
import { useState } from 'react';
import Dashboard_Navbar from './Admin_Navbar';
import Doctor_Side_Bar from './SideBar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
const Send_Mail = () => {
    const [side, setSide] = useState(false); // Sidebar state

    // const formatDate = (date) => {
    //   if (!date) return "Not provided"
    //   return new Date(date).toLocaleDateString("en-US", {
    //     year: "numeric",
    //     month: "long",
    //     day: "numeric",
    //   })
    // }

    const user = {
        name:"User",
        email:"user@gmail.com",
        profile:"https://avatars.mds.yandex.net/i?id=93f523ab7f890b9175f222cd947dc36ccbd81bf7-9652646-images-thumbs&n=13"
    }

  return (
   <div>
    <div>
        <Dashboard_Navbar side={side} setSide={setSide} user={user}/>
    </div>
     <div className="dashboard-wrapper">
            <Doctor_Side_Bar side={side} setSide={setSide} user={user}/>
      <div className="dashboard-side min-h-screen ">       
        <h2 className=' text-2xl md:text-3xl lg:text-4xl font-sans font-extrabold text-center my-6'>Send Mail</h2>
            <div className='mx-2 md:mx-4'>
                <form className=" space-y-4 border max-w-3xl mx-auto border-gray-200 p-4 rounded-md">
                <div className=" space-y-2">
                    <Label htmlFor="Email">Email</Label>
                    <Input type="text" id="Email" placeholder="Email" />
                </div>
                <div>
                    <Button variant="purple" className="w-full">Submit</Button>
                </div>
            </form>
            </div>
        </div>
    </div>
   </div>
   
  )
}

export default Send_Mail