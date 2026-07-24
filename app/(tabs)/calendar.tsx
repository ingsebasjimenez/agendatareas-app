import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { loadTasks } from '../../taskStorage';
import { colors, priorityColors, priorityLabels, spacing, radius } from '../../theme';

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Si un día tiene varias tareas, se pinta con el color de la más urgente
const PRIORITY_RANK = { alta: 3, media: 2, baja: 1 };

export default function CalendarScreen() {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const stored = await loadTasks();
        setTasks(stored);
      })();
    }, [])
  );

  // Color dominante por día (la prioridad más alta presente ese día)
  const dayColors = {};
  tasks.forEach((task) => {
    if (!task.dueDate) return;
    const dateKey = task.dueDate.split('T')[0];
    const currentRank = PRIORITY_RANK[task.priority] || 0;
    const existingRank = dayColors[dateKey]?.rank || 0;
    if (currentRank >= existingRank) {
      dayColors[dateKey] = { rank: currentRank, color: priorityColors[task.priority] };
    }
  });

  const markedDates = {};
  Object.entries(dayColors).forEach(([dateKey, { color }]) => {
    markedDates[dateKey] = {
      customStyles: {
        container: { backgroundColor: color, borderRadius: 8 },
        text: { color: '#10121A', fontWeight: '700' },
      },
    };
  });

  markedDates[selectedDate] = {
    ...(markedDates[selectedDate] || {}),
    customStyles: {
      container: {
        backgroundColor: markedDates[selectedDate]?.customStyles?.container?.backgroundColor || colors.primary,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#fff',
      },
      text: {
        color: markedDates[selectedDate]?.customStyles?.container?.backgroundColor ? '#10121A' : '#fff',
        fontWeight: '700',
      },
    },
  };

  // Todas las tareas pendientes con fecha, ordenadas cronológicamente
  const pendingSorted = tasks
    .filter((t) => t.dueDate && !t.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const formatDay = (isoString) => {
    const d = new Date(isoString);
    return { day: d.getDate(), month: MESES_CORTOS[d.getMonth()] };
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Vista mensual</Text>
        <Text style={styles.title}>Calendario</Text>
      </View>

      <View style={styles.calendarCard}>
        <Calendar
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markingType="custom"
          markedDates={markedDates}
          theme={{
            backgroundColor: colors.surface,
            calendarBackground: colors.surface,
            textSectionTitleColor: colors.textSecondary,
            dayTextColor: '#FFFFFF',
            textDisabledColor: '#3A3E4A',
            todayTextColor: colors.primary,
            monthTextColor: '#FFFFFF',
            textMonthFontWeight: '700',
            textMonthFontSize: 16,
            arrowColor: colors.primary,
          }}
        />

        <View style={styles.legend}>
          {Object.entries(priorityLabels).map(([key, label]) => (
            <View key={key} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: priorityColors[key] }]} />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Pendientes por fecha</Text>
        {pendingSorted.length > 0 && (
          <Text style={styles.listCount}>{pendingSorted.length}</Text>
        )}
      </View>

      <FlatList
        data={pendingSorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 20 }}
        renderItem={({ item }) => {
          const { day, month } = formatDay(item.dueDate);
          return (
            <View style={styles.taskItem}>
              <View style={styles.dateBlock}>
                <Text style={styles.dateDay}>{day}</Text>
                <Text style={styles.dateMonth}>{month}</Text>
              </View>
              <View style={styles.taskInfo}>
                <Text style={styles.taskText}>{item.text}</Text>
                <View
                  style={[styles.priorityBadge, { backgroundColor: priorityColors[item.priority] }]}
                >
                  <Text style={styles.priorityBadgeText}>
                    {priorityLabels[item.priority]?.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle-outline" size={32} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No tienes pendientes con fecha</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  eyebrow: { color: colors.textSecondary, fontSize: 13, marginBottom: 2 },
  title: { fontSize: 30, fontWeight: '700', color: colors.textPrimary },
  calendarCard: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, paddingTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: colors.textSecondary, fontSize: 12 },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  listTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  listCount: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    backgroundColor: colors.primary + '22',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: 10,
    padding: spacing.md,
  },
  dateBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    width: 44,
    height: 44,
    marginRight: spacing.md,
  },
  dateDay: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', lineHeight: 18 },
  dateMonth: { color: colors.textSecondary, fontSize: 10, textTransform: 'uppercase' },
  taskInfo: { flex: 1, gap: 6 },
  taskText: { color: colors.textPrimary, fontSize: 15 },
  priorityBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  priorityBadgeText: { color: '#10121A', fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },

  emptyState: { alignItems: 'center', marginTop: 40, gap: 8 },
  emptyText: { color: colors.textSecondary, fontSize: 14 },
});