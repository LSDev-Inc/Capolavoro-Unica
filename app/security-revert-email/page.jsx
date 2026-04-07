import { Suspense } from "react";
import SecurityRevertEmailClient from "@/components/SecurityRevertEmailClient";

export default function SecurityRevertEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SecurityRevertEmailClient />
    </Suspense>
  );
}
