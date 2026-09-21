import type { Metadata } from "next";
import OriginalWorkshop from "../../components/original-workshop";
export const metadata: Metadata = {
  title: "Original Discovery Workshop | OpenAI × Adobe × Code and Theory",
  description:
    "The preserved discovery workshop, with its original scoring, architecture and saved sessions.",
};
export default function OriginalPage() {
  return (
    <>
      <div
        style={{
          padding: "12px 34px",
          borderBottom: "1px solid #d9d6cf",
          fontSize: 13,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Original discovery workshop</span>
        <a href="/">Return to agent workspace →</a>
      </div>
      <OriginalWorkshop />
    </>
  );
}
