import { Search } from "lucide-react"
import { missingPersonPsychicsAdvisors } from "./JsonData"
import { AdvisorCard } from "./Advisor_Card"
import CategoryHeader from "./Header"

export default function MissingPersonPsychicsPage() {
  return (
    <>
      <CategoryHeader
        title="Missing Person Psychic Advisors"
        description="Our specialized psychics use remote viewing, object reading, and other intuitive abilities to provide insights and potential leads for missing persons cases."
        icon={<Search className="w-64 h-64" />}
        bgColor="bg-[#3291F6]"
      />

      <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto px-2 mb-10">
        {missingPersonPsychicsAdvisors.map((advisor) => (
          <AdvisorCard key={advisor.id} advisor={advisor} />
        ))}
      </div>
      </>
  )
}
