
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BadgeDollarSign, ChevronRight, Fence, HandCoins, LayoutDashboard, Mail, MessageCircle, Settings, SquareUserRound, Star, User, User2Icon } from 'lucide-react';


const Doctor_Side_Bar = ({ side }) => {
    const [isactive, setIsactive] = useState(0)
    const [isopentoggle, setIsopentoggle] = useState(false)
    const isopen = (ind)=>{
        setIsactive(ind)
        setIsopentoggle(!isopentoggle)
    }
  return (
    <div>
        <div id="sidebar-wrapper" className={`${side ? "open":""} bg-[#3B5EB7]`}>
            <div className="sidebar hover:overflow-y-auto h-full scrollbar-hide scrollbar-thin scrollbar-track-transparent scrollbar-thumb-blue-500 hover:scrollbar-thumb-blue-700">
            <ul className=" px-2 py-6 text-white relative">
                <li id="cc" className={`flex justify-between absolute -top-2 border-b border-gray-200 pb-2 left-0 right-0 p-2 my-4`} onClick={()=>isopen(0)}>
                <Link to='/admin/dashboard'>
                <div className=" flex justify-center items-center space-x-2">
                      <img src="/images/newLogo.jpg" alt="logo" className="w-8 h-8 object-cover rounded-full border border-gray-100 shadpw-sm" /> <p className=" cursor-pointer">Spiritual</p>
                  </div>
                </Link>
              </li>
                <li id="cc" className={`flex justify-between p-2 rounded-lg mt-12 mb-4`} onClick={()=>isopen(0)}>
                <Link to='/admin/dashboard'>
                <div className=" flex justify-center space-x-2">
                      <LayoutDashboard/> <p className=" cursor-pointer">DashBoard</p>
                  </div>
                </Link>
              </li>
                  <li className=" my-4">
                    <div id="cc" className={`flex justify-between p-2 rounded-lg`} onClick={()=>isopen(2)}>
                    <div className=" flex justify-center  space-x-2">
                         <Fence/> <p className=" cursor-pointer">Advisors</p>
                     </div>
                     <div className="arrow">
                             <ChevronRight
        className={`transition-transform duration-500 ease-in-out ${
          isopentoggle && isactive === 2 ? "rotate-90" : ""
        }`}
      />
                     </div>
                    </div>
                     <div className={`submenu-wrapper ${isactive===2 && isopentoggle===true ? "colaps":"colapsd"}`}>
                         <ul className="submenu text-start pl-8 border-l-2 mt-2">
                         <li className="my-2"><Link to="/admin/dashboard/alladvisors">All Advisor</Link></li>
                         {/* <li className="my-2"><Link to="/admin-dashboard-myproperties">My Properties</Link></li> */}
                         <li className="my-2"><Link to="/admin/dashboard/add-advisor">Add Advisor</Link></li>
                         </ul>
                     </div>
                 </li>
                  <li id="cc" className={`flex justify-between p-2 rounded-lg my-4`} onClick={()=>isopen(1)}>
                  <Link to='/admin/dashboard/transactions'> 
                  <div className=" flex justify-center space-x-2">
                        <BadgeDollarSign/> <p className=" cursor-pointer">Transactions</p>
                    </div>
                  </Link>
                </li>
                 <li id="cc" className={`flex justify-between p-2 rounded-lg my-4`} onClick={()=>isopen(1)}>
                  <Link to='/admin/dashboard/users-chat'> 
                  <div className=" flex justify-center space-x-2">
                        <MessageCircle/> <p className=" cursor-pointer">Chats</p>
                    </div>
                  </Link>
                </li>
                  <li id="cc" className={`flex justify-between p-2 rounded-lg my-4`} onClick={()=>isopen(1)}>
                  <Link to='/admin/dashboard/allusers'> 
                  <div className=" flex justify-center space-x-2">
                        <User2Icon/> <p className=" cursor-pointer">Users</p>
                    </div>
                  </Link>
                </li>
                  <li id="cc" className={`flex justify-between p-2 rounded-lg my-4`} onClick={()=>isopen(1)}>
                  <Link to='/admin/dashboard/reviews'> 
                  <div className=" flex justify-center space-x-2">
                        <Star/> <p className=" cursor-pointer">Reviews</p>
                    </div>
                  </Link>
                </li>
                <li className=" my-4">
                   <div id="cc" className={`flex justify-between p-2 rounded-lg`} onClick={()=>isopen(5)}>
                   <div className=" flex justify-center  space-x-2">
                        <Settings/> <p className=" cursor-pointer">Setting</p>
                    </div>
                    <div className="arrow">
                         <ChevronRight
        className={`transition-transform duration-500 ease-in-out ${
          isopentoggle && isactive === 5 ? "rotate-90" : ""
        }`}
      />
                        
                        <i className={ `fa-solid fa-chevron-up ${isopentoggle&&isactive===5 ? " rotate-180 duration-300":"rotate-90 duration-500"}`}></i>
                    </div>
                   </div>
                    <div className={`submenu-wrapper ${isactive===5 && isopentoggle===true ? "colaps":"colapsd"}`}>
                        <ul className="submenu text-start pl-8 border-l-2 mt-2">
                        <li className="my-2"><Link to="/admin/dashboard/sendmail">Send Mail</Link></li>
                        <li className="my-2"><Link to="/admin/dashboard/inputs-data">AI Inputs Data</Link></li>
                        <li className="my-2"><Link to="/admin/dashboard/all-notifications">Notifications</Link></li>
                        <li className="my-2"><Link to="/admin/dashboard/update-conditions">Update Terms Page</Link></li>
                        <li className="my-2"><Link to="/admin/dashboard/update-about">Update About Page</Link></li>
                       
                        </ul>
                    </div>
                </li>
               
               
                
               
                {/* <li id="cc" className={`flex justify-between p-2 rounded-lg my-4 ${isactive===6 ? "activ" : ""}`} onClick={()=>isopen(6)}>
                  <div className=" flex justify-center space-x-2">
                        <LogoutOutlined/> <p className=" cursor-pointer">{createloading ? (
                            <>
                            Logout
                            <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18px"
        fill="#fff"
        className="ml-2 inline animate-spin"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z"
          data-original="#000000"
        />
      </svg>
                            </>
                        ):"Logout"}</p>
                    </div>
                </li> */}

            </ul>
            </div>
        </div>
    </div>
  )
}

export default Doctor_Side_Bar