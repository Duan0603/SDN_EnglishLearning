---
trigger: glob
glob: "**/*.{js,jsx,ts,tsx,css,scss,html,vue,svelte,dart,swift,kt,xml}"
---

# FRONTEND.MD - Mobile Mastery (React Native)

> **Mục tiêu**: Xây dựng ứng dụng di động mượt mà, chuẩn UX/UI Mobile và hiệu năng cao.

---

## 📱 1. MOBILE UX/UI (Ref: .shared/ui-ux-pro-max/AESTHETICS.md)

1. **Touch Targets**: Button tối thiểu 44x44px. Khoảng cách giữa các phần tử interactive đủ rộng để tránh click nhầm.
2. **Safe Areas**: Sử dụng `SafeAreaView` hoặc `react-native-safe-area-context` để tránh notch và home indicator.
3. **Feedback**: Sử dụng `Pressable` với `android_ripple` hoặc `Opacity` feedback. Mọi hành động phải có phản hồi thị giác.
4. **Layout**: Ưu tiên Flexbox. Tránh hardcode `width`/`height` theo pixel, sử dụng `%` hoặc `flex`.

---

## ⚡ 2. PERFORMANCE & ASSETS

1. **Image Optimization**: Sử dụng `react-native-fast-image` cho các danh sách dài. Tránh load ảnh gốc quá lớn.
2. **List Rendering**: Luôn sử dụng `FlatList` hoặc `SectionList` với `memo` cho component con. Tránh dùng `ScrollView` cho danh sách dài.
3. **Audio recording**: Tích hợp `react-native-audio-recorder-player` hoặc `expo-av` cho phần Speaking. Đảm bảo xin quyền (Permissions) đúng cách.
4. **Bundle Size**: Hạn chế sử dụng quá nhiều thư viện nặng. Ưu tiên các thư viện nhỏ gọn.

---

## 🛡️ 3. STATE & NAVIGATION

1. **State Management**: Sử dụng **Zustand** (ưu tiên) hoặc Redux Toolkit cho Global State. Tách biệt logic API và logic UI.
2. **Navigation**: Sử dụng `React Navigation`. Cấu trúc Stack, Tab, Drawer rõ ràng. Tránh nest quá nhiều navigator.
3. **Secure Storage**: Lưu JWT Token trong `react-native-encrypted-storage` hoặc `expo-secure-store`. KHÔNG lưu token trong `AsyncStorage` thuần.

---

## 🎧 4. SPECIAL FEATURES (IELTS)

1. **Split-pane**: Sử dụng thư viện hoặc custom flex layout để hiển thị Reading passage và Questions song song (trên Tablet) hoặc dạng Tab (trên Mobile).
2. **Audio Sync**: Theo dõi `position` của audio player để highlight script hoặc đồng bộ câu hỏi.

