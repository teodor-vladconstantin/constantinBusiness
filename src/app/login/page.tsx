import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Login", robots: { index: false, follow: false } };

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="container-site py-16 md:py-24">
      <p className="label mb-2">Admin</p>
      <h1 className="title mb-3">Login</h1>
      {error && (
        <p role="alert" className="mb-2">
          That link did not work. Request a new one.
        </p>
      )}
      <LoginForm />
    </div>
  );
}
