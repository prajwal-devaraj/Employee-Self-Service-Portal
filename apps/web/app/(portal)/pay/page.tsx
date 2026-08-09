"use client";

import { BadgeDollarSign, Download, ReceiptText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState, PageHeader, Skeleton } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import type { Payslip } from "@/lib/types";
import { money } from "@/lib/utils";

export default function PayPage() {
  const payslips = useQuery({
    queryKey: ["payslips"],
    queryFn: () => apiFetch<Payslip[]>("/payroll/payslips"),
  });

  const latest = payslips.data?.[0];

  return (
    <>
      <PageHeader
        eyebrow="Compensation"
        title="Pay"
        description="A private view of your published payslips and take-home pay."
      />

      {latest && (
        <div className="mb-6 rounded-[22px] border border-[#dddfff] bg-gradient-to-br from-[#f2f2ff] to-white p-6 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#7777c8]">Latest net pay · {latest.period}</div>
              <div className="mt-2 text-4xl font-extrabold tracking-[-0.04em]">{money(latest.net_pay, latest.currency)}</div>
              <div className="mt-2 text-sm text-[#717688]">
                Gross {money(latest.gross_pay, latest.currency)} · Deductions {money(latest.deductions, latest.currency)}
              </div>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-[20px] bg-white text-[#5b5bd6] shadow-sm">
              <BadgeDollarSign size={25} />
            </div>
          </div>
        </div>
      )}

      {payslips.isLoading ? (
        <Skeleton className="h-64" />
      ) : !payslips.data?.length ? (
        <EmptyState title="No payslips published" description="Published payroll periods will appear here." />
      ) : (
        <div className="card overflow-hidden">
          <div className="border-b border-[#eceef2] px-5 py-4">
            <h2 className="font-extrabold">Payslip history</h2>
          </div>
          <div className="divide-y divide-[#eef0f3]">
            {payslips.data.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f3f4f7] text-[#6c7180]">
                  <ReceiptText size={18} />
                </div>
                <div className="flex-1">
                  <div className="font-extrabold">{item.period}</div>
                  <div className="mt-1 text-xs text-[#898e9a]">Net pay {money(item.net_pay, item.currency)}</div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-bold">{money(item.gross_pay, item.currency)}</div>
                  <div className="text-xs text-[#969aa5]">Gross</div>
                </div>
                {item.document_url ? (
                  <a className="btn-secondary" href={item.document_url} target="_blank" rel="noreferrer">
                    <Download size={15} /> Download
                  </a>
                ) : (
                  <span className="rounded-xl bg-[#f5f6f8] px-3 py-2 text-xs font-bold text-[#8b909b]">PDF not attached</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
