import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  plugins: [react()],
  root: 'src',
  define: {
    'process.env.VITE_AIRTABLE_PAT': JSON.stringify(process.env.VITE_AIRTABLE_PAT),
    'process.env.VITE_AIRTABLE_BASE_ID': JSON.stringify(process.env.VITE_AIRTABLE_BASE_ID),
    'process.env.VITE_AIRTABLE_TABLE_ID': JSON.stringify(process.env.VITE_AIRTABLE_TABLE_ID),
  }
})