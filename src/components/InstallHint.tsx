import { useEffect, useState } from 'react';

export function InstallHint() {
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator &&
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const isIos =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIos(isIos);
    setShow(!standalone && (coarse || isIos));
  }, []);

  if (!show) return null;

  return (
    <article className="card mt-24">
      <div className="itype">Install Canon</div>
      <p>
        {ios
          ? 'On iPad, open Share and choose Add to Home Screen. The brain stays available offline.'
          : 'Install Canon from the browser menu to run it as an app on this device.'}
      </p>
    </article>
  );
}
