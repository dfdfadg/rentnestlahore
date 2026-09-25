"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setEnquiryStatus } from "@/app/actions/account";

export function EnquiryStatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <select
      aria-label="Enquiry status"
      defaultValue={status}
      disabled={pending}
      className="input min-h-9 w-auto py-1 text-xs"
      onChange={(e) =>
        start(async () => {
          await setEnquiryStatus(id, e.target.value as "NEW" | "CONTACTED" | "CLOSED" | "SPAM");
          router.refresh();
        })
      }
    >
      <option value="NEW">New</option>
      <option value="CONTACTED">Contacted</option>
      <option value="CLOSED">Closed</option>
      <option value="SPAM">Spam</option>
    </select>
  );
}
