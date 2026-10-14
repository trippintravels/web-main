import { useEffect, useRef } from 'react';
import { SHELL_HTML, initApp } from './app.js';

export default function App() {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;   // guard StrictMode double-invoke
    ran.current = true;
    initApp();
  }, []);
  return <div id="dash-root" dangerouslySetInnerHTML={{ __html: SHELL_HTML }} />;
}
