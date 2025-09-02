import Navigation from "./Navigator";
import { ProfileSection } from "./Short_COmponents/Profiles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const Appointments = () => {
  return (
    <div className=" px-2 sm:px-4 min-h-screen">
      <div className=" max-w-7xl mx-auto pb-10">
        <Navigation />
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-2">
          <div className="card-3 w-full bordre border-gray-200">
            <Card className="w-full rounded-sm shadow-sm">
        <CardHeader className="border-b bg-white">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-bold">Telefontermine</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-2 sm:p-4">
          <h1 className=" text-base font-[350] font-sans">Sie haben keine Termine vereinbart.</h1>

        </CardContent>
      </Card>
          </div>
          </div>

          <div className="lg:col-span-1 max-lg:hidden">
            <ProfileSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
