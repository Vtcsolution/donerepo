import Navigation from "./Navigator"
import { useAuth } from "./screen/AuthContext"
// import ProfileSection from "@/components/profile-section"
import DashboardAccordions from "./Short_COmponents/Dashboard_Accordian"
import  {  ProfileSection1 } from "./Short_COmponents/Profiles"


const Dashboard = () => {

  const {user} = useAuth();
  const username= user?.username ||"user";

  // bg-[#F5F5F5]
  return (
    <div className="px-2 bh-white">
      <div className="lg:hidden">
        <ProfileSection1 />
      </div>
      <Navigation/>
      <div className="div max-w-7xl m-auto">
         <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-2">
          <h1 className="text-2xl font-semibold text-center mb-2"><span className="text-blue-800">Welcome, {username}</span> our best Coach Platform</h1>

            <DashboardAccordions />
          </div>

          
        </div>
      </div>
    </div>
  )
}

export default Dashboard
