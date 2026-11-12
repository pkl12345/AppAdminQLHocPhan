
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";

export type Lecturer = {
  id: string;
  IDGV: string;
  Fullname: string;
  Image: string;
  SumClass: number;
};

export type LecturerInput = Omit<Lecturer, "id">;

const lecturersRef = collection(db, "GiangVien");

// Lắng nghe danh sách giảng viên theo thời gian thực
export function subscribeLecturers(
  callback: (lecturers: Lecturer[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    lecturersRef,
    (snapshot) => {
      const lecturers: Lecturer[] = snapshot.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<Lecturer, "id">),
      }));

      callback(lecturers);
    },
    (error) => {
      onError?.(error);
    }
  );
}

// Kiểm tra dữ liệu trước khi ghi Firestore
function validateLecturer(data: LecturerInput) {
  if (!data.IDGV.trim()) {
    throw new Error("Vui lòng nhập mã giảng viên.");
  }

  if (!data.Fullname.trim()) {
    throw new Error("Vui lòng nhập họ tên giảng viên.");
  }

  if (!Number.isFinite(data.SumClass) || data.SumClass < 0) {
    throw new Error("Số lớp phải là số không âm.");
  }
}

// Thêm giảng viên
export async function createLecturer(data: LecturerInput) {
  validateLecturer(data);

  return addDoc(lecturersRef, {
    IDGV: data.IDGV.trim(),
    Fullname: data.Fullname.trim(),
    Image: data.Image,
    SumClass: data.SumClass,
  });
}

// Cập nhật giảng viên
export async function updateLecturer(
  id: string,
  data: LecturerInput
) {
  validateLecturer(data);

  return updateDoc(doc(db, "GiangVien", id), {
    IDGV: data.IDGV.trim(),
    Fullname: data.Fullname.trim(),
    Image: data.Image,
    SumClass: data.SumClass,
  });
}

// Xóa giảng viên
export function deleteLecturer(id: string) {
  return deleteDoc(doc(db, "GiangVien", id));
}
