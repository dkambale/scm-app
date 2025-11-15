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

  // Compute columns by `sequence` so the timetable shows slots in the configured order
  const { sequences, days, daySlotMap, seqToTime } = useMemo(() => {
    // Use numeric sequence keys and keep the earliest time seen for a sequence
    const seqSet = new Set<number>();
    const d: string[] = [];
    const map: Record<string, Record<number, any>> = {};
    const seqTimeMap: Record<number, string> = {};
    const seqTimeMin: Record<number, number> = {};

    if (data?.dayTimeTable && Array.isArray(data.dayTimeTable)) {
      data.dayTimeTable.forEach((day: any) => {
        const dayName = day.dayName || day.day || "Unknown";
        d.push(dayName);
        map[dayName] = {};
        (day.tsd || []).forEach((slot: any) => {
          const rawSeq = slot.sequence ?? 0;
          const seq = Number(rawSeq);
          // ignore invalid sequences
          if (Number.isNaN(seq)) return;
          // only positive sequences make sense as ordered periods
          if (seq <= 0) return;

          seqSet.add(seq);
          map[dayName][seq] = slot;

          // compute minutes for earliest-time selection
          const h = Number(slot.hour || 0);
          const m = Number(slot.minute || 0);
          const minutes =
            Number.isNaN(h) || Number.isNaN(m)
              ? Number.POSITIVE_INFINITY
              : h * 60 + m;

          if (seqTimeMin[seq] === undefined || minutes < seqTimeMin[seq]) {
            seqTimeMin[seq] = minutes;
            seqTimeMap[seq] = formatTime(slot.hour, slot.minute) || "";
          }
        });
      });
    }

    // Sort sequences numerically ascending and produce the final arrays/maps
    const seqs = Array.from(seqSet).sort((a, b) => a - b);
    return { sequences: seqs, days: d, daySlotMap: map, seqToTime: seqTimeMap };
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
          subtitle={
            data.divisionName || data.divisionId || data.schoolName || ""
          }
          titleStyle={styles.appbarTitle}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <View>
              <Text style={styles.titleText}>{data.className || "Class"}</Text>
              <View style={styles.metaRow}>
                {data.divisionName ? (
                  <Chip style={styles.chip} textStyle={styles.chipText}>
                    {data.divisionName}
                  </Chip>
                ) : null}
                {data.schoolName ? (
                  <Chip
                    style={[styles.chip, styles.chipOutline]}
                    textStyle={styles.chipText}
                  >
                    {data.schoolName}
                  </Chip>
                ) : null}
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
                {(() => {
                  // compute column width so header and rows align exactly
                  const dayCellWidth = 140;
                  const available = Math.max(
                    windowWidth,
                    dayCellWidth + sequences.length * 120
                  );
                  const colWidth =
                    sequences.length > 0
                      ? Math.max(
                          100,
                          Math.floor(
                            (available - dayCellWidth) / sequences.length
                          )
                        )
                      : 120;
                  return sequences.map((seq) => {
                    const t = seqToTime[seq] ?? "";
                    const label = `P${seq}${t ? ` (${t})` : ""}`;
                    return (
                      <View
                        key={String(seq)}
                        style={[styles.cell, { width: colWidth }]}
                      >
                        <Text style={styles.headerTextBlue} numberOfLines={1}>
                          {label}
                        </Text>
                      </View>
                    );
                  });
                })()}
              </View>

              {/* Day Rows */}
              {days.map((dayName, idx) => (
                <View
                  key={dayName}
                  style={[
                    styles.row,
                    idx % 2 === 0 ? styles.rowEven : styles.rowOdd,
                  ]}
                >
                  <View style={[styles.cell, styles.dayCell]}>
                    <Text style={styles.dayTextBlack}>{dayName}</Text>
                  </View>
                  {(() => {
                    const dayCellWidth = 140;
                    const available = Math.max(
                      windowWidth,
                      dayCellWidth + sequences.length * 120
                    );
                    const colWidth =
                      sequences.length > 0
                        ? Math.max(
                            100,
                            Math.floor(
                              (available - dayCellWidth) / sequences.length
                            )
                          )
                        : 120;
                    return sequences.map((seq) => {
                      const slot = daySlotMap[dayName]
                        ? daySlotMap[dayName][seq]
                        : null;
                      return (
                        <TouchableOpacity
                          key={String(seq)}
                          style={[
                            styles.cell,
                            styles.slotCell,
                            { width: colWidth },
                          ]}
                          activeOpacity={0.8}
                          onPress={() => {
                            /* future: open slot details */
                          }}
                        >
                          {slot ? (
                            <View style={styles.slotInner}>
                              {slot.subjectName ? (
                                <Chip
                                  style={styles.subjectChip}
                                  textStyle={styles.subjectChipText}
                                >
                                  {slot.subjectName}
                                </Chip>
                              ) : null}
                              {slot.teacherName ? (
                                <Text
                                  style={styles.teacherTextBlack}
                                  numberOfLines={1}
                                >
                                  {slot.teacherName}
                                </Text>
                              ) : null}
                            </View>
                          ) : (
                            <Text style={styles.emptyText}>-</Text>
                          )}
                        </TouchableOpacity>
                      );
                    });
                  })()}
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
    backgroundColor: "#ffffff",
  },
  appbar: {
    backgroundColor: "#0b5fff",
  },
  appbarTitle: {
    color: "#ffffff",
    fontWeight: "700",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headerCard: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000000",
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  chip: {
    backgroundColor: "#e8f0ff",
    marginRight: 6,
  },
  chipOutline: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#0b5fff",
  },
  chipText: {
    color: "#0b5fff",
    fontWeight: "600",
  },
  tableWrap: {
    borderRadius: 8,
    padding: 8,
    elevation: 1,
    backgroundColor: "#ffffff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerRow: {
    backgroundColor: "#f6fbff",
  },
  rowEven: {
    backgroundColor: "#ffffff",
  },
  rowOdd: {
    backgroundColor: "#fbfcff",
  },

  dayCell: {
    minWidth: 140,
    alignItems: "flex-start",
    paddingLeft: 16,
  },
  slotCell: {
    alignItems: "center",
    paddingVertical: 12,
  },
  headerText: {
    fontWeight: "700",
  },
  headerTextBlue: {
    fontWeight: "700",
    color: "#0b5fff",
  },
  dayText: {
    fontWeight: "600",
  },
  dayTextBlack: {
    fontWeight: "700",
    color: "#000000",
  },
  slotInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  // column divider to keep grid aligned
  cell: {
    padding: 10,
    minWidth: 120,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#f0f0f0",
  },
  subjectChip: {
    backgroundColor: "#0b5fff",
    borderRadius: 16,
    paddingHorizontal: 8,
  },
  subjectChipText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  subjectText: {
    fontWeight: "600",
  },
  teacherText: {
    color: "#000000",
    fontSize: 12,
  },
  teacherTextBlack: {
    color: "#0b1b2d",
    fontSize: 12,
  },
  emptyText: {
    color: "#bfc9d9",
  },
});

export default TimetableView;
