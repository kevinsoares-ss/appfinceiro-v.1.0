# Meu Dinheiro — versão 1

Aplicativo simples de controle financeiro pessoal, desenvolvido com Expo e React Native. Esta primeira versão foi planejada para registrar receitas e despesas, acompanhar o saldo e consultar os totais do mês sem banco de dados.

> **Importante:** os lançamentos ficam apenas na memória enquanto o app está aberto. Ao fechar, recarregar ou reiniciar o aplicativo, os dados são apagados. Isso é intencional nesta versão.

## Sumário

- [O que o app faz](#o-que-o-app-faz)
- [Como funciona](#como-funciona)
- [Regras dos lançamentos](#regras-dos-lançamentos)
- [Tecnologias](#tecnologias)
- [Requisitos](#requisitos)
- [Como instalar e executar](#como-instalar-e-executar)
- [Como validar o projeto](#como-validar-o-projeto)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Limitações desta versão](#limitações-desta-versão)

## O que o app faz

- Exibe uma animação de abertura com a identidade do Meu Dinheiro.
- Apresenta a tela **Início** com:
  - saldo geral, calculado com todas as receitas e despesas da sessão;
  - total de receitas e despesas do mês selecionado;
  - até cinco movimentações mais recentes daquele mês;
  - controles para navegar entre os meses.
- Permite adicionar receitas e despesas.
- Permite editar ou excluir uma das movimentações exibidas no Início.
- Atualiza os valores da tela imediatamente quando uma movimentação é criada, alterada ou excluída.
- Adapta cores ao tema claro ou escuro do dispositivo.

## Como funciona

1. Ao abrir o aplicativo, aparece a tela de abertura animada; em seguida, o app apresenta o Início.
2. Na tela **Início**, o saldo geral corresponde à soma de todas as receitas menos todas as despesas registradas na sessão atual.
3. Os cartões de receitas e despesas consideram somente o mês selecionado. Use as setas junto ao mês para navegar.
4. Toque no botão **+** para abrir **Nova movimentação**.
5. Preencha o tipo, o valor, a descrição, a categoria e a data e toque em **Salvar movimentação**.
6. Toque em uma movimentação recente para editá-la. A opção de exclusão solicita confirmação antes de remover o item.
7. Ao voltar ao Início, os valores e a lista já refletem a alteração.

Os dados são mantidos por um contexto React compartilhado entre as telas. Não são gravados em banco de dados, arquivo ou armazenamento local.

## Regras dos lançamentos

- **Tipo:** receita ou despesa. As categorias disponíveis dependem do tipo escolhido.
- **Categorias de receita:** Salário, Freelance, Investimentos e Outros.
- **Categorias de despesa:** Alimentação, Transporte, Moradia, Saúde, Educação, Lazer e Outros.
- **Valor:** o campo interpreta os dígitos digitados como centavos. Por exemplo, `2500` corresponde a **R$ 25,00**.
- **Descrição:** obrigatória.
- **Data:** obrigatória, no formato `AAAA-MM-DD` (ano-mês-dia). A validação confere se o dia existe no mês, incluindo anos bissextos.
- **Lista do Início:** mostra até cinco movimentações do mês selecionado, em ordem da mais recente para a mais antiga.
- **Exclusão:** requer confirmação e remove a movimentação da memória da sessão.

O saldo geral inclui todos os lançamentos da sessão, mesmo quando o mês selecionado no Início é outro.

## Tecnologias

- **Expo SDK 57**
- **React Native 0.86**
- **React 19**
- **TypeScript 6**
- **Expo Router** para as rotas e a navegação
- **React Context e estado React** para manter os lançamentos temporariamente em memória
- **React Native Animated** para a animação de abertura

## Requisitos

- Node.js e npm instalados.
- Para testar em um dispositivo: Expo Go ou um emulador configurado para Android/iOS.
- Para testar no navegador: um navegador compatível.

## Como instalar e executar

No terminal, entre na pasta do projeto e instale as dependências:

```bash
npm install
```

Inicie o servidor do Expo:

```bash
npx expo start
```

No terminal aberto pelo Expo, use:

- `a` para abrir no Android;
- `i` para abrir no iOS (é necessário um ambiente iOS compatível);
- `w` para abrir no navegador.

Também é possível iniciar diretamente cada plataforma:

```bash
npm run android
npm run ios
npm run web
```

## Como validar o projeto

Verificação de tipos TypeScript:

```bash
npx tsc --noEmit
```

Lint:

```bash
npx expo lint
```

Exportações de produção para verificar o bundle de cada plataforma:

```bash
npx expo export --platform web
npx expo export --platform android
```

As exportações criam a pasta `dist/`, que contém arquivos gerados e não precisa ser editada manualmente.

## Estrutura do projeto

```text
src/
├── app/
│   ├── _layout.tsx             # Layout, contexto das movimentações e abertura animada
│   ├── index.tsx               # Tela Início, saldo, totais e lista recente
│   └── new-transaction.tsx     # Rota do formulário de movimentação
├── components/
│   ├── app-tabs.tsx            # Navegação principal
│   ├── month-selector.tsx      # Seletor do mês exibido
│   ├── startup-splash.tsx      # Animação de abertura
│   ├── themed-text.tsx         # Texto adaptado ao tema do app
│   ├── transaction-form.tsx    # Cadastro, edição e exclusão
│   └── transaction-row.tsx     # Linha de uma movimentação
├── hooks/
│   ├── use-color-scheme.ts     # Leitura do tema do dispositivo
│   ├── use-color-scheme.web.ts # Leitura do tema na web
│   ├── use-theme.ts            # Cores usadas pelas telas
│   └── use-transactions.tsx    # Categorias e movimentações em memória
└── utils/
    └── finance.ts              # Formatação de valores e datas

app.json                         # Configuração do Expo e da tela nativa de abertura
DOCUMENTACAO_MEUDINHEIRO.md      # Documentação adicional do fluxo
especifica_o_do_projeto.md       # Especificação geral do projeto
package.json                     # Dependências e comandos npm
```

### Onde alterar cada parte

- Para mudar o resumo ou a lista do Início, edite `src/app/index.tsx`.
- Para alterar campos, validações ou ações do formulário, edite `src/components/transaction-form.tsx`.
- Para mudar categorias ou a lógica temporária de cadastro, edição e exclusão, edite `src/hooks/use-transactions.tsx`.
- Para ajustar a animação, edite `src/components/startup-splash.tsx`.
- Para alterar cores e formatação financeira, consulte `src/constants/theme.ts` e `src/utils/finance.ts`.

## Limitações desta versão

- Não há banco de dados nem persistência dos lançamentos: fechar ou recarregar o app apaga os dados.
- Não há login, sincronização entre dispositivos, contas bancárias ou conexão com serviços externos.
- As categorias são fixas no código; não existe cadastro de categorias personalizadas.
- O Início mostra somente até cinco movimentações do mês selecionado; não há telas de Histórico ou Relatórios nesta versão.

Para uma descrição complementar do fluxo e das regras, consulte [DOCUMENTACAO_MEUDINHEIRO.md](./DOCUMENTACAO_MEUDINHEIRO.md). A especificação geral do projeto está em [especifica_o_do_projeto.md](./especifica_o_do_projeto.md).
