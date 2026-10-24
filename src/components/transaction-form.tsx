import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { NewTransaction, TransactionType } from '@/hooks/use-transactions';
import { useTransactions } from '@/hooks/use-transactions';
import { formatCurrencyInput, getTodayDate } from '@/utils/finance';

const INCOME = '#16834A';
const EXPENSE = '#C0393B';

// Valida formato AAAA-MM-DD e anos bissextos
function isValidDate(date: string): boolean {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!parts) return false;

  const year = Number(parts[1]);
  const month = Number(parts[2]);
  const day = Number(parts[3]);

  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1];
}

export function TransactionForm() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const parsedId = Array.isArray(id) ? id[0] : id;

  return <TransactionFormFields key={parsedId ?? 'new'} id={parsedId} />;
}

function TransactionFormFields({ id }: { id?: string }) {
  const editing = Boolean(id);
  const theme = useTheme();
  const { categories, transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  
  const transactionId = id ? Number(id) : null;
  const existingTransaction = transactionId ? transactions.find((t) => t.id === transactionId) : undefined;

  const [tipo, setTipo] = useState<TransactionType>(existingTransaction?.tipo ?? 'despesa');
  const [valor, setValor] = useState(existingTransaction ? String(existingTransaction.valorCentavos) : '');
  const [descricao, setDescricao] = useState(existingTransaction?.descricao ?? '');
  const [categoriaId, setCategoriaId] = useState<number | null>(existingTransaction?.categoriaId ?? null);
  const [data, setData] = useState(existingTransaction?.data ?? getTodayDate());
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.tipo === tipo),
    [categories, tipo]
  );

  function saveTransaction() {
    setError(null);
    if (editing && !existingTransaction) {
      setError('Movimentação não encontrada nesta sessão.');
      return;
    }

    const valorCentavos = Number(valor);
    if (!descricao.trim()) return setError('Informe uma descrição.');
    if (!Number.isSafeInteger(valorCentavos) || valorCentavos <= 0) return setError('Informe um valor maior que zero.');
    if (!isValidDate(data)) return setError('Informe uma data válida no formato AAAA-MM-DD.');
    if (!categoriaId) return setError('Escolha uma categoria.');

    const transaction: NewTransaction = {
      categoriaId,
      descricao: descricao.trim(),
      valorCentavos,
      tipo,
      data,
    };

    try {
      if (transactionId) {
        updateTransaction(transactionId, transaction);
      } else {
        addTransaction(transaction);
      }
      router.back();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar a movimentação.');
    }
  }

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected, color: theme.text },
  ];

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Pressable accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.back}>
            <ThemedText style={styles.backText}>‹</ThemedText>
          </Pressable>
          <ThemedText type="subtitle" style={styles.title}>
            {editing ? 'Editar movimentação' : 'Nova movimentação'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Preencha os dados para registrar no seu controle financeiro.
          </ThemedText>
        </View>

        {/* Tipo (Receita / Despesa) */}
        <View style={styles.section}>
          <ThemedText type="smallBold">Tipo</ThemedText>
          <View style={[styles.toggle, { backgroundColor: theme.backgroundElement }]}>
            {(['despesa', 'receita'] as const).map((option) => {
              const selected = tipo === option;
              const color = option === 'receita' ? INCOME : EXPENSE;
              return (
                <Pressable
                  key={option}
                  onPress={() => { setTipo(option); setCategoriaId(null); }}
                  style={[styles.toggleOption, selected && { backgroundColor: theme.background, borderColor: color }]}
                >
                  <ThemedText style={{ color: selected ? color : theme.textSecondary, fontWeight: '700' }}>
                    {option === 'receita' ? 'Receita' : 'Despesa'}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Valor */}
        <View style={styles.section}>
          <ThemedText type="smallBold">Valor</ThemedText>
          <TextInput
            keyboardType="number-pad"
            onChangeText={(text) => setValor(text.replace(/\D/g, '').slice(0, 12))}
            placeholder="R$ 0,00"
            placeholderTextColor={theme.textSecondary}
            style={[inputStyle, styles.amountInput]}
            value={formatCurrencyInput(valor)}
          />
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <ThemedText type="smallBold">Descrição</ThemedText>
          <TextInput
            onChangeText={setDescricao}
            placeholder="Ex.: Supermercado"
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
            value={descricao}
            maxLength={120}
          />
        </View>

        {/* Categoria */}
        <View style={styles.section}>
          <ThemedText type="smallBold">Categoria</ThemedText>
          <View style={styles.chips}>
            {filteredCategories.map((cat) => {
              const selected = categoriaId === cat.id;
              const color = tipo === 'receita' ? INCOME : EXPENSE;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setCategoriaId(cat.id)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: selected ? `${color}1A` : theme.backgroundElement,
                      borderColor: selected ? color : theme.backgroundSelected,
                    },
                  ]}
                >
                  <ThemedText type="small">{cat.nome}</ThemedText>
                </Pressable>
              );
            })}
          </View>
          {filteredCategories.length === 0 && (
            <ThemedText type="small" themeColor="textSecondary">Nenhuma categoria disponível.</ThemedText>
          )}
        </View>

        {/* Data */}
        <View style={styles.section}>
          <ThemedText type="smallBold">Data</ThemedText>
          <TextInput
            onChangeText={setData}
            placeholder="AAAA-MM-DD"
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
            value={data}
            maxLength={10}
          />
        </View>

        {/* Mensagem de Erro */}
        {error && <ThemedText accessibilityRole="alert" style={styles.error}>{error}</ThemedText>}

        {/* Botão Salvar */}
        <Pressable onPress={saveTransaction} style={[styles.primaryButton, { backgroundColor: tipo === 'receita' ? INCOME : EXPENSE }]}>
          <ThemedText style={styles.primaryButtonText}>Salvar movimentação</ThemedText>
        </Pressable>

        {/* Botão Excluir */}
        {editing && existingTransaction && (
          <Pressable onPress={() => setConfirmDelete(true)} style={styles.deleteButton}>
            <ThemedText style={styles.deleteText}>Excluir movimentação</ThemedText>
          </Pressable>
        )}
      </ScrollView>

      {/* Modal de Confirmação de Exclusão */}
      <Modal animationType="fade" onRequestClose={() => setConfirmDelete(false)} transparent visible={confirmDelete}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.background }]}>
            <ThemedText type="smallBold">Excluir movimentação?</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">Esta ação não pode ser desfeita.</ThemedText>
            <View style={styles.modalActions}>
              <Pressable onPress={() => setConfirmDelete(false)} style={styles.modalButton}>
                <ThemedText type="smallBold">Cancelar</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (transactionId) deleteTransaction(transactionId);
                  setConfirmDelete(false);
                  router.back();
                }}
                style={[styles.modalButton, styles.confirmButton]}
              >
                <ThemedText style={styles.primaryButtonText}>Excluir</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { width: '100%', maxWidth: 680, alignSelf: 'center', padding: 20, paddingBottom: 40, gap: 22 },
  header: { gap: 10 },
  back: { width: 40, height: 36, justifyContent: 'center' },
  backText: { fontSize: 30, lineHeight: 34 },
  title: { fontSize: 28, lineHeight: 34 },
  section: { gap: 10 },
  toggle: { flexDirection: 'row', borderRadius: 14, padding: 4 },
  toggleOption: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 11, borderWidth: 1, borderColor: 'transparent' },
  input: { minHeight: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, fontSize: 16 },
  amountInput: { minHeight: 72, fontSize: 32, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
  error: { color: '#C0393B', fontWeight: '600' },
  primaryButton: { minHeight: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  deleteButton: { alignItems: 'center', padding: 12 },
  deleteText: { color: '#C0393B', fontWeight: '700' },
  modalBackdrop: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.45)' },
  modalCard: { width: '100%', maxWidth: 400, borderRadius: 20, padding: 22, gap: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  modalButton: { paddingHorizontal: 16, paddingVertical: 11, borderRadius: 12 },
  confirmButton: { backgroundColor: '#C0393B' },
});