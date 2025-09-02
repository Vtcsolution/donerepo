import { Sparkles } from "lucide-react"
import CategoryHeader from "./Header"
import { auraReadingAdvisors } from "./JsonData"
import { AdvisorCard } from "./Advisor_Card"



export default function AuraReading() {
  return (
    <>
      <CategoryHeader
        title="Aura Reading Advisors"
        description="Our aura reading specialists can see and interpret the colors and energies surrounding you, providing insights into your emotional, mental, and spiritual state."
        icon={<Sparkles className="w-64 h-64" />}
        bgColor="bg-[#3291F6]"
      />

      <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto px-2 mb-10">
        {auraReadingAdvisors.map((advisor) => (
          <AdvisorCard key={advisor.id} advisor={advisor} />
        ))}
      </div>
      </>
  )
}
