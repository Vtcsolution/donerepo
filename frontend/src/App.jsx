import { Route, Routes, useLocation } from "react-router-dom"
import Navbar from "./All_Components/Navbar"
import Dashboard from "./All_Components/Dashboard"
import Account from "./All_Components/Account"
import Appointments from "./All_Components/Appointments"
import My_Consultations from "./All_Components/My_Consultations"
import Reviews from "./All_Components/Reviews"
import Transactions from "./All_Components/Transactions"
import Vouchers from "./All_Components/Vouchers"
import Favourites from "./All_Components/Favourites"
import Home from "./All_Components/Home"
import InterFace from "./Chat_Components/InterFace"
import UpdateProfile from "./All_Components/UpdateProfile"
import { Toaster } from "./components/ui/sonner"
import NotificationsPage from "./All_Components/Short_COmponents/All_Notifications"
import AuraReading from "./Advisors_Components/AuraReading"
import CrystalReadingPage from "./Advisors_Components/CrystalReadings"
import PetPsychicsPage from "./Advisors_Components/PetPsychics"
import MoneyPsychicsPage from "./Advisors_Components/Money_Advsiors"
import MissingPersonPsychicsPage from "./Advisors_Components/Missing_Person"
import CheatingAffairsPage from "./Advisors_Components/Cheating_Affairs"
import FamilyAffairsPage from "./Advisors_Components/Family_Affairs"
import MaritalLifePage from "./Advisors_Components/Maricial_Life"
import ParentChildrenPage from "./Advisors_Components/Parent_Child"
import AOS from 'aos';
import 'aos/dist/aos.css';
import Admin_Dashboard from "./Admin_Dashboard/Admin_Dashboard"
import Transactionss from "./Admin_Dashboard/Transactions"
import Reviewss from "./Admin_Dashboard/Reviews"
import Add_Advisor from "./Admin_Dashboard/Add_Advisor"
import Send_Mail from "./Admin_Dashboard/SendMail"
import ModernFooter from "./All_Components/Footer"
import Scroll from "./All_Components/Scroll"
import AI_Talk_Form from "./All_Components/AI_Talk_Form"
import Vedic_Astrologers from "./astrologers/Vedic_Astrologer"
import VedicAstrologerChart from "./astrologers/Vedic_Astrolger_Detail"
import Tarot_Readers from "./astrologers/Tarot_Readers"
import Tarot_Reader_detail from "./astrologers/Tarot_Chart_Detail"
import Numerology from "./astrologers/Numerology"
import Numerology_Detail from "./astrologers/Numerology_Detail"
import Love from "./astrologers/Love"
import LoveAstrologerOutput from "./astrologers/Love_Detail"
import TermsAndConditions from "./All_Components/Terms_and_Conditions"
import AboutPage from "./All_Components/About"
import ContactPage from "./All_Components/Contact"
import AllUsers from "./Admin_Dashboard/AllUsers"
import AllAdvisors from "./Admin_Dashboard/AllAdvisors"
import AI_Inputs_Data from "./Admin_Dashboard/AI_Inputs_data"
import AllNotifications from "./Admin_Dashboard/AllNotification"
import Update_Terms_Confitions from "./Admin_Dashboard/Update_TermConditions"
import Update_About from "./Admin_Dashboard/Update_About"
import { InputOTPDemo } from "./All_Components/Otp_Verification"
import Signup from "./All_Components/screen/Signup"
import Signin from "./All_Components/screen/Signin"
import Forgot_Password from "./All_Components/screen/Forgot_Password"
import Reset_Password from "./All_Components/screen/Reset_Password"
import UserChats from "./Admin_Dashboard/UserChats"
import UserChatDetail from "./Admin_Dashboard/UserChatDetail"
import AdminUpdateProfile from "./Admin_Dashboard/AdminUpdateProfile"
import AdminProfile from "./Admin_Dashboard/Admin_Profile"
import { useEffect, useState } from "react";
import ProtectedRoute from "./All_Components/screen/ProtectedRoute"
import PageNotFound from "./All_Components/screen/PageNotFound"
import Admin_login from "./Admin_Dashboard/Admin_login"
import AdminProtectedRoute from "./context/AdminProtectedRoute";
import PaymentResult from "./All_Components/screen/PaymentResult"
import PaymentRedirectHandler from "./All_Components/screen/PaymentRedirectHandler"
import PsychicProfile from "./astrologers/PsychicProfile"
import User_Details from "./Admin_Dashboard/User_Details"
import AstrologyReport from "./astrologers/AstrologyReport"
import MonthlyForecast from "./astrologers/MonthlyForecast"
import LoveCompatibility from "./astrologers/LoveCompatibility"
import NumerologyReport from "./astrologers/NumerologyReport"
import LoveReportTable from "./astrologers/LoveReportTable"
import LoveReportDetail from "./astrologers/LoveReportDetail"
import AstrologyReportTable from "./astrologers/AstrologyReportTable"
import MonthlyForecastTable from "./astrologers/MontlyForecastTable"
import MonthlyForecastDetail from "./astrologers/MonthlyForecastDetail"


const App = () => {

    const location = useLocation();
const [openPaymentModal, setOpenPaymentModal] = useState(null);
  const hideNavbarRoutes = ["/admin/login","/admin/dashboard","/admin/dashboard/transactions","/admin/dashboard/reviews","/admin/dashboard/add-advisor","/admin/dashboard/sendmail","/admin/dashboard/allusers","/admin/dashboard/alladvisors","/admin/dashboard/inputs-data","/admin/dashboard/all-notifications","/admin/dashboard/update-conditions","/admin/dashboard/update-about","/admin/dashboard/user-details/:userId","/admin/dashboard/users-chat","/admin/dashboard/user-chat-detail","/admin/dashboard/updateprofile","/admin/dashboard/profile"];
  const dynamicRoutePatterns = [
    /^\/admin-dashboard-doctor\/.+$/,
    /^\/reset-password\/.+$/
  ];
  const shouldShowNavbar = !(
    hideNavbarRoutes.includes(location.pathname) ||
    dynamicRoutePatterns.some((pattern) => pattern.test(location.pathname))
  );
  useEffect(() => {
        AOS.init({ duration: 800 }); // Adjust duration and other options if needed
      }, []);
  return (
    <div>
      <Scroll/>
     {shouldShowNavbar && <Navbar onOpenPaymentModal={(fn) => setOpenPaymentModal(() => fn)}/>}
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/dashboard" element={ <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>}/>
<Route path="/chat/:psychicId" element={<ProtectedRoute><InterFace openPaymentModal={openPaymentModal} /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account/></ProtectedRoute>}/>
        <Route path="/appointments" element={<ProtectedRoute><Appointments/></ProtectedRoute>}/>
        <Route path="/consultations" element={<ProtectedRoute><My_Consultations/></ProtectedRoute>}/>
        <Route path="/reviews" element={<Reviews/>}/>
        <Route path="/monthly-forecast" element={<ProtectedRoute><MonthlyForecast openPaymentModal={openPaymentModal} /></ProtectedRoute>} />
        <Route path="/love-compatibility" element={<ProtectedRoute><LoveCompatibility openPaymentModal={openPaymentModal}/></ProtectedRoute>} />
        <Route path="/love-reports" element={<ProtectedRoute><LoveReportTable /></ProtectedRoute>} />
        <Route path="/love-report/:reportId" element={<ProtectedRoute><LoveReportDetail /></ProtectedRoute>} />

        <Route path="/astrology-report" element={<ProtectedRoute><AstrologyReport openPaymentModal={openPaymentModal}/></ProtectedRoute>} />
        <Route path="/psychic/:psychicId" element={<PsychicProfile />} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions/></ProtectedRoute>}/>
        <Route path="/vouchers" element={<Vouchers/>}/>
        <Route path="/favourites" element={<ProtectedRoute><Favourites/></ProtectedRoute>}/>
        <Route path="/update-profile" element={<ProtectedRoute><UpdateProfile/></ProtectedRoute>}/>
        <Route path="/all-notifications" element={<NotificationsPage/>}/>
        <Route path="/form-fill" element={<AI_Talk_Form/>}/>
        <Route path="/terms-&-conditions" element={<TermsAndConditions/>}/>
        <Route path="/about" element={<AboutPage/>}/>
        <Route path="/contact" element={<ContactPage/>}/>
        <Route path="/otp-verification" element={<InputOTPDemo/>}/>
        <Route path="/register" element={<Signup/>}/>
        <Route path="/login" element={<Signin/>}/>
        <Route path="/forgot-password" element={<Forgot_Password/>}/>
        <Route path="/reset-password/:token" element={<Reset_Password/>}/>
 <Route path="/payment/result" element={<PaymentResult/>}/> {/* Handles ?id= */}
  <Route path="/payment/result/:id" element={<PaymentResult/>}/> {/* Handles /tr_123456 */}        <Route path="/aura-advisors" element={<AuraReading/>}/>
        <Route path="/crystal-advisors" element={<CrystalReadingPage/>}/>
        <Route path="/payment/result-temp" element={<PaymentRedirectHandler />} />
        <Route path="/astrology-reports" element={<ProtectedRoute><AstrologyReportTable/></ProtectedRoute>}/>
        <Route path="/monthly-forecast-reports" element={<ProtectedRoute><MonthlyForecastTable/></ProtectedRoute>}/>
         <Route path="/monthly-forecast/:reportId" element={<ProtectedRoute><MonthlyForecastDetail/></ProtectedRoute>}/>
        <Route path="/numerology-report" element={<ProtectedRoute><NumerologyReport/></ProtectedRoute>}/>
        <Route path="/pet-advisors" element={<PetPsychicsPage/>}/>
        <Route path="/money-advisors" element={<MoneyPsychicsPage/>}/>
        <Route path="/missing-person-advisors" element={<MissingPersonPsychicsPage/>}/>
        <Route path="/cheating-affairs-advisors" element={<CheatingAffairsPage/>}/>
        <Route path="/family-affairs-advisors" element={<FamilyAffairsPage/>}/>
        <Route path="/maritial-life-advisors" element={<MaritalLifePage/>}/>
        <Route path="/parents-child-advisors" element={<ParentChildrenPage/>}/>

        <Route path="/vedic-astrologers" element={<Vedic_Astrologers/>}/>
        <Route path="/astrology-report/:reportId" element={<VedicAstrologerChart/>}/>
        <Route path="/tarot-readers" element={<Tarot_Readers/>}/>
        <Route path="/tarot-reader-detail" element={<Tarot_Reader_detail/>}/>
        <Route path="/numerology" element={<Numerology/>}/>
        <Route path="/numerology-detail" element={<Numerology_Detail/>}/>
        <Route path="/love-astrologer" element={<Love/>}/>
        <Route path="/love-astrologer-detail" element={<LoveAstrologerOutput/>}/>

    {/* Admin Dashboard */}
<Route path="/admin/login" element={<Admin_login />} />

<Route path="/admin/dashboard" element={
  <AdminProtectedRoute><Admin_Dashboard /></AdminProtectedRoute>
} />
<Route path="/admin/dashboard/transactions" element={
  <AdminProtectedRoute><Transactionss /></AdminProtectedRoute>
} />
<Route path="/admin/dashboard/reviews" element={
  <AdminProtectedRoute><Reviewss /></AdminProtectedRoute>
} />
<Route path="/admin/dashboard/add-advisor" element={
  <AdminProtectedRoute><Add_Advisor /></AdminProtectedRoute>
} />
<Route path="/admin/dashboard/sendmail" element={
  <AdminProtectedRoute><Send_Mail /></AdminProtectedRoute>
} />
<Route path="/admin/dashboard/allusers" element={
  <AdminProtectedRoute><AllUsers /></AdminProtectedRoute>
} />
<Route path="/admin/dashboard/alladvisors" element={
  <AdminProtectedRoute><AllAdvisors /></AdminProtectedRoute>
} />
<Route path="/admin/dashboard/inputs-data" element={
  <AdminProtectedRoute><AI_Inputs_Data /></AdminProtectedRoute>
} />
<Route path="/admin/dashboard/all-notifications" element={
  <AdminProtectedRoute><AllNotifications /></AdminProtectedRoute>
} />
<Route path="/admin/dashboard/update-conditions" element={
  <AdminProtectedRoute><Update_Terms_Confitions /></AdminProtectedRoute>
} />

<Route path="/admin/dashboard/user-details/:userId" element= {<AdminProtectedRoute> < User_Details/> </AdminProtectedRoute>} />

<Route path="/admin/dashboard/update-about" element={
  <AdminProtectedRoute><Update_About /></AdminProtectedRoute>
} />
<Route path="/admin/dashboard/users-chat" element={
  <AdminProtectedRoute><UserChats /></AdminProtectedRoute>
} />
<Route path="/admin/dashboard/user-chat-detail/:chatId" element={
  <AdminProtectedRoute><UserChatDetail /></AdminProtectedRoute>
} />
<Route path="/admin/dashboard/updateprofile" element={
  <AdminProtectedRoute><AdminUpdateProfile /></AdminProtectedRoute>
} />
<Route path="/admin/dashboard/profile" element={
  <AdminProtectedRoute><AdminProfile /></AdminProtectedRoute>
} />

          <Route path="*" element={<PageNotFound />} />


      </Routes>
      {shouldShowNavbar && <ModernFooter/>} 
      
      <Toaster/>
    </div>
  )
}

export default App
