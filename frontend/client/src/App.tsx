/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAuthStore } from './store/useAuthStore';
import Splash from './components/Splash';
import Login from './components/Login';
import OtpVerify from './components/OtpVerify';
import Dashboard from './components/Dashboard';

export default function App() {
  const view = useAuthStore((state) => state.view);

  // Render correct component based on view state
  switch (view) {
    case 'splash':
      return <Splash />;
    case 'login':
      return <Login />;
    case 'otp':
      return <OtpVerify />;
    case 'dashboard':
      return <Dashboard />;
    default:
      return <Splash />;
  }
}

