import { HeartHandshake } from "lucide-react"
import { maritalLifeAdvisors } from "./JsonData"
import { AdvisorCard } from "./Advisor_Card"
import CategoryHeader from "./Header"

export default function MaritalLifePage() {
  return (
    <>
      <CategoryHeader
        title="Marriage & Partnership Advisors"
        description="Our marriage specialists provide insights and guidance to strengthen your marital bond, improve communication, and navigate challenges together."
        icon={<HeartHandshake className="w-64 h-64" />}
        bgColor="bg-[#3291F6]"
      />

      <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto px-2 mb-10">
        {maritalLifeAdvisors.map((advisor) => (
          <AdvisorCard key={advisor.id} advisor={advisor} />
        ))}
      </div>
    </>
  )
}
