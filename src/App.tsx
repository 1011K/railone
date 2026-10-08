/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ThemeProvider } from './components/ThemeContext';
import { AuthorityProvider } from './components/AuthorityContext';
import { MobileDeviceSimulator } from './components/MobileDeviceSimulator';

export default function App() {
  return (
    <ThemeProvider>
      <AuthorityProvider>
        <MobileDeviceSimulator />
      </AuthorityProvider>
    </ThemeProvider>
  );
}
