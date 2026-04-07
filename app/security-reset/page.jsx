import { Suspense } from "react";
import SecurityResetClient from "@/components/SecurityResetClient";

export default function SecurityResetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SecurityResetClient />
    </Suspense>
  );
}
