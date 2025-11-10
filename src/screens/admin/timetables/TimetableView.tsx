import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  Text,
  ActivityIndicator,
  Card,
  Surface,
  Chip,
  Appbar,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { apiService } from "../../../api/apiService";

type Props = {
  id: string;
  onClose?: () => void;
};

const formatTime = (hour: number | string, minute: number | string) => {
  const h = Number(hour || 0);
  const m = Number(minute || 0);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const TimetableView: React.FC<Props> = ({ id }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const navigation: any = useNavigation();

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const resp = await apiService.api.get(`api/timetable/getById?id=${id}`);
        if (!mounted) return;
        setData(
          resp.data || resp.data?.data || resp.data?.data?.data || resp.data
        );
      } catch (err) {
        console.warn("Failed to load timetable", err);
        if (mounted) setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [id]);

  const windowWidth = Dimensions.get("window").width;

  const { timeSlots, days, daySlotMap } = useMemo(() => {
    const slotsSet = new Set<string>();
    const d: string[] = [];
    const map: Record<string, Record<string, any>> = {};
    if (data?.dayTimeTable && Array.isArray(data.dayTimeTable)) {
      data.dayTimeTable.forEach((day: any) => {
        const dayName = day.dayName || day.day || "Unknown";
        d.push(dayName);
        map[dayName] = {};
        (day.tsd || []).forEach((slot: any) => {
          const timeKey = formatTime(slot.hour, slot.minute);
          slotsSet.add(timeKey);
          map[dayName][timeKey] = slot;
        });
      });
    }
    const times = Array.from(slotsSet).sort((a, b) => {
      const [ah, am] = a.split(":").map(Number);
      const [bh, bm] = b.split(":").map(Number);
      if (ah !== bh) return ah - bh;
      return am - bm;
    });
    return { timeSlots: times, days: d, daySlotMap: map };
  }, [data]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text>No timetable found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title={data.className || data.classId || "Class Timetable"}
          subtitle={data.divisionName || data.divisionId || data.schoolName || ''}
          titleStyle={styles.appbarTitle}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <View>
              <Text style={styles.titleText}>{data.className || 'Class'}</Text>
              <View style={styles.metaRow}>
                {data.divisionName ? <Chip style={styles.chip} textStyle={styles.chipText}>{data.divisionName}</Chip> : null}
                {data.schoolName ? <Chip style={[styles.chip, styles.chipOutline]} textStyle={styles.chipText}>{data.schoolName}</Chip> : null}
              </View>
            </View>
          </Card.Content>
        </Card>

        <Surface style={styles.tableWrap}>
          <ScrollView horizontal>
            <View>
              {/* Header Row */}
              <View style={[styles.row, styles.headerRow]}>
                <View style={[styles.cell, styles.dayCell]}>
                  <Text style={styles.headerText}>Day / Time</Text>
                </View>
                {timeSlots.map((t) => (
                  <View
                    key={t}
                    style={[
                      styles.cell,
                      { minWidth: Math.max(100, windowWidth / 5) },
                    ]}
                  >
                    <Text style={styles.headerTextBlue}>{t}</Text>
                  </View>
                ))}
              </View>

              {/* Day Rows */}
              {days.map((dayName, idx) => (
                <View key={dayName} style={[styles.row, idx % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
                  <View style={[styles.cell, styles.dayCell]}>
                    <Text style={styles.dayTextBlack}>{dayName}</Text>
                  </View>
                  {timeSlots.map((timeKey) => {
                    const slot = daySlotMap[dayName]
                      ? daySlotMap[dayName][timeKey]
                      : null;
                    return (
                      <TouchableOpacity
                        key={timeKey}
                        style={[styles.cell, styles.slotCell]}
                        activeOpacity={0.8}
                        onPress={() => { /* future: open slot details */ }}
                      >
                        {slot ? (
                          <View style={styles.slotInner}>
                            {slot.subjectName ? (
                              <Chip style={styles.subjectChip} textStyle={styles.subjectChipText}>{slot.subjectName}</Chip>
                            ) : null}
                            {slot.teacherName ? (
                              <Text style={styles.teacherTextBlack} numberOfLines={1}>{slot.teacherName}</Text>
                            ) : null}
                          </View>
                        ) : (
                          <Text style={styles.emptyText}>-</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </Surface>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  appbar: {
    backgroundColor: '#0b5fff',
  },
  appbarTitle: {
    color: '#ffffff',
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerCard: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  chip: {
    backgroundColor: '#e8f0ff',
    marginRight: 6,
  },
  chipOutline: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#0b5fff',
  },
  chipText: {
    color: '#0b5fff',
    fontWeight: '600',
  },
  tableWrap: {
    borderRadius: 8,
    padding: 8,
    elevation: 1,
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerRow: {
    backgroundColor: '#f6fbff',
  },
  rowEven: {
    backgroundColor: '#ffffff',
  },
  rowOdd: {
    backgroundColor: '#fbfcff',
  },
  cell: {
    padding: 10,
    minWidth: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCell: {
    minWidth: 140,
    alignItems: 'flex-start',
    paddingLeft: 16,
  },
  slotCell: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  headerText: {
    fontWeight: '700',
  },
  headerTextBlue: {
    fontWeight: '700',
    color: '#0b5fff',
  },
  dayText: {
    fontWeight: '600',
  },
  dayTextBlack: {
    fontWeight: '700',
    color: '#000000',
  },
  slotInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectChip: {
    backgroundColor: '#0b5fff',
    borderRadius: 16,
    paddingHorizontal: 8,
  },
  subjectChipText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  subjectText: {
    fontWeight: '600',
  },
  teacherText: {
    color: '#000000',
    fontSize: 12,
  },
  teacherTextBlack: {
    color: '#0b1b2d',
    fontSize: 12,
  },
  emptyText: {
    color: '#bfc9d9',
  },
});

export default TimetableView;
