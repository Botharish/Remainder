import { redirect } from "next/navigation";

// With Google-only auth, sign-up and sign-in are the same flow.
export default function SignupPage() {
  redirect("/login");
}
