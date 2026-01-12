import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 簡化的 Vite 設定，移除了不必要的插件以確保穩定啟動
export default defineConfig({
  plugins: [react()],
})