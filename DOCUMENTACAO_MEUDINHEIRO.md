# Documentação do Meu Dinheiro — versão 1

## Escopo

A versão 1 tem somente o **Início** e o formulário de **Nova movimentação**. É possível registrar receitas e despesas, ver o saldo e os totais do mês, e editar ou excluir um dos cinco lançamentos mais recentes.

**Os lançamentos ficam somente na memória.** Ao fechar, recarregar ou reiniciar o aplicativo, todos os lançamentos são apagados. Não há SQLite, armazenamento local, sincronização ou servidor.

## Como executar

```bash
npm install
npx expo start
```

Use `a` para Android, `i` para iOS ou `w` para navegador.

## Fluxo principal

1. `src/app/_layout.tsx` envolve as telas com `TransactionsProvider` para compartilhar lançamentos enquanto o aplicativo está aberto e exibe a animação de abertura.
2. `src/app/index.tsx` calcula o saldo geral, os totais do mês selecionado e mostra até cinco lançamentos recentes.
3. O botão **+** abre `src/app/new-transaction.tsx`, que exibe `src/components/transaction-form.tsx`.
4. `src/hooks/use-transactions.tsx` mantém lançamentos e categorias no estado React em memória. Criar, editar e excluir atualiza esse estado, sem gravar em arquivos ou bancos.
5. `src/components/transaction-row.tsx` exibe cada lançamento. Selecioná-lo abre o formulário para edição.

## Regras do formulário

- Tipo: receita ou despesa. As categorias exibidas correspondem ao tipo selecionado.
- Valor: digitado em centavos inteiros; por exemplo, `2500` corresponde a R$ 25,00.
- Descrição: obrigatória.
- Data: obrigatória no formato `AAAA-MM-DD`, com validação dos dias do mês e anos bissextos.
- Exclusão: requer confirmação antes de remover o lançamento da memória.

As categorias são fixas no código. Não existe cadastro de categorias personalizadas nesta versão.

## Arquivos importantes

```text
src/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   └── new-transaction.tsx
├── components/
│   ├── app-tabs.tsx
│   ├── month-selector.tsx
│   ├── startup-splash.tsx
│   ├── themed-text.tsx
│   ├── transaction-form.tsx
│   └── transaction-row.tsx
├── hooks/
│   ├── use-color-scheme.ts
│   ├── use-color-scheme.web.ts
│   ├── use-theme.ts
│   └── use-transactions.tsx
└── utils/
    └── finance.ts
```

O Histórico, os Relatórios e os arquivos de banco de dados foram removidos. A especificação geral, incluindo possíveis requisitos de versões futuras, está em `especifica_o_do_projeto.md`.

## Validação

- `npx tsc --noEmit`: passou.
- `npx expo lint`: passou.
- `npx expo export --platform web`: passou.
- `npx expo export --platform android`: passou.

Os lançamentos não são recuperáveis depois que a sessão do app termina; essa perda é intencional nesta versão.
