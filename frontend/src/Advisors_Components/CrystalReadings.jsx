import { SnowflakeIcon as Crystal } from "lucide-react"
import { crystalReadingAdvisors } from "./JsonData"
import CategoryHeader from "./Header"
import { AdvisorCard } from "./Advisor_Card"
export default function CrystalReadingPage() {
  return (
    <>
      <CategoryHeader
        title="Crystal Reading Advisors"
        description="Our crystal reading experts use the ancient art of lithomancy and crystal energy to provide guidance, clarity, and insights into your life's most pressing questions."
        icon={<Crystal className="w-64 h-64" />}
        bgColor="bg-[#3291F6]"
      />

      <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto px-2 mb-10">
        {crystalReadingAdvisors.map((advisor) => (
          <AdvisorCard key={advisor.id} advisor={advisor} />
        ))}
      </div>
      </>
  )
}
