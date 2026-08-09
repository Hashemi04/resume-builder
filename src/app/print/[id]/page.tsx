import { notFound } from "next/navigation";
import { ResumeDocument } from "@/components/ResumeDocument";
import { getPrintJob } from "@/lib/printStore";

export const dynamic = "force-dynamic";

/** Bare page consumed by headless Chrome when exporting a PDF. */
export default async function PrintPage({ params }: PageProps<"/print/[id]">) {
  const { id } = await params;
  const resume = getPrintJob(id);
  if (!resume) notFound();

  return (
    <>
      <style>{`html, body { background: #ffffff; margin: 0; padding: 0; }`}</style>
      <ResumeDocument resume={resume} />
    </>
  );
}
