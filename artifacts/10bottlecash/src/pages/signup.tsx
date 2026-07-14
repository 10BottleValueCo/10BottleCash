import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SignUpForm = {
  email: string;
  password: "";
  repeatPassword: "";
};

export function SignUp() {
  const { register, handleSubmit } = useForm<SignUpForm>({
    defaultValues: {
      email: "",
      password: "",
      repeatPassword: ""
    }
  });

  const onSubmit = (data: SignUpForm) => {
    console.log("Sign up:", data);
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col p-6">
      <Link href="/" className="text-zinc-400 hover:text-white transition-colors text-xs sm:text-sm tracking-wider uppercase inline-flex items-center gap-2 w-fit">
        <span>←</span> Back
      </Link>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-[280px] sm:max-w-[320px] flex flex-col gap-10 pb-20">
          <div className="text-center flex flex-col gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-wider uppercase">Create your account</h1>
            <p className="text-zinc-400 text-sm">Get started with 10BottleCash</p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-3">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" {...register("email")} className="bg-[#111] border-zinc-800" />
            </div>
            
            <div className="flex flex-col gap-3">
              <Label htmlFor="password">Create a password</Label>
              <Input id="password" type="password" {...register("password")} className="bg-[#111] border-zinc-800" />
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="repeatPassword">Repeat password</Label>
              <Input id="repeatPassword" type="password" {...register("repeatPassword")} className="bg-[#111] border-zinc-800" />
            </div>

            <Button type="submit" className="w-full mt-2 h-14">
              Continue
            </Button>
          </form>

          <div className="text-center mt-2">
            <Link href="/signin" className="text-zinc-400 text-sm hover:text-white transition-colors inline-block">
              Already have an account? <span className="text-primary underline-offset-4 hover:underline">Sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}