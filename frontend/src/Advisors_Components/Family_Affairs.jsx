import { Users } from "lucide-react"
import CategoryHeader from "./Header"
import { familyAffairsAdvisors } from "./JsonData"
import { AdvisorCard } from "./Advisor_Card"

export default function FamilyAffairsPage() {
  return (
    <>
      <CategoryHeader
        title="Family Dynamics Advisors"
        description="Our family specialists help identify and heal dysfunctional patterns, resolve conflicts, and strengthen the bonds between family members."
        icon={<Users className="w-64 h-64" />}
        bgColor="bg-[#3291F6]"
      />

      <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto px-2 mb-10">
        {familyAffairsAdvisors.map((advisor) => (
          <AdvisorCard key={advisor.id} advisor={advisor} />
        ))}
      </div>
    </>
  )
}
