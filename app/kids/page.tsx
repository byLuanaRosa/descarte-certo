import type { Metadata } from "next";
import { QuizKids } from "@/components/QuizKids";
import { perguntasQuiz } from "@/lib/conteudo";

export const metadata: Metadata = {
  title: "Descarte Certo Kids",
  description: "Quiz para crianças aprenderem a separar o lixo e cuidar do planeta.",
};

export default function KidsPage() {
  return (
    <div className="-mx-4 -my-6 space-y-6 bg-kids px-4 py-8">
      <header className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <span aria-hidden className="text-8xl">
          🌍
        </span>
        <div>
          <h1 className="text-5xl font-extrabold text-primary-deep">
            Descarte Certo <span className="text-[#8a4b0f] dark:text-[#f3c48b]">Kids</span>
          </h1>
          <p className="mt-2 text-xl">Aprenda brincando a cuidar do planeta!</p>
        </div>
      </header>

      <div
        role="note"
        className="mx-auto flex max-w-4xl gap-3 rounded-[var(--radius-card)] bg-danger-soft p-5 text-lg font-bold"
      >
        <span aria-hidden>⚠️</span>
        <p>
          Se encontrar algo perigoso, como agulhas, vidro quebrado, remédios ou produtos químicos:{" "}
          <span className="text-danger">NÃO TOQUE, NÃO RECOLHA e CHAME UM ADULTO!</span>
        </p>
      </div>

      <div className="mx-auto max-w-4xl">
        <QuizKids perguntas={perguntasQuiz} />
      </div>
    </div>
  );
}
