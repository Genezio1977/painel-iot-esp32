import { useEffect, useState } from 'react';

/** useState que também salva o valor no localStorage do navegador. */
export function useLocalStorage<T>(chave: string, valorInicial: T) {
  const [valor, setValor] = useState<T>(() => {
    try {
      const salvo = localStorage.getItem(chave);
      return salvo ? (JSON.parse(salvo) as T) : valorInicial;
    } catch {
      return valorInicial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
    } catch {
      // Navegador sem permissão de armazenamento: segue só em memória.
    }
  }, [chave, valor]);

  return [valor, setValor] as const;
}
