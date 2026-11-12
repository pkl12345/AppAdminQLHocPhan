
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { login } from "../../services/auth";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập email và mật khẩu.");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      let message = "Đăng nhập thất bại. Vui lòng thử lại.";

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        message = "Email hoặc mật khẩu không chính xác.";
      } else if (error.code === "auth/invalid-email") {
        message = "Email không hợp lệ.";
      } else if (error.code === "auth/too-many-requests") {
        message = "Bạn đã thử quá nhiều lần. Hãy thử lại sau.";
      } else if (error.code === "auth/network-request-failed") {
        message = "Không thể kết nối mạng. Vui lòng kiểm tra Internet.";
      }

      Alert.alert("Đăng nhập", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logo}>
          <Text style={styles.logoText}>A</Text>
        </View>

        <Text style={styles.title}>ADMIN MANAGEMENT</Text>
        <Text style={styles.subtitle}>
          Đăng nhập để quản lý giảng viên
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập email của bạn"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Nhập mật khẩu"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              <Text style={styles.showText}>
                {showPassword ? "Ẩn" : "Hiện"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotButton}
            onPress={() => router.push("/forgot-password")}
            disabled={loading}
          >
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginText}>ĐĂNG NHẬP</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Lecturer Management System
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FB",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 28,
    alignItems: "center",
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "bold",
  },
  title: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#172554",
    textAlign: "center",
  },
  subtitle: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 9,
    marginBottom: 32,
    fontSize: 14,
  },
  form: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderRadius: 18,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
    color: "#1E293B",
  },
  passwordContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    color: "#1E293B",
  },
  showText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: 14,
    marginBottom: 22,
  },
  forgotText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  loginButton: {
    height: 52,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  footer: {
    textAlign: "center",
    color: "#94A3B8",
    marginTop: 28,
    fontSize: 12,
  },
});
