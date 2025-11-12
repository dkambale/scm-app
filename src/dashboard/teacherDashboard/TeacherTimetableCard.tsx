import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import RNDashboardCard from "../../components/common/RNDashboardCard";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import { apiService } from "../../api/apiService";
import { userDetails } from "../../utils/apiService";
// TimetableEntry type omitted to avoid type resolution issues; using any for fetched items

// --- MOCK DATA/API SIMULATION ---
// We'll fetch today's timetable from the timeslot API
// --- END MOCK DATA/API SIMULATION ---

const TimetableItem: React.FC<{ item: any }> = ({ item }) => (
  <View style={styles.item}>
    <View style={styles.timeBlock}>
      <MaterialIcons
        name="access-time"
        size={14}
        color="#6c757d"
        style={styles.icon}
      />
      <Text style={styles.timeText}>{item.time}</Text>
    </View>
    <View style={styles.details}>
      <Text style={styles.subjectText}>{item.subject}</Text>
      <Text style={styles.classText}>{`${item.class} - ${item.room}`}</Text>
    </View>
  </View>
);

const TeacherTimetableCard: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const user = useSelector((state: any) => state.user?.user);
  const [loading, setLoading] = useState(true);
  const [todayTimetable, setTodayTimetable] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchTimetable = async () => {
      setLoading(true);
      setError(null);
      try {
        // Ensure we have user data: try Redux first, then storage-based helper
        let u = user;
        if (!u) {
          u = await userDetails.getUser();
        }
        if (!u || !u.accountId || !u.id) {
          if (mounted) setLoading(false);
          return;
        }

        const dayName = new Date().toLocaleDateString("en-US", {
          weekday: "long",
        });
        const resp = await apiService.api.get(
          `/api/timetable/timeslot/day/${dayName}/${u.accountId}/${u.id}`
        );
        const items: any[] = resp?.data ?? resp ?? [];

        // Map API shape into the UI-friendly TimetableEntry shape
        const mapped = (items || []).map((slot: any, idx: number) => ({
          id: slot.id || slot._id || String(idx),
          time:
            slot.time ||
            (slot.startTime && slot.endTime
              ? `${slot.startTime} - ${slot.endTime}`
              : slot.startTime || ""),
          subject:
            slot.subjectName || slot.subject || slot.subjectTitle || "N/A",
          class: slot.className || slot.class || slot.grade || "",
          room: slot.room || slot.location || "",
        }));

        if (mounted) setTodayTimetable(mapped);
      } catch (err) {
        console.warn("TeacherTimetableCard: fetch failed", err);
        if (mounted) setError("Failed to load timetable");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTimetable();
    return () => {
      mounted = false;
    };
  }, [user]);

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="event-available" size={30} color="#6c757d" />
      <Text style={styles.emptyText}>
        {t("teacherDashboard.noClassesToday")}
      </Text>
    </View>
  );

  return (
    <RNDashboardCard title={t("teacherDashboard.timetableTitle")}>
      {loading ? (
        <ActivityIndicator size="large" color="#1976d2" />
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : todayTimetable.length > 0 ? (
        <FlatList
          data={todayTimetable}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TimetableItem item={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          scrollEnabled={false}
        />
      ) : (
        renderEmptyList()
      )}
    </RNDashboardCard>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  timeBlock: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
    marginRight: 15,
  },
  icon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  details: {
    flex: 1,
  },
  subjectText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1976d2",
  },
  classText: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    marginTop: 8,
    color: "#6c757d",
    fontSize: 14,
  },
});

export default TeacherTimetableCard;
