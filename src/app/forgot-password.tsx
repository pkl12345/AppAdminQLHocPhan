
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { forgotPassword } from "../../services/auth";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập địa chỉ email.");
      return;
    }

    try {
      setLoading(true);

      await forgotPassword(email.trim());

      Alert.alert(
        "Thành công",
        "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.",
        [
          {
            text: "Đăng nhập",
            onPress: () => router.replace("/login"),
          },
        ]
      );
    } catch (error: any) {
      let message = "Không thể gửi email đặt lại mật khẩu.";

      if (error.code === "auth/user-not-found") {
        message = "Email này chưa được đăng ký.";
      } else if (error.code === "auth/invalid-email") {
        message = "Địa chỉ email không hợp lệ.";
      } else if (error.code === "auth/too-many-requests") {
        message = "Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.";
      }

      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔐</Text>
        </View>

        <Text style={styles.title}>Quên mật khẩu?</Text>

        <Text style={styles.description}>
          Đừng lo lắng! Hãy nhập email đã đăng ký.
          Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu cho bạn.
        </Text>

        <Text style={styles.label}>Địa chỉ email</Text>

        <TextInput
          style={styles.input}
          placeholder="Nhập email của bạn"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Gửi yêu cầu đặt lại mật khẩu</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/login")}
          disabled={loading}
        >
          <Text style={styles.backText}>← Quay lại đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    padding: 24,
    alignItems: "center",
  },
  content: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  icon: {
    fontSize: 34,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E293B",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: "#64748B",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#1E293B",
    backgroundColor: "#FFFFFF",
  },
  button: {
    height: 52,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  backButton: {
    alignItems: "center",
    marginTop: 22,
  },
  backText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
});
