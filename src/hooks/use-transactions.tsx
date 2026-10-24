import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';

export type TransactionType = 'receita' | 'despesa';

export interface Category {
  id: number;
  nome: string;
  tipo: TransactionType;
}

export interface NewTransaction {
  categoriaId: number;
  descricao: string;
  valorCentavos: number;
  tipo: TransactionType;
  data: string;
}

export interface Transaction extends NewTransaction {
  id: number;
  categoriaNome: string;
}

const INITIAL_CATEGORIES: Category[] = [
  { id: 1, nome: 'Salário', tipo: 'receita' },
  { id: 2, nome: 'Freelance', tipo: 'receita' },
  { id: 3, nome: 'Investimentos', tipo: 'receita' },
  { id: 4, nome: 'Outros', tipo: 'receita' },
  { id: 5, nome: 'Alimentação', tipo: 'despesa' },
  { id: 6, nome: 'Transporte', tipo: 'despesa' },
  { id: 7, nome: 'Moradia', tipo: 'despesa' },
  { id: 8, nome: 'Saúde', tipo: 'despesa' },
  { id: 9, nome: 'Educação', tipo: 'despesa' },
  { id: 10, nome: 'Lazer', tipo: 'despesa' },
  { id: 11, nome: 'Outros', tipo: 'despesa' },
];

interface TransactionsContextValue {
  categories: Category[];
  transactions: Transaction[];
  addTransaction: (transaction: NewTransaction) => void;
  updateTransaction: (id: number, transaction: NewTransaction) => void;
  deleteTransaction: (id: number) => void;
}

const TransactionsContext = createContext<TransactionsContextValue | null>(null);

export function TransactionsProvider({ children }: PropsWithChildren) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const nextId = useRef(1);

  const addTransaction = useCallback((transaction: NewTransaction) => {
    const category = INITIAL_CATEGORIES.find((item) => item.id === transaction.categoriaId);
    if (!category || category.tipo !== transaction.tipo) {
      throw new Error('Escolha uma categoria compatível com o tipo da movimentação.');
    }

    const id = nextId.current++;
    setTransactions((current) => [
      {
        ...transaction,
        id,
        categoriaNome: category.nome,
      },
      ...current,
    ]);
  }, []);

  const updateTransaction = useCallback((id: number, transaction: NewTransaction) => {
    const category = INITIAL_CATEGORIES.find((item) => item.id === transaction.categoriaId);
    if (!category || category.tipo !== transaction.tipo) {
      throw new Error('Escolha uma categoria compatível com o tipo da movimentação.');
    }

    setTransactions((current) =>
      current.map((item) =>
        item.id === id ? { ...transaction, id, categoriaNome: category.nome } : item
      )
    );
  }, []);

  const deleteTransaction = useCallback((id: number) => {
    setTransactions((current) => current.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      categories: INITIAL_CATEGORIES,
      transactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
    }),
    [transactions, addTransaction, updateTransaction, deleteTransaction]
  );

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
}

export function useTransactions(): TransactionsContextValue {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactions deve ser usado dentro de TransactionsProvider.');
  }
  return context;
}
