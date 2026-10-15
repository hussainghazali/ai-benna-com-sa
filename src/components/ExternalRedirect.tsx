import { useEffect } from "react";
import BennaLoader from "@/components/BennaLoader";

/** Full-page redirect to another Benna app (store, chat, ...). */
const ExternalRedirect = ({ to }: { to: string }) => {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);
  return (
    <div className="flex min-h-screen items-center justify-center">
      <BennaLoader size="md" />
    </div>
  );
};

export default ExternalRedirect;
