import { Cat } from "lucide-react"
import CategoryHeader from "./Header"
import { petPsychicsAdvisors } from "./JsonData"
import { AdvisorCard } from "./Advisor_Card"

export default function PetPsychicsPage() {
  return (
    <>
      <CategoryHeader
        title="Pet Psychic Advisors"
        description="Our animal communicators can connect with your pets to understand their needs, behaviors, and emotions, helping strengthen your bond and resolve issues."
        icon={<Cat className="w-64 h-64" />}
        bgColor="bg-[#3291F6]"
      />

      <div className="grid grid-cols-1 gap-8 max-w-6xl m-auto px-2">
        {petPsychicsAdvisors.map((advisor) => (
          <AdvisorCard key={advisor.id} advisor={advisor} />
        ))}
      </div>
      </>
  )
}
