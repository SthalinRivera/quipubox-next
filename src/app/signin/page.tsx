import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login - Quipubox",
    description: "Login to your Quipubox account",
};

export default function SignIn() {
    return <SignInForm />;
}