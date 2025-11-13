import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import RNDashboardCard from "../components/common/RNDashboardCard";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Birthday } from "../types";
import { getTodayBirthdays } from "../utils/apiService";

// --- MOCK DATA/API SIMULATION ---
// We'll fetch today's birthdays from the apiService.getTodayBirthdays helper

const BirthdayItem: React.FC<{ item: Birthday }> = ({ item }) => (
  <View style={styles.item}>
    <MaterialIcons
      name="cake"
      size={20}
      color="#ffab00"
      style={styles.cakeIcon}
    />
    <View style={styles.details}>
      <Text style={styles.nameText}>{item.name}</Text>
      <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
    </View>

    
    {/* Send Message action */}
    <MaterialIcons name="send" size={20} color="#4caf50" />
  </View>
);

const TodayBirthdaysCard: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const [loading, setLoading] = useState(true);
  const [todayBirthdays, setTodayBirthdays] = useState<Birthday[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTodayBirthdays();
        if (!mounted) return;
        // Normalize items to Birthday[] shape if needed
        const mapped: Birthday[] = (data || []).map((it: any, idx: number) => ({
          id: it.id || it._id || String(idx),
          name:
            it.name ||
            it.fullName ||
            it.userName ||
            it.displayName ||
            "Unknown",
          role: (it.role || it.type || "student").toString(),
        }));
        setTodayBirthdays(mapped);
      } catch (err) {
        console.warn("Failed to load today birthdays", err);
        if (mounted) setError("Failed to load birthdays");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, []);

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="sentiment-satisfied" size={30} color="#6c757d" />
      <Text style={styles.emptyText}>
        {t("teacherDashboard.noBirthdaysToday")}
      </Text>
    </View>
  );

  return (
    <RNDashboardCard title={t("teacherDashboard.birthdaysTitle")}>
      {loading ? (
        <ActivityIndicator size="large" color="#1976d2" />
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : todayBirthdays.length > 0 ? (
        <FlatList
          data={todayBirthdays}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BirthdayItem item={item} />}
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
    justifyContent: "space-between",
  },
  cakeIcon: {
    marginRight: 10,
  },
  details: {
    flex: 1,
  },
  nameText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  roleText: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
    textTransform: "capitalize" as "capitalize", // Explicit casting for type safety
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
    textAlign: "center",
  },
});

export default TodayBirthdaysCard;
