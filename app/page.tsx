import Image from "next/image";

import { FileDropzone } from "@/components/FileDropzone";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background px-4 py-24 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-4xl flex-col items-center text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          Convert Word to PDF{" "}
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Instantly
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          The easiest way to convert your DOCX files to professional PDFs.
          Secure, fast, and free. No registration required.
        </p>

        <div className="mt-12 w-full flex justify-center">
          <FileDropzone />
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center space-y-3 rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">
              Conversion happens in seconds directly in your browser session.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-3 rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">100% Secure</h3>
            <p className="text-sm text-muted-foreground">
              Your files are processed securely and never stored on our servers.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-3 rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">High Quality</h3>
            <p className="text-sm text-muted-foreground">
              Maintain your text integrity during the conversion process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
