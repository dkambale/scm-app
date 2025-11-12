import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import RNDashboardCard from "../../components/common/RNDashboardCard";
import { BarChart } from "react-native-chart-kit";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import { userDetails } from "../../utils/apiService";
// types/dashboard might not exist in all setups; use any for the fetched shapes here
import { apiService } from "../../api/apiService";

const screenWidth = Dimensions.get("window").width;
const CHART_WIDTH = screenWidth - 48; // Card width minus padding

// We'll fetch real data from the assignments endpoint and aggregate by category

const TeacherAssignmentChart: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const user = useSelector((state: any) => state.user?.user);

  const [rawData, setRawData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Ensure we have a user (try Redux first, then storage)
        
         const u = await userDetails.getUser();
          console.log("TeacherAssignmentChart: fetched user from storage", u);
        const accountId = u?.accountId;
        const schoolId = u?.schoolId;
        if (!accountId || !schoolId) {
          if (mounted) {
            setRawData([]);
            setLoading(false);
          }
          return;
        }

        const resp = await apiService.api.get(
          `api/assignments/assignmentList/${accountId}/school/${schoolId}`
        );
        const items: any[] = resp?.data ?? resp ?? [];

        // Aggregate into { category, total, graded }
        const map = new Map<
          string,
          { category: string; total: number; graded: number }
        >();
        items.forEach((it: any) => {
          const key = it.category || it.subject || it.subjectName || "Other";
          const existing = map.get(key) ?? {
            category: key,
            total: 0,
            graded: 0,
          };
          existing.total += 1;
          const isGraded = !!(
            it.graded ||
            it.isGraded ||
            (it.status && String(it.status).toLowerCase().includes("grade"))
          );
          if (isGraded) existing.graded += 1;
          map.set(key, existing);
        });

        const aggregated = Array.from(map.values());
        if (mounted) setRawData(aggregated);
      } catch (err) {
        console.warn("TeacherAssignmentChart: fetch failed", err);
        if (mounted) setError("Failed to load assignment data");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, [user]);

  // Memoize and format chart data for react-native-chart-kit
  const chartData = useMemo(() => {
    if (!rawData || rawData.length === 0) return null;

    const categories = rawData.map((d) => d.category);
    const gradedData = rawData.map((d) => d.graded);
    const outstandingData = rawData.map((d) => d.total - d.graded);

    return {
      labels: categories,
      datasets: [
        {
          data: gradedData,
          color: () => "#4CAF50", // Success Green
          barPercentage: 1,
        },
        {
          data: outstandingData,
          color: () => "#FF9800", // Warning Orange
          barPercentage: 1,
        },
      ],
      legend: [t("teacher.graded"), t("teacher.outstanding")],
    };
  }, [rawData, t]);

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    barPercentage: 0.5,
    fillShadowGradient: "#ffffff",
    fillShadowGradientOpacity: 0.5,
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <RNDashboardCard title={t("teacher.assignmentStatus")}>
        <ActivityIndicator size="large" color="#1976d2" style={styles.loader} />
      </RNDashboardCard>
    );
  }

  if (error) {
    return (
      <RNDashboardCard title={t("teacher.assignmentStatus")}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </RNDashboardCard>
    );
  }

  if (!chartData) {
    return (
      <RNDashboardCard title={t("teacher.assignmentStatus")}>
        <Text style={styles.noDataText}>{t("admin.noAssignmentData")}</Text>
      </RNDashboardCard>
    );
  }

  return (
    <RNDashboardCard title={t("teacher.assignmentStatus")}>
      <View style={styles.chartWrapper}>
        <BarChart
          data={chartData}
          width={CHART_WIDTH - 32} // Inner padding adjustment
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          verticalLabelRotation={15}
          yAxisLabel=""
          yAxisSuffix=""
          // Since stacked property isn't directly exposed in BarChart data, we rely on the implementation
          // or may need to switch to a custom SVG/chart solution if stacking is required.
          // For simplicity, this acts as a basic bar chart showing two series side-by-side.
        />
      </View>
      <View style={styles.legendContainer}>
        {chartData.legend?.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: index === 0 ? "#4CAF50" : "#FF9800" },
              ]}
            />
            <Text style={styles.legendText}>{item}</Text>
          </View>
        ))}
      </View>
    </RNDashboardCard>
  );
};

const styles = StyleSheet.create({
  loader: {
    paddingVertical: 20,
  },
  errorText: {
    color: "#d32f2f",
    textAlign: "center",
    paddingVertical: 10,
  },
  noDataText: {
    textAlign: "center",
    color: "#6c757d",
    paddingVertical: 10,
  },
  chartWrapper: {
    alignItems: "center",
    marginVertical: 10,
    // The chart library sometimes ignores internal padding, adjusting here:
    marginHorizontal: -16,
  },
  chart: {
    borderRadius: 8,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#333",
  },
});

export default TeacherAssignmentChart;
