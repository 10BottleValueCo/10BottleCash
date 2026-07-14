import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";

type SignInForm = {
  email: string;
  password: string;
};

const inputStyle: React.CSSProperties = {
  backgroundColor: "#111111",
  border: "1px solid #333333",
  color: "#ffffff",
  padding: "10px 12px",
  fontSize: "13px",
  borderRadius: "2px",
  outline: "none",
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#cccccc",
};

export function SignIn() {
  const { register, handleSubmit } = useForm<SignInForm>({
    defaultValues: { email: "", password: "" }
  });

  const [, navigate] = useLocation();
  const onSubmit = (data: SignInForm) => {
    console.log("Sign in:", data);
    navigate("/dashboard");
  };

  return (
    <div
      className="min-h-[100dvh] bg-black text-white flex flex-col"
      style={{ padding: "24px" }}
    >
      <Link
        href="/"
        style={{
          color: "#888888",
          fontSize: "12px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          width: "fit-content",
        }}
      >
        ← Back
      </Link>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div style={{ width: "100%", maxWidth: "300px", display: "flex", flexDirection: "column", gap: "32px" }}>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "8px" }}>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              Sign in to your account
            </h1>
            <p style={{ color: "#888888", fontSize: "13px" }}>
              Welcome back to 10BottleCash
            </p>
          </div>

          <form
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            onSubmit={handleSubmit(onSubmit)}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label htmlFor="email" style={labelStyle}>Email address</label>
              <input id="email" type="email" {...register("email")} style={inputStyle} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label htmlFor="password" style={labelStyle}>Password</label>
              <input
                id="password"
                type="password"
                {...register("password")}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              style={{
                backgroundColor: "#F5A623",
                color: "#000000",
                padding: "14px",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                border: "none",
                borderRadius: "2px",
                cursor: "pointer",
                width: "100%",
                marginTop: "4px",
              }}
            >
              Sign In
            </button>
          </form>

          <div style={{ textAlign: "center" }}>
            <Link
              href="/signup"
              style={{ color: "#888888", fontSize: "13px" }}
            >
              Don't have an account?{" "}
              <span style={{ color: "#F5A623" }}>Sign up</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
