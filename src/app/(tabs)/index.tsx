
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  createLecturer,
  deleteLecturer,
  Lecturer,
  LecturerInput,
  subscribeLecturers,
  updateLecturer,
} from "../../../services/lecturers";

import { logout } from "../../../services/auth";
import { uploadLecturerImage } from "../../../services/cloudinary";

export default function LecturerListScreen() {
  // const router = useRouter();
  const [imageUri, setImageUri] = useState("");
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingLecturer, setEditingLecturer] =
    useState<Lecturer | null>(null);

  const [IDGV, setIDGV] = useState("");
  const [Fullname, setFullname] = useState("");
  const [SumClass, setSumClass] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeLecturers(
      (data) => {
        setLecturers(data);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("Lỗi lấy danh sách giảng viên:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      Alert.alert("Lỗi", "Đăng xuất không thành công.");
    }
  };

  const resetForm = () => {
    setIDGV("");
    setFullname("");
    setSumClass("");
    setImageUri("");
    setEditingLecturer(null);
  };

  const openAddForm = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditForm = (item: Lecturer) => {
    setEditingLecturer(item);
    setIDGV(item.IDGV);
    setFullname(item.Fullname);
    setSumClass(String(item.SumClass));
    setImageUri(item.Image);
    setModalVisible(true);
  };

  const chooseImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Quyền truy cập",
        "Bạn cần cho phép ứng dụng truy cập thư viện ảnh."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!IDGV.trim() || !Fullname.trim() || !SumClass.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    const classNumber = Number(SumClass);

    if (
      !Number.isInteger(classNumber) ||
      classNumber < 0
    ) {
      Alert.alert(
        "Thông báo",
        "Số lớp phải là số nguyên không âm."
      );
      return;
    }

    try {
      setSaving(true);

      let imageUrl = imageUri;

// Nếu là ảnh mới chọn từ thiết bị thì upload lên Cloudinary
if (imageUri && imageUri.startsWith("file://")) {
  imageUrl = await uploadLecturerImage(imageUri);
}

      const data: LecturerInput = {
        IDGV: IDGV.trim(),
        Fullname: Fullname.trim(),
        Image: imageUrl,
        SumClass: classNumber,
      };

      if (editingLecturer) {
        await updateLecturer(editingLecturer.id, data);
        Alert.alert("Thành công", "Đã cập nhật giảng viên.");
      } else {
        await createLecturer(data);
        Alert.alert("Thành công", "Đã thêm giảng viên.");
      }

      setModalVisible(false);
      resetForm();
    } catch (err: any) {
      Alert.alert(
        "Lỗi",
        err.message || "Không thể lưu thông tin giảng viên."
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (item: Lecturer) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa giảng viên ${item.Fullname}?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteLecturer(item.id);
              Alert.alert("Thành công", "Đã xóa giảng viên.");
            } catch (err: any) {
              Alert.alert(
                "Lỗi",
                err.message || "Không thể xóa giảng viên."
              );
            }
          },
        },
      ]
    );
  };

  const filteredLecturers = lecturers.filter((item) => {
    const keyword = search.trim().toLowerCase();

    return (
      item.IDGV.toLowerCase().includes(keyword) ||
      item.Fullname.toLowerCase().includes(keyword)
    );
  });

  const renderLecturer = ({ item }: { item: Lecturer }) => (
    <View style={styles.card}>
      {item.Image ? (
        <Image source={{ uri: item.Image }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarPlaceholderText}>
            {item.Fullname?.charAt(0)?.toUpperCase() || "?"}
          </Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name}>{item.Fullname}</Text>
        <Text style={styles.code}>Mã giảng viên: {item.IDGV}</Text>

        <View style={styles.classBadge}>
          <Text style={styles.classText}>
            Tổng số lớp: {item.SumClass}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditForm(item)}
          >
            <Text style={styles.editText}>✏ Sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => confirmDelete(item)}
          >
            <Text style={styles.deleteText}>✕ Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      <View style={styles.pageContent}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.eyebrow}>LECTURER MANAGEMENT</Text>
              <Text style={styles.title}>Quản lý giảng viên</Text>
              <Text style={styles.subtitle}>
                Danh sách thông tin giảng viên
              </Text>
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.summary}>
          <View>
            <Text style={styles.summaryLabel}>
              Tổng số giảng viên
            </Text>
            <Text style={styles.summaryNumber}>
              {lecturers.length}
            </Text>
          </View>
          <Text style={styles.summaryIcon}>👨‍🏫</Text>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo mã hoặc tên giảng viên..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddForm}
        >
          <Text style={styles.addButtonText}>＋ Thêm giảng viên</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>
              Không thể tải dữ liệu giảng viên.
            </Text>
            <Text style={styles.errorDetail}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredLecturers}
            keyExtractor={(item) => item.id}
            renderItem={renderLecturer}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>
                  Chưa có giảng viên
                </Text>
                <Text style={styles.emptyText}>
                  Nhấn "Thêm giảng viên" để bắt đầu.
                </Text>
              </View>
            }
          />
        )}
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!saving) {
            setModalVisible(false);
            resetForm();
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.modalTitle}>
                {editingLecturer ? "Sửa giảng viên" : "Thêm giảng viên"}
              </Text>

              <Text style={styles.label}>Mã giảng viên</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập mã giảng viên"
                value={IDGV}
                onChangeText={setIDGV}
                editable={!saving}
              />

              <Text style={styles.label}>Họ và tên</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập họ và tên"
                value={Fullname}
                onChangeText={setFullname}
                editable={!saving}
              />

              <Text style={styles.label}>Tổng số lớp</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập số lớp"
                value={SumClass}
                onChangeText={setSumClass}
                keyboardType="number-pad"
                editable={!saving}
              />

              <Text style={styles.label}>Ảnh giảng viên</Text>

              <TouchableOpacity
                style={styles.imagePicker}
                onPress={chooseImage}
                disabled={saving}
              >
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.previewImage}
                  />
                ) : (
                  <Text style={styles.imagePickerText}>
                    ＋ Chọn ảnh từ thiết bị
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                  disabled={saving}
                >
                  <Text style={styles.cancelText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveText}>Lưu thông tin</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FB",
    paddingBottom: 56,
  },
  pageContent: {
    flex: 1,
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  eyebrow: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  title: {
    color: "#172554",
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 8,
  },
  subtitle: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 6,
  },
  logoutButton: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  logoutText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "bold",
  },
  summary: {
    backgroundColor: "#2563EB",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    color: "#DBEAFE",
    fontSize: 13,
  },
  summaryNumber: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 5,
  },
  summaryIcon: {
    fontSize: 38,
  },
  searchInput: {
    height: 48,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    color: "#1E293B",
  },
  addButton: {
    backgroundColor: "#2563EB",
    marginHorizontal: 20,
    marginBottom: 14,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2563EB",
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    color: "#172554",
    fontSize: 16,
    fontWeight: "bold",
  },
  code: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 6,
  },
  classBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
    marginTop: 8,
  },
  classText: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
  },
  editButton: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
  },
  editText: {
    color: "#1D4ED8",
    fontSize: 12,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
  },
  deleteText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    color: "#64748B",
    marginTop: 12,
  },
  errorText: {
    color: "#DC2626",
    fontWeight: "bold",
    textAlign: "center",
  },
  errorDetail: {
    color: "#64748B",
    marginTop: 8,
    textAlign: "center",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 45,
  },
  emptyTitle: {
    color: "#172554",
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 15,
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 13,
    marginTop: 7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    maxHeight: "90%",
  },
  modalTitle: {
    color: "#172554",
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 22,
    textAlign: "center",
  },
  label: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 13,
    marginBottom: 17,
    color: "#1E293B",
  },
  imagePicker: {
    height: 150,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#F8FAFC",
  },
  imagePickerText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 5,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: "#334155",
    fontWeight: "bold",
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
