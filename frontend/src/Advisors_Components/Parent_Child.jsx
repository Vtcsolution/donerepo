import { Baby } from "lucide-react"
import { parentChildrenAdvisors } from "./JsonData"
import CategoryHeader from "./Header"
import { AdvisorCard } from "./Advisor_Card"

export default function ParentChildrenPage() {
  return (
    <>
      <CategoryHeader
        title="Parent & Child Relationship Advisors"
        description="Our specialists help parents understand their children's unique needs and gifts, while providing guidance to strengthen the parent-child bond."
        icon={<Baby className="w-64 h-64" />}
        bgColor="bg-[#3291F6]"
      />

      <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto px-2 mb-10">     
        {parentChildrenAdvisors.map((advisor) => (
          <AdvisorCard key={advisor.id} advisor={advisor} />
        ))}
      </div>
    </>
  )
}
