import { DollarSign } from "lucide-react"
import { moneyPsychicsAdvisors } from "./JsonData"
import { AdvisorCard } from "./Advisor_Card"
import CategoryHeader from "./Header"

export default function MoneyPsychicsPage() {
  return (
    <>
      <CategoryHeader
        title="Money & Abundance Advisors"
        description="Our financial intuitive advisors can identify energetic blocks to wealth, provide guidance for prosperity, and help you manifest abundance in your life."
        icon={<DollarSign className="w-64 h-64" />}
        bgColor="bg-[#3291F6]"
      />

      <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto px-2 mb-10">
        {moneyPsychicsAdvisors.map((advisor) => (
          <AdvisorCard key={advisor.id} advisor={advisor} />
        ))}
      </div>
      </>
  )
}
