'use client';

import { pdfjs } from 'react-pdf';

type Props = {
    children: React.ReactNode;
}

export const ViwerSetting = ({ children }: Props) => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString();

    return <>{children}</>;
};