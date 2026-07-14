import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";

type PaymentForm = {
  supplierName: string;
  orderNumber: string;
  amount: string;
};

export function Home() {
  const { register, handleSubmit } = useForm<PaymentForm>({
    defaultValues: {
      supplierName: "",
      orderNumber: "",
      amount: ""
    }
  });

  const onSubmit = (data: PaymentForm) => {
    console.log("Payment data:", data);
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col">
      <header className="flex items-center justify-between p-4 sm:p-6 w-full">
        <div className="flex items-center gap-3 sm:gap-4">
          <Logo className="w-8 h-8 sm:w-10 sm:h-10" />
          <span className="font-mono text-lg sm:text-xl font-bold tracking-[0.2em] uppercase">
            10BottleCash
          </span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/signin" className="text-xs sm:text-sm font-bold tracking-wider uppercase hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="bg-primary text-black px-4 sm:px-6 py-2 rounded-sm text-xs sm:text-sm font-bold tracking-wider uppercase hover:bg-primary/90 transition-colors">
            Sign Up
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[280px] sm:max-w-[320px] flex flex-col gap-8 pb-20">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-3">
              <Label htmlFor="supplierName">Supplier Name</Label>
              <Input id="supplierName" {...register("supplierName")} className="bg-[#111] border-zinc-800" />
            </div>
            
            <div className="flex flex-col gap-3">
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input id="orderNumber" {...register("orderNumber")} className="bg-[#111] border-zinc-800" />
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-mono">$</span>
                <Input id="amount" placeholder="0.00" {...register("amount")} className="pl-8 font-mono bg-[#111] border-zinc-800" />
              </div>
            </div>

            <Button type="submit" className="w-full mt-4 text-sm sm:text-base h-14">
              $ PAY WITH CASH APP
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}