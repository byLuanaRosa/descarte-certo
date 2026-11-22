"use client";

import { useEffect, useState } from "react";
import { listarPontosAprovados, type Ponto } from "@/lib/pontos";
import { supabaseConfigurado } from "@/lib/supabase";

type Estado =
  | { situacao: "carregando" }
  | { situacao: "erro"; mensagem: string }
  | { situacao: "pronto"; pontos: Ponto[] };

/** Busca os pontos aprovados no navegador, para que um ponto recém-aprovado apareça sem novo deploy. */
export function usePontos(): Estado {
  const [estado, setEstado] = useState<Estado>(() =>
    supabaseConfigurado()
      ? { situacao: "carregando" }
      : { situacao: "erro", mensagem: "O banco de dados não está configurado neste ambiente." },
  );

  useEffect(() => {
    if (!supabaseConfigurado()) return;
    let ativo = true;
    listarPontosAprovados()
      .then((pontos) => ativo && setEstado({ situacao: "pronto", pontos }))
      .catch(() =>
        ativo &&
        setEstado({
          situacao: "erro",
          mensagem: "Não foi possível carregar os pontos agora. Tente de novo em alguns minutos.",
        }),
      );
    return () => {
      ativo = false;
    };
  }, []);

  return estado;
}
