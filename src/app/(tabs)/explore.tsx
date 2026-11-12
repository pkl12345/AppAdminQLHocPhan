
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  Lecturer,
  subscribeLecturers,
} from "../../../services/lecturers";

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWideLayout = width >= 1100;
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeLecturers(
      (data) => {
        setLecturers(data);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("Lỗi tải dữ liệu:", err);
        setError("Không thể tải dữ liệu giảng viên.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const totalLecturers = lecturers.length;

  const totalClasses = lecturers.reduce(
    (total, lecturer) =>
      total + (Number(lecturer.SumClass) || 0),
    0
  );

  const averageClasses =
    totalLecturers > 0
      ? (totalClasses / totalLecturers).toFixed(1)
      : "0";

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 72 }}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Thống kê</Text>
          <Text style={styles.subtitle}>
            Tổng quan dữ liệu giảng viên trong hệ thống
          </Text>

          <View
            style={[
              styles.metricsGrid,
              isWideLayout && styles.metricsGridWide,
            ]}
          >
            <View
              style={[
                styles.card,
                isWideLayout && styles.cardWide,
              ]}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: "#DBEAFE" },
                ]}
              >
                <Text style={styles.icon}>👨‍🏫</Text>
              </View>

              <Text style={styles.cardLabel}>
                Tổng số giảng viên
              </Text>
              <Text style={styles.cardValue}>
                {totalLecturers}
              </Text>
              <Text style={styles.cardDescription}>
                Giảng viên trong hệ thống
              </Text>
            </View>

            <View
              style={[
                styles.card,
                isWideLayout && styles.cardWide,
              ]}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: "#DCFCE7" },
                ]}
              >
                <Text style={styles.icon}>📚</Text>
              </View>

              <Text style={styles.cardLabel}>
                Tổng số lớp phụ trách
              </Text>
              <Text style={styles.cardValue}>
                {totalClasses}
              </Text>
              <Text style={styles.cardDescription}>
                Tổng số lớp của tất cả giảng viên
              </Text>
            </View>

            <View
              style={[
                styles.card,
                isWideLayout && styles.cardWide,
              ]}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: "#FEF3C7" },
                ]}
              >
                <Text style={styles.icon}>📊</Text>
              </View>

              <Text style={styles.cardLabel}>
                Số lớp trung bình / giảng viên
              </Text>
              <Text style={styles.cardValue}>
                {averageClasses}
              </Text>
              <Text style={styles.cardDescription}>
                Số lớp trung bình mỗi giảng viên phụ trách
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Dữ liệu được cập nhật trực tiếp từ Firebase Firestore.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    padding: 20,
  },
  metricsGrid: {
    width: "100%",
  },
  metricsGridWide: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 14,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 15,
    textAlign: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 0,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 6,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardWide: {
    width: "31.5%",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  icon: {
    fontSize: 24,
  },
  cardLabel: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },
  cardValue: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#2563EB",
    marginTop: 8,
  },
  cardDescription: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 6,
  },
  footer: {
    marginTop: 8,
    padding: 14,
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
  },
  footerText: {
    fontSize: 12,
    color: "#475569",
    textAlign: "center",
  },
});
