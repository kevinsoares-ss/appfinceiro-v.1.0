import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MonthSelector } from '@/components/month-selector';
import { ThemedText } from '@/components/themed-text';
import { TransactionRow } from '@/components/transaction-row';
import { useTheme } from '@/hooks/use-theme';
import { useTransactions } from '@/hooks/use-transactions';
import { formatCurrency, getCurrentMonthAndYear } from '@/utils/finance';

const INCOME = '#16834A';
const EXPENSE = '#C0393B';

export default function HomeScreen() {
  const theme = useTheme();
  const { transactions } = useTransactions();
  const [period, setPeriod] = useState(getCurrentMonthAndYear);

  // Os totais são calculados diretamente dos lançamentos em memória, sem consultar um banco.
  const balance = transactions.reduce(
    (total, transaction) =>
      total + (transaction.tipo === 'receita' ? transaction.valorCentavos : -transaction.valorCentavos),
    0
  );

  const monthlyTransactions = useMemo(
    () =>
      transactions
        .filter((transaction) => {
          const [year, month] = transaction.data.split('-').map(Number);
          return year === period.ano && month === period.mes;
        })
        .sort((left, right) => right.data.localeCompare(left.data) || right.id - left.id),
    [transactions, period]
  );

  const summary = monthlyTransactions.reduce(
    (totals, transaction) => {
      if (transaction.tipo === 'receita') {
        totals.receitasCentavos += transaction.valorCentavos;
      } else {
        totals.despesasCentavos += transaction.valorCentavos;
      }
      return totals;
    },
    { receitasCentavos: 0, despesasCentavos: 0 }
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <ThemedText type="small" themeColor="textSecondary">Bem-vindo de volta</ThemedText>
            <ThemedText type="subtitle" style={styles.heading}>Meu Dinheiro</ThemedText>
          </View>

          <MonthSelector
            mes={period.mes}
            ano={period.ano}
            onChange={(mes, ano) => setPeriod({ mes, ano })}
          />
        </View>

 {/* {formatCurrency(balance)} Ela transforma números puros em um formato amigável de dinheiro . balance que armazena o saldo total calculado em centavos através da função reduce */}
        <View style={[styles.balanceCard, { backgroundColor: '#253A70' }]}>
          <ThemedText style={styles.cardLabel}>Saldo geral</ThemedText>
          <ThemedText style={styles.balanceValue}>{formatCurrency(balance)}</ThemedText>
          <ThemedText style={styles.cardFootnote}>Receitas menos despesas desta sessão</ThemedText>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="small" themeColor="textSecondary">Receitas do mês</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: INCOME }]}>
              + {formatCurrency(summary.receitasCentavos)}
            </ThemedText>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="small" themeColor="textSecondary">Despesas do mês</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: EXPENSE }]}>
              − {formatCurrency(summary.despesasCentavos)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>Últimas movimentações</ThemedText>
        </View>


 {/*O código olha se a lista monthlyTransactions (as transações filtradas do mês) tem itens (.length é maior que 0).*/}
 {/*monthlyTransactions.slice(0, 5): Pega apenas os 5 primeiros itens da lista (garantindo que, mesmo se o mês tiver 50 lançamentos, a tela inicial mostre apenas os 5 mais recentes). */}
        <View style={[styles.transactionsCard, { backgroundColor: theme.backgroundElement }]}>
          {monthlyTransactions.length ? (
            monthlyTransactions.slice(0, 5).map((transaction) => (
              <TransactionRow
                key={transaction.id}  
                transaction={transaction}
                onPress={() =>
                  router.push({ pathname: '/new-transaction', params: { id: String(transaction.id) } }) 
                }
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <ThemedText type="smallBold">Nenhuma movimentação neste mês</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Use o botão + para adicionar sua primeira.
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>

      <Pressable
        accessibilityLabel="Adicionar movimentação"
        accessibilityRole="button"
        onPress={() => router.push('/new-transaction')}
        style={styles.fab}
      >
        <ThemedText style={styles.fabText}>+</ThemedText>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 20, gap: 20, paddingBottom: 110 },
  header: { gap: 16 },
  heading: { fontSize: 28, lineHeight: 34 },
  balanceCard: { minHeight: 158, borderRadius: 24, padding: 22, justifyContent: 'center', gap: 9 },
  cardLabel: { color: '#D8E1FF', fontSize: 14, fontWeight: '600' },
  balanceValue: { color: '#FFFFFF', fontSize: 34, lineHeight: 42, fontWeight: '800' },
  cardFootnote: { color: '#D8E1FF', fontSize: 12 },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: { flex: 1, minHeight: 94, justifyContent: 'center', padding: 14, gap: 8, borderRadius: 18 },
  summaryValue: { fontSize: 16, lineHeight: 21, fontWeight: '800' },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  sectionTitle: { fontSize: 18 },
  transactionsCard: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 30, gap: 6 },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 22,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4169C1',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { fontSize: 34, lineHeight: 40, fontWeight: '400', color: '#FFFFFF' },
});
