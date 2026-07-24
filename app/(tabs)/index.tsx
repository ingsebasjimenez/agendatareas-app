import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { loadTasks, saveTasks } from '../../taskStorage';
import { colors, priorityColors, priorityLabels, spacing, radius } from '../../theme';

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export default function Index() {
  const [tasks, setTasks] = useState([]);
  const [inputText, setInputText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPriority, setModalPriority] = useState('media');
  const [modalDate, setModalDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const stored = await loadTasks();
        setTasks(stored);
      })();
    }, [])
  );

  const openModal = () => {
    if (inputText.trim() === '') return;
    setModalPriority('media');
    setModalDate(null);
    setModalVisible(true);
  };

  const confirmAddTask = () => {
    const newTask = {
      id: Date.now().toString(),
      text: inputText.trim(),
      completed: false,
      priority: modalPriority,
      dueDate: modalDate ? modalDate.toISOString() : null,
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setInputText('');
    setModalVisible(false);
  };

  const toggleTask = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const deleteTask = (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const onChangeDate = (event, selected) => {
    setShowPicker(Platform.OS === 'ios');
    if (selected) setModalDate(selected);
  };

  const formatShort = (isoString) => {
    const d = new Date(isoString);
    return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}`;
  };

  const today = new Date();
  const todayLabel = `${DIAS[today.getDay()]}, ${today.getDate()} de ${MESES[today.getMonth()]}`;

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? completedCount / tasks.length : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.eyebrow}>{todayLabel}</Text>
        <Text style={styles.title}>Tus tareas</Text>

        {tasks.length > 0 && (
          <View style={styles.progressBlock}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressLabel}>
              {completedCount} de {tasks.length} completadas
            </Text>
          </View>
        )}
      </View>

      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="¿Qué necesitas hacer?"
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={openModal}
        />
        <TouchableOpacity
          style={[styles.addButton, !inputText.trim() && styles.addButtonDisabled]}
          onPress={openModal}
          disabled={!inputText.trim()}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <TouchableOpacity
              style={styles.taskLeft}
              onPress={() => toggleTask(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
                {item.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.taskText, item.completed && styles.taskTextCompleted]}>
                  {item.text}
                </Text>
                <View style={styles.taskMetaRow}>
                  <View
                    style={[styles.priorityBadge, { backgroundColor: priorityColors[item.priority] }]}
                  >
                    <Text style={styles.priorityBadgeText}>
                      {priorityLabels[item.priority]?.toUpperCase()}
                    </Text>
                  </View>
                  {item.dueDate && (
                    <View style={styles.dateBadge}>
                      <Ionicons name="calendar-outline" size={11} color={colors.textSecondary} />
                      <Text style={styles.dateBadgeText}>{formatShort(item.dueDate)}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTask(item.id)} hitSlop={10}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle-outline" size={40} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No tienes tareas todavía</Text>
            <Text style={styles.emptySubtext}>Agrega la primera arriba</Text>
          </View>
        }
      />

      {/* Modal para elegir prioridad y fecha */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Detalles de la tarea</Text>
            <Text style={styles.modalTaskPreview}>"{inputText}"</Text>

            <Text style={styles.sectionLabel}>¿Qué tan importante es?</Text>
            <View style={styles.priorityRow}>
              {Object.entries(priorityLabels).map(([key, label]) => {
                const isSelected = modalPriority === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.priorityOption,
                      { borderColor: priorityColors[key] },
                      isSelected && { backgroundColor: priorityColors[key] },
                    ]}
                    onPress={() => setModalPriority(key)}
                  >
                    <Text
                      style={[
                        styles.priorityOptionText,
                        isSelected && styles.priorityOptionTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionLabel}>¿Para cuándo?</Text>
            <View style={styles.dateSelector}>
              <Ionicons name="calendar-outline" size={16} color={colors.textPrimary} />
              <DateTimePicker
                value={modalDate || new Date()}
                mode="date"
                display="compact"
                themeVariant="dark"
                accentColor={colors.primary}
                onChange={onChangeDate}
                style={{ flex: 1 }}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={confirmAddTask}>
                <Text style={styles.modalConfirmText}>Agregar tarea</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  eyebrow: { color: colors.textSecondary, fontSize: 13, textTransform: 'capitalize', marginBottom: 2 },
  title: { fontSize: 30, fontWeight: '700', color: colors.textPrimary },
  progressBlock: { marginTop: spacing.md },
  progressTrack: { height: 6, backgroundColor: colors.surfaceAlt, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  progressLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 6 },

  inputCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.md,
    fontSize: 15,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  addButtonDisabled: { opacity: 0.35 },

  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: 10,
    padding: spacing.md,
  },
  taskLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary },
  taskText: { color: colors.textPrimary, fontSize: 15, flexShrink: 1, marginBottom: 6 },
  taskTextCompleted: { textDecorationLine: 'line-through', color: colors.textSecondary },
  taskMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priorityBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  priorityBadgeText: { color: '#10121A', fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateBadgeText: { color: colors.textSecondary, fontSize: 12 },

  emptyState: { alignItems: 'center', marginTop: 60, gap: 6 },
  emptyText: { color: colors.textPrimary, fontSize: 15, marginTop: 8 },
  emptySubtext: { color: colors.textSecondary, fontSize: 13 },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalTitle: { color: colors.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 4 },
  modalTaskPreview: { color: colors.textSecondary, fontSize: 14, marginBottom: spacing.lg },
  sectionLabel: { color: colors.textSecondary, fontSize: 13, marginBottom: 10, marginTop: 4 },
  priorityRow: { flexDirection: 'row', gap: 10, marginBottom: spacing.md },
  priorityOption: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  priorityOptionText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  priorityOptionTextSelected: { color: '#10121A' },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: spacing.lg,
  },
  dateSelectorText: { color: colors.textPrimary, fontSize: 14 },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCancelText: { color: colors.textSecondary, fontWeight: '600' },
  modalConfirm: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  modalConfirmText: { color: '#fff', fontWeight: '700' },
});