import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navigation from "./Navigator";
import { useState } from "react";
import { ArrowDownToDot, Gift } from "lucide-react"

const Vouchers = () => {
     const [code, setCode] = useState(["", "", "", ""])

  const handleChange = (index, value) => {
    if (value.length > 4) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input when current one is filled
    if (value.length === 4 && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const fullCode = code.join("-")
    // Here you would handle the code redemption
    console.log("Redeeming code:", fullCode)
  }
  return (
    <div className="">
      <div>
        <Navigation />
      </div>
      <div className="max-w-xl w-full m-auto mt-4">
        <h1 className=" text-2xl font-extrabold text-center my-2">Vouchers</h1>
        <Card className="shadow-sm rounded-sm border w-full border-gray-200">
          <CardHeader className="text-center ">
            <CardTitle className={"text-xl"}>
              Your account is not yet complete.
            </CardTitle>
            <CardDescription className={"text-base"}>
              To use IJm vouchers, your account must meet the following
              conditions:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className=" bg-[#F8D7DA] flex justify-center border border-red-200 rounded-sm items-start gap-4 p-2 sm:p-4">
              <div>
                <p className=" text-2xl font-extrabold">1</p>
              </div>
              <div className=" text-center">
                <p className=" font-[350] text-gray-600 text-lg">
                  Sie müssen eine verifizierte Telefonnummer haben, die mit
                  Ihrem Konto verbunden ist. Klicken Sie hier, um eine
                  Telefonnummer hinzuzufügen.
                </p>
                <Button variant="brand" className={"mt-2"}>GO TO PHONE SETTINGS</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm rounded-sm my-4">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-primary/10 p-3">
            <Gift className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-semibold">Redeem Gift Code</CardTitle>
        <CardDescription>Enter the gift code you have received</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2">
            {code.map((segment, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                value={segment}
                onChange={(e) => handleChange(index, e.target.value)}
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-lg font-medium shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="XXXX"
                maxLength={4}
                autoFocus={index === 0}
              />
            ))}
          </div>
          <Button type="submit" variant="brand" className="w-full text-base font-medium py-6">
            REDEEM
          </Button>
        </form>
      </CardContent>
    </Card>
      </div>
    </div>
  );
};

export default Vouchers;
