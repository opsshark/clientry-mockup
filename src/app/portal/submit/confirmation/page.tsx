import { Suspense } from "react";
import ConfirmationContent from "./ConfirmationContent";

export default function ConfirmationPage() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <Suspense
        fallback={
          <div className="text-center" style={{ color: "#64748b" }}>
            Loading...
          </div>
        }
      >
        <ConfirmationContent />
      </Suspense>
    </div>
  );
}
