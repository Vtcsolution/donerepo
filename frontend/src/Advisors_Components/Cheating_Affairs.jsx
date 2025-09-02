import { UserRound } from "lucide-react"
import CategoryHeader from "./Header"
import { cheatingAffairsAdvisors } from "./JsonData"
import { AdvisorCard } from "./Advisor_Card"

export default function CheatingAffairsPage() {
  return (
    <>
      <CategoryHeader
        title="Infidelity & Affairs Advisors"
        description="Our intuitive advisors provide clarity and truth about suspected infidelity, helping you make informed decisions about your relationship's future."
        icon={<UserRound className="w-64 h-64" />}
        bgColor="bg-[#3291F6]"
      />

      <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto px-2 mb-10"> 
        {cheatingAffairsAdvisors.map((advisor) => (
          <AdvisorCard key={advisor.id} advisor={advisor} />
        ))}
      </div>
      </>
  )
}
