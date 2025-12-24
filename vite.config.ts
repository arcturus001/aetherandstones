/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker';

// https://vitejs.dev/config/
export default defineConfig(({ command, isPreview }) => {
  return {
    server: {
      port: 3000,
      host: true
    },
    plugins: [
      // mkcert(), // Temporarily disabled for HTTP access
      react(),
      command === 'serve' && !isPreview && checker({ typescript: true, enableBuild: false })
    ],
    build: {
      target: ['es2022'],
      // Lightning CSS produces much a smaller CSS bundle than the default minifier.
      cssMinify: 'lightningcss',
      rollupOptions: {
        output: {
          // Standard code splitting configuration
        }
      }
    }
  };
});