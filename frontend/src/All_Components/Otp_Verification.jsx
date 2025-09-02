import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export function InputOTPDemo() {
  return (
   <div className=" flex justify-center items-center h-[90vh]">
     <div className="border border-gray-200 rounded-md shadow-md p-4">
      <h1 className=" text-center my-2 font-sans font-extrabold text-2xl">Verify Email</h1>
      <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
    <div className=" text-center my-2">
      <Button variant="brand">Verify</Button>
    </div>
     </div>
   </div>
  )
}
